import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { findAircraftModuleApiName, ensureBase44IdField, getModuleFields, getZohoAccessToken, zohoUpsert, zohoAddTags, publishedSitesToTags, zohoJson } from "../../shared/zoho.ts";

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
      const data = await zohoJson(res);
      for (const r of (data.data || [])) {
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
        if (nameField && nameField.api_name) {
          const label = (nameField.field_label || "").toLowerCase();
          const isRegistrationField = label === "registration" || label === "n-number" || label.includes("registration");
          record[nameField.api_name] = isRegistrationField
            ? (a.registration || "")
            : `${a.year || ""} ${a.make || ""} ${a.model || ""}`.trim();
        }
        const candidates = [
          ["Make", a.make], ["Model", a.model], ["Year", a.year],
          ["Registration", a.registration], ["Serial_Number", a.serial_number],
          ["Total_Time", a.total_time != null ? Math.round(a.total_time) : a.total_time],
          ["Asking_Price", a.asking_price], ["Status", a.status], ["Location", a.location], ["Description", a.notes],
          ["Num_Engines", a.num_engines], ["Engine_Type", a.engine_type],
          ["Engine_Manufacturer", a.engine_manufacturer], ["Engine_Model", a.engine_model],
          ["Engine_Time_SMOH", a.engine_time_smoh != null ? Math.round(a.engine_time_smoh) : a.engine_time_smoh],
          ["Engine_Time_Type", a.engine_time_type],
          ["Engine_2_Manufacturer", a.engine2_manufacturer], ["Engine_2_Model", a.engine2_model],
          ["Engine_2_Time_SMOH", a.engine2_time_smoh != null ? Math.round(a.engine2_time_smoh) : a.engine2_time_smoh],
          ["Engine_2_Type", a.engine2_type],
          ["Propeller_Manufacturer", a.propeller_manufacturer], ["Propeller_Model", a.propeller_model],
          ["Propeller_Time", a.propeller_time != null ? Math.round(a.propeller_time) : a.propeller_time],
          ["Propeller_2_Manufacturer", a.propeller2_manufacturer], ["Propeller_2_Model", a.propeller2_model],
          ["Propeller_2_Time", a.propeller2_time != null ? Math.round(a.propeller2_time) : a.propeller2_time],
          ["Avionics_Suite", a.avionics_suite], ["Avionics_Details", a.avionics_details],
          ["Interior_Condition", a.interior_condition], ["Exterior_Condition", a.exterior_condition],
          ["Paint_Year", a.paint_year], ["Interior_Year", a.interior_year],
          ["Damage_History", a.damage_history], ["Damage_Details", a.damage_details],
          ["Annual_Due", a.annual_due], ["ADSB_Compliant", a.adsb_compliant],
          ["Factory_Air_Conditioning", a.factory_air_conditioning],
          ["Useful_Load", a.useful_load], ["Fuel_Capacity", a.fuel_capacity],
          ["Cruise_Speed", a.cruise_speed], ["Stall_Speed", a.stall_speed], ["Max_Speed", a.max_speed],
          ["Range_nm", a.range_nm], ["Service_Ceiling", a.service_ceiling], ["Rate_of_Climb", a.rate_of_climb],
          ["Takeoff_Distance", a.takeoff_distance], ["Landing_Distance", a.landing_distance],
          ["Fuel_Burn_GPH", a.fuel_burn_gph], ["Empty_Weight", a.empty_weight],
          ["Max_Takeoff_Weight", a.max_takeoff_weight], ["Wingspan_ft", a.wingspan_ft],
          ["Length_ft", a.length_ft], ["Payload_lbs", a.payload_lbs],
        ];
        for (const [field, value] of candidates) {
          if (value == null || value === "") continue;
          if (availableLocal.has(field.toLowerCase())) record[field] = value;
        }
        record[base44IdField] = a.id;
        const result = await zohoUpsert(moduleApiName, record, [base44IdField]);
        const tags = publishedSitesToTags(a.published_sites);
        if (tags.length && result?.details?.id) {
          try { await zohoAddTags(moduleApiName, result.details.id, tags); } catch (e) { console.log(`tag fail ${a.id}: ${e.message}`); }
        }
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