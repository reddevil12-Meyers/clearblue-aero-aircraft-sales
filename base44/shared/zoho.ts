import { secrets } from "base44:runtime";

const TOKEN_URL = "https://accounts.zoho.com/oauth/v2/token";
const API_BASE = "https://www.zohoapis.com/crm/v5";

export async function getZohoAccessToken() {
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
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Zoho token refresh failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
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
  const res = await fetch(`${API_BASE}/settings/modules`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  const data = await res.json();
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
  const res = await fetch(`${API_BASE}/settings/fields?module=${encodeURIComponent(moduleApiName)}`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  const data = await res.json();
  return data.fields || [];
}