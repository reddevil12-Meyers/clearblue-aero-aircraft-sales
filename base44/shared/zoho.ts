import { secrets } from "base44:runtime";

const TOKEN_URL = "https://accounts.zoho.com/oauth/v2/token";
const API_BASE = "https://www.zohoapis.com/crm/v5";

export async function zohoJson(res) {
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch (_) { return { raw: text, _invalid_json: true }; }
}

async function zohoGet(url, token, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const res = await fetch(url, { headers: { Authorization: `Zoho-oauthtoken ${token}` } });
    const data = await zohoJson(res);
    if (res.ok && !data._invalid_json) return data;
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
      continue;
    }
    throw new Error(`Zoho GET ${url} failed (status ${res.status}): ${JSON.stringify(data).slice(0, 400)}`);
  }
}

let cachedToken = null;
let cachedTokenExpiry = 0;

export async function getZohoAccessToken() {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiry) return cachedToken;
  const refreshToken = secrets.get("ZOHO_REFRESH_TOKEN");
  const clientId = secrets.get("ZOHO_CLIENT_ID");
  const clientSecret = secrets.get("ZOHO_CLIENT_SECRET");
  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error("Zoho OAuth secrets not configured (ZOHO_REFRESH_TOKEN, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET).");
  }
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });
  let data = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const text = await res.text();
    try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { raw: text, error: "invalid_json" }; }
    if (data && data.access_token) break;
    if (attempt < 4) {
      const delay = (data && data.error === "Access Denied") ? 45000 : 5000;
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }
    throw new Error(`Zoho token refresh failed (status ${res.status}): ${JSON.stringify(data).slice(0, 400)}`);
  }
  cachedToken = data.access_token;
  cachedTokenExpiry = now + Math.max(60, (data.expires_in || 3600) - 60) * 1000;
  return cachedToken;
}

const zohoUserCache = {};

// Resolves a Zoho CRM user ID from an email address (for setting record owners).
// Returns null if not found or if the token lacks users.read scope (non-blocking).
export async function getZohoUserIdByEmail(email) {
  if (!email) return null;
  const key = String(email).toLowerCase();
  if (key in zohoUserCache) return zohoUserCache[key];
  try {
    const token = await getZohoAccessToken();
    const data = await zohoGet(`${API_BASE}/users?type=ActiveUsers`, token);
    const users = data.users || [];
    const found = users.find((u) => (u.email || "").toLowerCase() === key);
    const id = found ? found.id : null;
    zohoUserCache[key] = id;
    return id;
  } catch (err) {
    console.log("Zoho user lookup failed (non-blocking):", err.message);
    zohoUserCache[key] = null;
    return null;
  }
}

export async function zohoUpsert(moduleApiName, record, duplicateCheckFields) {
  const token = await getZohoAccessToken();
  const url = `${API_BASE}/${moduleApiName}/upsert`;
  const body = { data: [record] };
  if (duplicateCheckFields && duplicateCheckFields.length) {
    body.duplicate_check_fields = duplicateCheckFields;
  }
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  const first = data?.data?.[0];
  if (!res.ok || !first || first.code !== "SUCCESS") {
    throw new Error(`Zoho upsert to ${moduleApiName} failed: ${JSON.stringify(data)}`);
  }
  return first;
}

export async function findAircraftModuleApiName() {
  const token = await getZohoAccessToken();
  const data = await zohoGet(`${API_BASE}/settings/modules`, token);
  const modules = data.modules || [];
  for (const m of modules) {
    const name = (m.api_name || "").toLowerCase();
    const label = (m.module_name || "").toLowerCase();
    if (name === "aircraft" || name === "aircrafts" || label === "aircraft" || label === "aircrafts") {
      return m.api_name;
    }
  }
  throw new Error("No Aircraft custom module found in Zoho CRM. Create a custom module named 'Aircraft' in Zoho (Setup > Customization > Modules).");
}

export async function getModuleFields(moduleApiName) {
  const token = await getZohoAccessToken();
  const data = await zohoGet(`${API_BASE}/settings/fields?module=${encodeURIComponent(moduleApiName)}`, token);
  return data.fields || [];
}

export async function zohoAddTags(moduleApiName, recordId, tagNames) {
  const token = await getZohoAccessToken();
  // Ensure each tag exists (ignore "already exists" / permission errors), then associate with the record.
  for (const name of tagNames) {
    await fetch(`${API_BASE}/settings/tags?module=${encodeURIComponent(moduleApiName)}`, {
      method: "POST",
      headers: { Authorization: `Zoho-oauthtoken ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ tags: [{ name }] }),
    }).catch(() => {});
  }
  const res = await fetch(`${API_BASE}/${moduleApiName}/${recordId}/actions/add_tags`, {
    method: "POST",
    headers: { Authorization: `Zoho-oauthtoken ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ tags: tagNames.map((name) => ({ name })) }),
  });
  const data = await res.json().catch(() => ({}));
  const first = data?.data?.[0];
  if (!res.ok || !first || first.code !== "SUCCESS") {
    console.log(`Zoho add_tags to ${moduleApiName}/${recordId} did not succeed (${res.status}):`, JSON.stringify(data).slice(0, 500));
  }
  return data;
}

