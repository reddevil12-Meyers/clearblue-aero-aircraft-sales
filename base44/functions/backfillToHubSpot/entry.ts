import { createClientFromRequest } from 'npm:@base44/sdk@0.8.43';
import {
  getHubSpotToken,
  syncClientToHubSpot,
  syncDealToHubSpot,
  batchUpsertContacts,
  getDealStageMap,
  sleep,
} from "../../shared/hubspot.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const token = await getHubSpotToken(base44);

    const stats = { clients: { total: 0, created: 0, updated: 0, failed: 0 }, deals: { total: 0, created: 0, updated: 0, failed: 0 } };
    const errors = [];
    const errCounts = {};
    const pushError = (entity, id, msg) => {
      errCounts[entity] = (errCounts[entity] || 0) + 1;
      if (errCounts[entity] <= 2) errors.push({ entity, id, error: msg });
    };

    // Clients → Contacts (batch upsert by email, idempotent)
    try {
      const clients = await base44.asServiceRole.entities.Client.list("-created_date", 500);
      stats.clients.total = clients.length;
      const result = await batchUpsertContacts(token, clients);
      stats.clients.created = result.upserted;
      stats.clients.updated = 0;
      for (const r of (result.noEmail || [])) {
        if (r.error) { stats.clients.failed += 1; pushError("Client", r.id, r.error); }
        else stats.clients.created += 1;
      }
    } catch (e) { errors.push({ entity: "Client", error: e.message }); }

    // Deals → Deals (dedupe by deal name, map stages to this account's pipeline)
    try {
      const deals = await base44.asServiceRole.entities.Deal.list("-created_date", 500);
      stats.deals.total = deals.length;
      const stageMap = await getDealStageMap(token);
      for (const d of deals) {
        await sleep(1200);
        try {
          const r = await syncDealToHubSpot(token, d, stageMap);
          if (r.action === "created") stats.deals.created += 1; else stats.deals.updated += 1;
        } catch (e) {
          stats.deals.failed += 1;
          pushError("Deal", d.id, e.message);
        }
      }
    } catch (e) { errors.push({ entity: "Deal", error: e.message }); }

    return Response.json({ success: true, stats, errors });
  } catch (error) {
    console.error("backfillToHubSpot error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}