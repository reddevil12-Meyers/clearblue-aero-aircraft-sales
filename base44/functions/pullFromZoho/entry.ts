import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { ensureBase44IdField, findAircraftModuleApiName, zohoCoql } from "../../shared/zoho.ts";

// Lookback window. The scheduled poll runs every 10 minutes; a 30-minute window
// guarantees overlap so no Zoho edit falls between polls. Idempotency comes from
// a field-level diff (unchanged values produce no Base44 update, no push-back).
const SINCE_MINUTES = 30;

// Zoho Contact field -> Base44 Client field
const CONTACT_FIELD_MAP = {
  First_Name: "first_name",
  Last_Name: "last_name",
  Email: "email",
  Phone: "phone",
  Mailing_Street: "address",
  Mailing_City: "city",
  Mailing_State: "state",
  Mailing_Zip: "zip",
  Lead_Source: "lead_source",
  Description: "notes",
};

// Zoho Deal field -> Base44 Deal field
const DEAL_FIELD_MAP = {
  Deal_Name: "title",
  Closing_Date: "expected_close_date",
  Description: "notes",
};

// Zoho Deal stage -> Base44 Deal stage (reverse of syncToZoho DEAL_STAGE_MAP)
const ZOHO_STAGE_TO_BASE44 = {
  Qualification: "Qualification",
  "Needs Analysis": "Showing",
  Proposal: "Offer",
  Negotiation: "Negotiation",
  "Closed Won": "Closed Won",
  "Closed Lost": "Closed Lost",
};

// Zoho Aircraft custom field -> Base44 Aircraft field
const AIRCRAFT_FIELD_MAP = {
  Make: "make",
  Model: "model",
  Year: "year",
  Registration: "registration",
  Serial_Number: "serial_number",
  Total_Time: "total_time",
  Asking_Price: "asking_price",
  Status: "status",
  Location: "location",
  Description: "notes",
  Num_Engines: "num_engines",
  Engine_Type: "engine_type",
  Engine_Manufacturer: "engine_manufacturer",
  Engine_Model: "engine_model",
  Engine_Time_SMOH: "engine_time_smoh",
  Engine_Time_Type: "engine_time_type",
  Engine_2_Manufacturer: "engine2_manufacturer",
  Engine_2_Model: "engine2_model",
  Engine_2_Time_SMOH: "engine2_time_smoh",
  Engine_2_Type: "engine2_type",
  Propeller_Manufacturer: "propeller_manufacturer",
  Propeller_Model: "propeller_model",
  Propeller_Time: "propeller_time",
  Propeller_2_Manufacturer: "propeller2_manufacturer",
  Propeller_2_Model: "propeller2_model",
  Propeller_2_Time: "propeller2_time",
  Avionics_Suite: "avionics_suite",
  Avionics_Details: "avionics_details",
  Interior_Condition: "interior_condition",
  Exterior_Condition: "exterior_condition",
  Paint_Year: "paint_year",
  Interior_Year: "interior_year",
  Damage_History: "damage_history",
  Damage_Details: "damage_details",
  Annual_Due: "annual_due",
  ADSB_Compliant: "adsb_compliant",
  Factory_Air_Conditioning: "factory_air_conditioning",
  Useful_Load: "useful_load",
  Fuel_Capacity: "fuel_capacity",
  Cruise_Speed: "cruise_speed",
  Stall_Speed: "stall_speed",
  Max_Speed: "max_speed",
  Range_nm: "range_nm",
  Service_Ceiling: "service_ceiling",
  Rate_of_Climb: "rate_of_climb",
  Takeoff_Distance: "takeoff_distance",
  Landing_Distance: "landing_distance",
  Fuel_Burn_GPH: "fuel_burn_gph",
  Empty_Weight: "empty_weight",
  Max_Takeoff_Weight: "max_takeoff_weight",
  Wingspan_ft: "wingspan_ft",
  Length_ft: "length_ft",
  Payload_lbs: "payload_lbs",
};

