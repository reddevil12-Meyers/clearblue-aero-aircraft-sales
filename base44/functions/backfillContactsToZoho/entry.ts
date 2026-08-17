import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  ensureBase44IdField,
  zohoUpsert,
  zohoUpdateRecord,
  getZohoAccessToken,
  buildContactRecord,
} from "../../shared/zoho.ts";

const API_BASE = "https://www.zohoapis.com/crm/v5";

async function listAllZohoContacts() {
  const token = await getZohoAccessToken();
  const byEmail = new Map();
  const byPhone = new Map();
  let page = 1;
  while (true) {
    const fieldsParam = encodeURIComponent("Email,Phone");
    const res = await fetch(`${API_BASE}/Contacts?fields=${fieldsParam}&page=${page}&per_page=200`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });
    const data = await res.json();
    const records = data.data || [];
    for (const r of records) {
      const email = (r.Email || "").toString().trim().toLowerCase();
      const phone = (r.Phone || "").toString().trim();
      if (email) byEmail.set(email, r.id);
      if (phone) byPhone.set(phone, r.id);
    }
    if (!data.info || !data.info.more_records) break;
    page += 1;
  }
  return { byEmail, byPhone };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const base44IdField = await ensureBase44IdField("Contacts");
    const { byEmail, byPhone } = await listAllZohoContacts();

    const clients = await base44.asServiceRole.entities.Client.list('-created_date', 500);

    let linked = 0;
    let created = 0;
    let failed = 0;
    const errors = [];

    for (const c of clients) {
      try {
        const emailKey = (c.email || "").toString().trim().toLowerCase();
        const phoneKey = (c.phone || "").toString().trim();
        const existingId = (emailKey && byEmail.get(emailKey)) || (phoneKey && byPhone.get(phoneKey));
        if (existingId) {
          // Link the existing Zoho contact to this Base44 client (only stamp the ID; don't overwrite CRM data).
          await zohoUpdateRecord("Contacts", existingId, { [base44IdField]: c.id });
          linked += 1;
        } else {
          // No existing match — push a new contact keyed by Base44 ID.
          const record = buildContactRecord(c, base44IdField);
          await zohoUpsert("Contacts", record, [base44IdField]);
          created += 1;
        }
      } catch (e) {
        failed += 1;
        if (errors.length < 10) {
          errors.push({ client: c.id, name: `${c.first_name} ${c.last_name}`, error: e.message });
        }
      }
    }

    return Response.json({
      success: true,
      total: clients.length,
      linked,
      created,
      failed,
      base44IdField,
      errors,
    });
  } catch (error) {
    console.error("backfillContactsToZoho error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}