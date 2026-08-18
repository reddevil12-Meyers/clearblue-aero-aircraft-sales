import { createClientFromRequest } from 'npm:@base44/sdk@0.8.43';
import {
  getHubSpotToken,
  syncClientToHubSpot,
  syncDealToHubSpot,
  getDealStageMap,
} from "../../shared/hubspot.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const token = await getHubSpotToken(base44);
    let body = {};
    try { body = await req.json(); } catch (_) {}
    const data = body.data || body.record || null;
    const entityName = body.entity_name || body.event?.entity_name;
    if (!entityName || !data) {
      return Response.json({ error: "entity_name and data are required" }, { status: 400 });
    }

    let result;
    if (entityName === "Client") result = await syncClientToHubSpot(token, data);
    else if (entityName === "Deal") {
      const stageMap = await getDealStageMap(token);
      result = await syncDealToHubSpot(token, data, stageMap);
    }
    else return Response.json({ error: `Unsupported entity for HubSpot sync: ${entityName}. Only Client and Deal are supported with the current HubSpot scopes.` }, { status: 400 });

    return Response.json({ success: true, entity: entityName, result });
  } catch (error) {
    console.error("syncToHubSpot error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}