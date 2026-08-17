import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { findAircraftModuleApiName, ensureBase44IdField, getModuleFields, getZohoAccessToken, zohoUpsert } from "../../shared/zoho.ts";

const API_BASE = "https://www.zohoapis.com/crm/v5";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const moduleApiName = await findAircraftModuleApiName();
    const base44IdField = await ensureBase44IdField(moduleApiName);
    const token = await getZohoAccessToken();

    // Fetch existing Zoho aircraft records indexed by Base44_ID.
    const byBase44Id = new Map();
    let more = true;
    let page = 1;
    while (more) {
      const res = await fetch(`${API_BASE}/${moduleApiName}?fields=${encodeURIComponent(base44IdField)}&page=${page}&per_page=200`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });
      const data = await res.json();
      for (const r of data.data || []) {
        const bid = r[base44IdField];
        if (bid) byBase44Id.set(bid, r.id);
      }
      if (!data.info || !data.info.more_records) more = false;
      else page += 1;
    }

    const aircraft = await base44.asServiceRole.entities.Aircraft.list("-created_date", 500);
    const fields = await getModuleFields(moduleApiName);
    const available = new Set(fields.map((f) => (f.api_name || "").toLowerCase()));
    const nameField = fields.find((f) => {
      const an = (f.api_name || "").toLowerCase();
      const fl = (f.field_label || "").toLowerCase();
      return an === "name" || fl === "name" || fl === "record name";
    });
    let linked = 0, created = 0, failed = 0;
    const errors = [];

    for (const a of aircraft) {
      try {
        const availableLocal = available;
        const record = {};
        const nameValue = `${a.year || ""} ${a.make || ""} ${a.model || ""}`.trim() + (a.registration ? ` (${a.registration})` : "");
        if (nameField && nameField.api_name) record[nameField.api_name] = nameValue;
        const candidates = [
          ["Make", a.make], ["Model", a.model], ["Year", a.year],
          ["Registration", a.registration], ["Serial_Number", a.serial_number],
          ["Total_Time", a.total_time != null ? Math.round(a.total_time) : a.total_time], ["Asking_Price", a.asking_price],
          ["Status", a.status], ["Location", a.location], ["Description", a.notes],
        ];
        for (const [field, value] of candidates) {
          if (value == null || value === "") continue;
          if (availableLocal.has(field.toLowerCase())) record[field] = value;
        }
        record[base44IdField] = a.id;
        await zohoUpsert(moduleApiName, record, [base44IdField]);
        if (byBase44Id.has(a.id)) linked += 1; else created += 1;
      } catch (e) {
        failed += 1;
        if (errors.length < 10) errors.push({ aircraft: a.id, name: `${a.make} ${a.model}`, error: e.message });
      }
    }

    return Response.json({
      success: true,
      total: aircraft.length,
      linked, created, failed,
      module: moduleApiName,
      base44IdField,
      errors,
    });
  } catch (error) {
    console.error("backfillAircraftToZoho error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}