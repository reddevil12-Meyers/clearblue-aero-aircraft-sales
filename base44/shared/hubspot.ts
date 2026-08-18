const API_BASE = "https://api.hubapi.com/crm/v3";

export async function getHubSpotToken(base44) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");
  if (!accessToken) throw new Error("HubSpot connector not connected for this app.");
  return accessToken;
}

async function hubspotJson(res) {
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch (_) { return { raw: text, _invalid_json: true }; }
}

// Search an object by an exact built-in property value. Returns existing record id or null.
async function searchByProperty(token, objectType, propertyName, value) {
  if (!value) return null;
  const res = await fetch(`${API_BASE}/objects/${objectType}/search`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName, operator: "EQ", value: String(value) }] }],
      properties: [propertyName],
      limit: 1,
    }),
  });
  const data = await hubspotJson(res);
  return data?.results?.[0]?.id || null;
}

// Upsert by a built-in property. If the lookup value is missing, just create.
export async function hubspotUpsert(token, objectType, properties, dedupeProp, dedupeValue) {
  const existingId = dedupeValue ? await searchByProperty(token, objectType, dedupeProp, dedupeValue) : null;
  if (existingId) {
    const res = await fetch(`${API_BASE}/objects/${objectType}/${existingId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ properties }),
    });
    const data = await hubspotJson(res);
    if (!res.ok) throw new Error(`HubSpot update ${objectType}/${existingId} failed: ${JSON.stringify(data).slice(0, 300)}`);
    return { action: "updated", id: existingId };
  }
  const res = await fetch(`${API_BASE}/objects/${objectType}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ properties }),
  });
  const data = await hubspotJson(res);
  if (!res.ok) throw new Error(`HubSpot create ${objectType} failed: ${JSON.stringify(data).slice(0, 300)}`);
  return { action: "created", id: data.id };
}

export function buildContactProperties(c) {
  const p = {};
  if (c.first_name) p.firstname = c.first_name;
  p.lastname = (c.last_name && c.last_name.trim()) || c.first_name || "(Unknown)";
  if (c.email) p.email = c.email;
  if (c.phone) p.phone = c.phone;
  if (c.company) p.company = c.company;
  if (c.city) p.city = c.city;
  if (c.state) p.state = c.state;
  if (c.zip) p.zip = c.zip;
  if (c.address) p.address = c.address;
  return p;
}

export async function getDealStageMap(token) {
  let stageMap = {};
  try {
    const pipesRes = await fetch(`${API_BASE}/pipelines?objectType=deal&archived=false`, { headers: { Authorization: `Bearer ${token}` } });
    const pipesData = await hubspotJson(pipesRes);
    const pipes = pipesData.results || [];
    const defaultPipe = pipes.find((p) => (p.label || "").toLowerCase().includes("default")) || pipes[0];
    if (defaultPipe) {
      const stagesRes = await fetch(`${API_BASE}/pipelines/${defaultPipe.id}/stages?archived=false`, { headers: { Authorization: `Bearer ${token}` } });
      const stagesData = await hubspotJson(stagesRes);
      const stages = stagesData.results || [];
      const match = (kws) => (stages.find((s) => kws.some((k) => (s.label || "").toLowerCase().includes(k))) || stages[0]);
      const order = stages[0]; // earliest stage as fallback
      stageMap = {
        "Lead": match(["lead", "appointment", "new"]).id,
        "Qualification": match(["qualif"]).id,
        "Showing": match(["show", "presentation", "demo"]).id,
        "Offer": match(["offer", "proposal", "quote"]).id,
        "Negotiation": match(["negotiat", "contract", "verbal"]).id,
        "Pre-Buy Inspection": match(["negotiat", "contract", "verbal"]).id,
        "Escrow": match(["negotiat", "contract", "escrow", "verbal"]).id,
        "Closing": match(["negotiat", "contract", "closing", "verbal"]).id,
      };
      const won = stages.find((s) => (s.label || "").toLowerCase().includes("won"));
      const lost = stages.find((s) => (s.label || "").toLowerCase().includes("lost"));
      if (won) stageMap["Closed Won"] = won.id;
      if (lost) stageMap["Closed Lost"] = lost.id;
    }
  } catch (e) {
    console.log("getDealStageMap failed:", e.message);
  }
  return stageMap;
}

export function buildDealProperties(d, stageMap) {
  const p = {};
  if (d.title) p.dealname = d.title;
  if (d.stage) {
    const mapped = stageMap && stageMap[d.stage];
    if (mapped) p.dealstage = mapped;
  }
  const amount = d.agreed_price != null ? d.agreed_price : (d.offer_price != null ? d.offer_price : d.asking_price);
  if (amount != null) p.amount = String(amount);
  const closeDate = d.actual_close_date || d.expected_close_date;
  if (closeDate) p.closedate = new Date(closeDate).getTime();
  if (d.notes) p.description = d.notes;
  return p;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Batch upsert contacts by email (idempotent, 1 API call per 100 records).
export async function batchUpsertContacts(token, clients) {
  const inputs = [];
  const noEmail = [];
  for (const c of clients) {
    const props = buildContactProperties(c);
    if (c.email) inputs.push({ id: c.email, properties: props });
    else noEmail.push({ c, props });
  }
  const createdNoEmail = [];
  if (inputs.length) {
    const res = await fetch(`${API_BASE}/objects/contacts/batch/upsert`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: inputs.map((i) => ({ idProperty: "email", id: i.id, properties: i.properties })) }),
    });
    const data = await hubspotJson(res);
    if (!res.ok) throw new Error(`HubSpot batch upsert contacts failed: ${JSON.stringify(data).slice(0, 400)}`);
  }
  // Contacts without email can't be upserted by email — create them individually (throttled).
  for (const { c, props } of noEmail) {
    await sleep(1200);
    try {
      const res = await fetch(`${API_BASE}/objects/contacts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ properties: props }),
      });
      const data = await hubspotJson(res);
      if (!res.ok) throw new Error(JSON.stringify(data).slice(0, 200));
      createdNoEmail.push({ id: c.id, action: "created" });
    } catch (e) {
      createdNoEmail.push({ id: c.id, error: e.message });
    }
  }
  return { upserted: inputs.length, noEmail: createdNoEmail };
}

export async function syncClientToHubSpot(token, c) {
  const props = buildContactProperties(c);
  if (!c.email) {
    // No email — can't dedupe reliably; just create.
    return hubspotUpsert(token, "contacts", props, "email", null);
  }
  // Immediate lookup by email (avoids HubSpot search-index lag).
  const getRes = await fetch(`${API_BASE}/objects/contacts/${encodeURIComponent(c.email)}?idProperty=email&properties=email`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (getRes.ok) {
    const existing = await hubspotJson(getRes);
    if (existing?.id) {
      const res = await fetch(`${API_BASE}/objects/contacts/${existing.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ properties: props }),
      });
      const data = await hubspotJson(res);
      if (!res.ok) throw new Error(`HubSpot update contacts/${existing.id} failed: ${JSON.stringify(data).slice(0, 300)}`);
      return { action: "updated", id: existing.id };
    }
  }
  // Not found → create.
  const res = await fetch(`${API_BASE}/objects/contacts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ properties: props }),
  });
  const data = await hubspotJson(res);
  if (!res.ok) throw new Error(`HubSpot create contacts failed: ${JSON.stringify(data).slice(0, 300)}`);
  return { action: "created", id: data.id };
}

export async function syncDealToHubSpot(token, d, stageMap) {
  return hubspotUpsert(token, "deals", buildDealProperties(d, stageMap), "dealname", d.title);
}