function fmtUtc(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}+00:00`;
}

function toNum(v) {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

function mapZohoToBase44(zohoRecord, fieldMap) {
  const out = {};
  for (const [zf, bf] of Object.entries(fieldMap)) {
    if (zf in zohoRecord) {
      const v = zohoRecord[zf];
      if (v == null) continue;
      out[bf] = v;
    }
  }
  return out;
}

// Only include fields whose value actually differs from the current Base44 record.
// This makes the pull idempotent: matching values -> no update -> no push-back loop.
function diffUpdate(existing, incoming) {
  const update = {};
  for (const [k, v] of Object.entries(incoming)) {
    if (v == null || v === "") continue;
    const cur = existing[k];
    if (cur == null || String(cur) !== String(v)) {
      update[k] = v;
    }
  }
  return update;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const windowStart = new Date(Date.now() - SINCE_MINUTES * 60 * 1000);
    const since = fmtUtc(windowStart);
    const stats = {
      contacts: { checked: 0, updated: 0, skipped: 0 },
      deals: { checked: 0, updated: 0, skipped: 0 },
      aircraft: { checked: 0, updated: 0, skipped: 0 },
    };

    // --- Contacts -> Clients ---
    try {
      const base44IdField = await ensureBase44IdField("Contacts");
      const selectFields = ["id", "First_Name", "Last_Name", "Email", "Phone", "Mailing_Street", "Mailing_City", "Mailing_State", "Mailing_Zip", "Lead_Source", "Description", base44IdField, "Modified_Time"].join(", ");
      const rows = await zohoCoql(`select ${selectFields} from Contacts where Modified_Time > '${since}' limit 200`);
      if (rows.length) {
        const clients = await base44.asServiceRole.entities.Client.list("-updated_date", 500);
        const byId = {};
        for (const c of clients) if (c.id) byId[c.id] = c;
        for (const r of rows) {
          stats.contacts.checked += 1;
          const b44Id = r[base44IdField];
          const existing = b44Id ? byId[b44Id] : null;
          if (!existing) { stats.contacts.skipped += 1; continue; }
          // Base44 wins: skip records Base44 itself edited within the window.
          if (existing.updated_date && new Date(existing.updated_date) > windowStart) { stats.contacts.skipped += 1; continue; }
          const incoming = mapZohoToBase44(r, CONTACT_FIELD_MAP);
          const upd = diffUpdate(existing, incoming);
          if (Object.keys(upd).length === 0) { stats.contacts.skipped += 1; continue; }
          await base44.asServiceRole.entities.Client.update(existing.id, upd);
          stats.contacts.updated += 1;
        }
      }
    } catch (e) {
      console.log("Contacts pull failed (non-blocking):", e.message);
    }

    // --- Deals -> Deals (matched by Deal_Name) ---
    try {
      const selectFields = ["id", "Deal_Name", "Stage", "Amount", "Closing_Date", "Description", "Modified_Time"].join(", ");
      const rows = await zohoCoql(`select ${selectFields} from Deals where Modified_Time > '${since}' limit 200`);
      if (rows.length) {
        const deals = await base44.asServiceRole.entities.Deal.list("-updated_date", 500);
        const byTitle = {};
        for (const d of deals) if (d.title) byTitle[d.title] = d;
        for (const r of rows) {
          stats.deals.checked += 1;
          const existing = r.Deal_Name ? byTitle[r.Deal_Name] : null;
          if (!existing) { stats.deals.skipped += 1; continue; }
          if (existing.updated_date && new Date(existing.updated_date) > windowStart) { stats.deals.skipped += 1; continue; }
          const incoming = mapZohoToBase44(r, DEAL_FIELD_MAP);
          if (r.Stage && ZOHO_STAGE_TO_BASE44[r.Stage]) incoming.stage = ZOHO_STAGE_TO_BASE44[r.Stage];
          const amount = toNum(r.Amount);
          if (amount != null) incoming.agreed_price = amount;
          const upd = diffUpdate(existing, incoming);
          if (Object.keys(upd).length === 0) { stats.deals.skipped += 1; continue; }
          await base44.asServiceRole.entities.Deal.update(existing.id, upd);
          stats.deals.updated += 1;
        }
      }
    } catch (e) {
      console.log("Deals pull failed (non-blocking):", e.message);
    }

    // --- Aircraft custom module -> Aircraft (matched by Base44_ID field) ---
    try {
      const moduleApiName = await findAircraftModuleApiName();
      const base44IdField = await ensureBase44IdField(moduleApiName);
      const selectFields = ["id", base44IdField, "Modified_Time", ...Object.keys(AIRCRAFT_FIELD_MAP)].join(", ");
      const rows = await zohoCoql(`select ${selectFields} from ${moduleApiName} where Modified_Time > '${since}' limit 200`);
      if (rows.length) {
        const aircraft = await base44.asServiceRole.entities.Aircraft.list("-updated_date", 500);
        const byId = {};
        for (const a of aircraft) if (a.id) byId[a.id] = a;
        for (const r of rows) {
          stats.aircraft.checked += 1;
          const b44Id = r[base44IdField];
          const existing = b44Id ? byId[b44Id] : null;
          if (!existing) { stats.aircraft.skipped += 1; continue; }
          if (existing.updated_date && new Date(existing.updated_date) > windowStart) { stats.aircraft.skipped += 1; continue; }
          const incoming = mapZohoToBase44(r, AIRCRAFT_FIELD_MAP);
          const upd = diffUpdate(existing, incoming);
          if (Object.keys(upd).length === 0) { stats.aircraft.skipped += 1; continue; }
          await base44.asServiceRole.entities.Aircraft.update(existing.id, upd);
          stats.aircraft.updated += 1;
        }
      }
    } catch (e) {
      console.log("Aircraft pull failed (non-blocking):", e.message);
    }

    return Response.json({ success: true, since, stats });
  } catch (error) {
    console.error("pullFromZoho error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}