import { zohoUpsert, zohoAddTags, publishedSitesToTags, findAircraftModuleApiName, getModuleFields, ensureBase44IdField, buildContactRecord } from "../../shared/zoho.ts";

const DEAL_STAGE_MAP = {
  "Lead": "Qualification",
  "Qualification": "Qualification",
  "Showing": "Needs Analysis",
  "Offer": "Proposal",
  "Negotiation": "Negotiation",
  "Pre-Buy Inspection": "Negotiation",
  "Escrow": "Negotiation",
  "Closing": "Negotiation",
  "Closed Won": "Closed Won",
  "Closed Lost": "Closed Lost",
};

async function syncClient(c) {
  const base44IdField = await ensureBase44IdField("Contacts");
  const record = buildContactRecord(c, base44IdField);
  return await zohoUpsert("Contacts", record, [base44IdField]);
}

async function syncDeal(d) {
  const record = {};
  if (d.title) record.Deal_Name = d.title;
  record.Stage = DEAL_STAGE_MAP[d.stage] || "Qualification";
  const amount = d.agreed_price != null ? d.agreed_price : (d.offer_price != null ? d.offer_price : d.asking_price);
  if (amount != null) record.Amount = amount;
  const closeDate = d.actual_close_date || d.expected_close_date;
  if (closeDate) record.Closing_Date = closeDate;
  if (d.notes) record.Description = d.notes;
  return await zohoUpsert("Deals", record, ["Deal_Name"]);
}

async function syncAircraft(a) {
  const moduleApiName = await findAircraftModuleApiName();
  const base44IdField = await ensureBase44IdField(moduleApiName);
  const fields = await getModuleFields(moduleApiName);
  const available = new Set(fields.map((f) => (f.api_name || "").toLowerCase()));

  const record = {};

  const nameField = fields.find((f) => {
    const an = (f.api_name || "").toLowerCase();
    const fl = (f.field_label || "").toLowerCase();
    return an === "name" || fl === "name" || fl === "record name";
  });
  if (nameField && nameField.api_name) {
    const label = (nameField.field_label || "").toLowerCase();
    const isRegistrationField = label === "registration" || label === "n-number" || label.includes("registration");
    record[nameField.api_name] = isRegistrationField
      ? (a.registration || "")
      : `${a.year || ""} ${a.make || ""} ${a.model || ""}`.trim();
  }

  const candidates = [
    ["Make", a.make],
    ["Model", a.model],
    ["Year", a.year],
    ["Registration", a.registration],
    ["Serial_Number", a.serial_number],
    ["Total_Time", a.total_time != null ? Math.round(a.total_time) : a.total_time],
    ["Asking_Price", a.asking_price],
    ["Status", a.status],
    ["Location", a.location],
    ["Description", a.notes],
  ];
  for (const [field, value] of candidates) {
    if (value == null || value === "") continue;
    if (available.has(field.toLowerCase())) {
      record[field] = value;
    }
  }
  if (a.id) record[base44IdField] = a.id;

  const result = await zohoUpsert(moduleApiName, record, [base44IdField]);
  const recordId = result?.details?.id;
  const tags = publishedSitesToTags(a.published_sites);
  if (recordId && tags.length) {
    try {
      await zohoAddTags(moduleApiName, recordId, tags);
    } catch (tagError) {
      console.log(`Zoho aircraft tag association failed (non-blocking): ${tagError.message}`);
    }
  }
  return result;
}

export default async function (req) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch (_) {}
    const event = body.event || {};
    const data = body.data || body.record || null;
    const entityName = event.entity_name || body.entity_name;

    if (!entityName || !data) {
      return Response.json({ error: "entity_name and data are required" }, { status: 400 });
    }

    let result;
    if (entityName === "Client") {
      result = await syncClient(data);
    } else if (entityName === "Deal") {
      result = await syncDeal(data);
    } else if (entityName === "Aircraft") {
      result = await syncAircraft(data);
    } else {
      return Response.json({ error: `Unsupported entity: ${entityName}` }, { status: 400 });
    }

    return Response.json({ success: true, entity: entityName, result });
  } catch (error) {
    console.error("syncToZoho error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}