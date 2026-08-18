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
    ["Num_Engines", a.num_engines],
    ["Engine_Type", a.engine_type],
    ["Engine_Manufacturer", a.engine_manufacturer],
    ["Engine_Model", a.engine_model],
    ["Engine_Time_SMOH", a.engine_time_smoh != null ? Math.round(a.engine_time_smoh) : a.engine_time_smoh],
    ["Engine_Time_Type", a.engine_time_type],
    ["Engine_2_Manufacturer", a.engine2_manufacturer],
    ["Engine_2_Model", a.engine2_model],
    ["Engine_2_Time_SMOH", a.engine2_time_smoh != null ? Math.round(a.engine2_time_smoh) : a.engine2_time_smoh],
    ["Engine_2_Type", a.engine2_type],
    ["Propeller_Manufacturer", a.propeller_manufacturer],
    ["Propeller_Model", a.propeller_model],
    ["Propeller_Time", a.propeller_time != null ? Math.round(a.propeller_time) : a.propeller_time],
    ["Propeller_2_Manufacturer", a.propeller2_manufacturer],
    ["Propeller_2_Model", a.propeller2_model],
    ["Propeller_2_Time", a.propeller2_time != null ? Math.round(a.propeller2_time) : a.propeller2_time],
    ["Avionics_Suite", a.avionics_suite],
    ["Avionics_Details", a.avionics_details],
    ["Interior_Condition", a.interior_condition],
    ["Exterior_Condition", a.exterior_condition],
    ["Paint_Year", a.paint_year],
    ["Interior_Year", a.interior_year],
    ["Damage_History", a.damage_history],
    ["Damage_Details", a.damage_details],
    ["Annual_Due", a.annual_due],
    ["ADSB_Compliant", a.adsb_compliant],
    ["Factory_Air_Conditioning", a.factory_air_conditioning],
    ["Useful_Load", a.useful_load],
    ["Fuel_Capacity", a.fuel_capacity],
    ["Cruise_Speed", a.cruise_speed],
    ["Stall_Speed", a.stall_speed],
    ["Max_Speed", a.max_speed],
    ["Range_nm", a.range_nm],
    ["Service_Ceiling", a.service_ceiling],
    ["Rate_of_Climb", a.rate_of_climb],
    ["Takeoff_Distance", a.takeoff_distance],
    ["Landing_Distance", a.landing_distance],
    ["Fuel_Burn_GPH", a.fuel_burn_gph],
    ["Empty_Weight", a.empty_weight],
    ["Max_Takeoff_Weight", a.max_takeoff_weight],
    ["Wingspan_ft", a.wingspan_ft],
    ["Length_ft", a.length_ft],
    ["Payload_lbs", a.payload_lbs],
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