import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { syncClientToZoho } from "../../shared/zoho.ts";

// Lookback window. The scheduled sync runs twice a day; a 24-hour window
// guarantees overlap so no client edit falls between runs. Upserts are
// idempotent (keyed on the Base44 ID field), so re-syncing is harmless.
const LOOKBACK_HOURS = 24;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString();
    const clients = await svc.entities.Client.filter(
      { updated_date: { $gte: since } },
      "-updated_date",
      500
    );

    const stats = { considered: clients.length, synced: 0, failed: 0, errors: [] };
    for (const c of clients) {
      const label = `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.id;
      try {
        await syncClientToZoho(c);
        stats.synced += 1;
      } catch (e) {
        stats.failed += 1;
        if (stats.errors.length < 10) stats.errors.push(`${label}: ${e.message}`);
      }
    }

    return Response.json({ success: true, since, stats });
  } catch (error) {
    console.error("batchSyncClientsToZoho error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}