export async function createZohoLead({ first_name, last_name, email, phone, description, tags, ownerEmail }) {
  const record = {};
  if (first_name) record.First_Name = first_name;
  if (last_name) record.Last_Name = last_name;
  if (email) record.Email = email;
  if (phone) record.Phone = phone;
  if (description) record.Description = description;
  record.Lead_Source = "Website";
  if (ownerEmail) {
    try {
      const ownerId = await getZohoUserIdByEmail(ownerEmail);
      if (ownerId) record.Owner = ownerId;
    } catch (e) {
      console.log("Zoho lead owner lookup failed (non-blocking):", e.message);
    }
  }
  const dcf = email ? ["Email"] : [];
  const result = await zohoUpsert("Leads", record, dcf);
  const recordId = result?.details?.id;
  if (tags && tags.length && recordId) {
    try {
      await zohoAddTags("Leads", recordId, tags);
    } catch (tagError) {
      console.log("Zoho tag association failed (non-blocking):", tagError.message);
    }
  }
  return result;
}

export function buildContactRecord(c, base44IdField) {
  const record = {};
  if (c.first_name) record.First_Name = c.first_name;
  record.Last_Name = (c.last_name && c.last_name.trim()) || c.first_name || "(Unknown)";
  if (c.email) record.Email = c.email;
  if (c.phone) record.Phone = c.phone;
  if (c.address) record.Mailing_Street = c.address;
  if (c.city) record.Mailing_City = c.city;
  if (c.state) record.Mailing_State = c.state;
  if (c.zip) record.Mailing_Zip = c.zip;
  if (c.lead_source) record.Lead_Source = c.lead_source;
  if (c.notes) record.Description = c.notes;
  if (c.id && base44IdField) record[base44IdField] = c.id;
  return record;
}

export async function ensureBase44IdField(moduleApiName) {
  const token = await getZohoAccessToken();
  const data = await zohoGet(`${API_BASE}/settings/fields?module=${encodeURIComponent(moduleApiName)}`, token);
  const fields = data.fields || [];
  const existing = fields.find((f) => {
    const an = (f.api_name || "").toLowerCase();
    const fl = (f.field_label || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return an === "base44_id" || an === "cf_base44_id" || fl === "base44id";
  });
  if (existing && existing.api_name) return existing.api_name;
  const createRes = await fetch(`${API_BASE}/settings/fields?module=${encodeURIComponent(moduleApiName)}`, {
    method: "POST",
    headers: { Authorization: `Zoho-oauthtoken ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: [{ field_label: "Base44 ID", data_type: "text", length: 120 }] }),
  });
  const createData = await createRes.json();
  const createdEntry = createData.fields && createData.fields[0];
  if (!createdEntry || createdEntry.status !== "success") {
    throw new Error(`Could not create 'Base44 ID' field on ${moduleApiName}. Create a text custom field named "Base44 ID" in Zoho (Setup > Customization > Modules > Contacts > Fields), then re-run. Detail: ${JSON.stringify(createData).slice(0, 300)}`);
  }
  // The create response omits api_name; re-fetch fields and locate the new field by its id.
  const createdId = createdEntry.details && createdEntry.details.id;
  const reData = await zohoGet(`${API_BASE}/settings/fields?module=${encodeURIComponent(moduleApiName)}`, token);
  const reFields = reData.fields || [];
  const found = reFields.find((f) => (createdId && f.id === createdId) || (f.field_label || "").toLowerCase() === "base44 id");
  if (!found?.api_name) {
    throw new Error(`'Base44 ID' field created but api_name could not be resolved on ${moduleApiName}.`);
  }
  return found.api_name;
}

export function publishedSitesToTags(sites) {
  if (!Array.isArray(sites) || sites.length === 0) return [];
  const map = {
    clearblue: "Published: ClearBlue",
    beechcraft: "Published: Beechcraft",
    gardner: "Published: Gardner",
  };
  const tags = [];
  for (const s of sites) {
    const tag = map[(s || "").toLowerCase()];
    if (tag) tags.push(tag);
  }
  return tags;
}

export async function zohoUpdateRecord(moduleApiName, id, record) {
  const token = await getZohoAccessToken();
  const res = await fetch(`${API_BASE}/${moduleApiName}/${id}`, {
    method: "PUT",
    headers: { Authorization: `Zoho-oauthtoken ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ data: [record] }),
  });
  const data = await res.json();
  const first = data?.data?.[0];
  if (!res.ok || !first || first.code !== "SUCCESS") {
    throw new Error(`Zoho update ${moduleApiName}/${id} failed: ${JSON.stringify(data).slice(0, 400)}`);
  }
  return first;
}

// Runs a Zoho CRM COQL query and returns the matching records (max 200 per call).
export async function zohoCoql(selectQuery) {
  const token = await getZohoAccessToken();
  const res = await fetch(`${API_BASE}/coql`, {
    method: "POST",
    headers: { Authorization: `Zoho-oauthtoken ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ select_query: selectQuery }),
  });
  const data = await zohoJson(res);
  if (!res.ok) {
    throw new Error(`Zoho COQL failed (${res.status}): ${JSON.stringify(data).slice(0, 400)} | query: ${selectQuery}`);
  }
  return data.data || [];
}