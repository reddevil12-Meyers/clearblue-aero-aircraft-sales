import { findAircraftModuleApiName, getZohoAccessToken, zohoJson } from "../../shared/zoho.ts";

const API_BASE = "https://www.zohoapis.com/crm/v5";

export default async function (req) {
  try {
    const moduleApiName = await findAircraftModuleApiName();
    const token = await getZohoAccessToken();

    // Collect all record ids (paginate).
    const ids = [];
    let page = 1;
    let more = true;
    while (more) {
      const res = await fetch(`${API_BASE}/${moduleApiName}?fields=id&page=${page}&per_page=200`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });
      const data = await zohoJson(res);
      for (const r of (data.data || [])) {
        if (r.id) ids.push(r.id);
      }
      if (!data.info || !data.info.more_records) more = false;
      else page += 1;
    }

    // Delete in batches of 100 (Zoho limit per request).
    let deleted = 0;
    let failed = 0;
    const errors = [];
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100);
      const res = await fetch(`${API_BASE}/${moduleApiName}?ids=${batch.join(",")}`, {
        method: "DELETE",
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });
      const data = await zohoJson(res);
      for (const r of (data.data || [])) {
        if (r.code === "SUCCESS") deleted += 1;
        else { failed += 1; if (errors.length < 10) errors.push(r); }
      }
    }

    return Response.json({
      success: true,
      module: moduleApiName,
      totalFound: ids.length,
      deleted,
      failed,
      errors,
    });
  } catch (error) {
    console.error("deleteZohoAircraftRecords error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}