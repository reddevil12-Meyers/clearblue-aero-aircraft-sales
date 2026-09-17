import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { ADSB_COVERAGE_DAYS, buildAdsBSummary } from "../../shared/adsbSummary.ts";

// Staff action: regenerate adsb_summary_text from stored AircraftFlightEvent
// records — no OpenSky API calls. Also refreshes adsb_last_seen_at if newer.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const aircraftId = body && (body.aircraftId || body.aircraft_id);
    if (!aircraftId) {
      return Response.json({ error: "aircraftId is required" }, { status: 400 });
    }

    const aircraft = await base44.entities.Aircraft.get(aircraftId);
    if (!aircraft) {
      return Response.json({ error: "Aircraft not found" }, { status: 404 });
    }

    const events = await base44.entities.AircraftFlightEvent.filter({ aircraft_id: aircraftId });
    const now = new Date();
    const cutoff = now.getTime() - ADSB_COVERAGE_DAYS * 24 * 60 * 60 * 1000;
    const recent = events.filter((e) => new Date(e.first_seen).getTime() >= cutoff);

    let newestLastSeen = aircraft.adsb_last_seen_at || null;
    events.forEach((e) => {
      if (e.last_seen && (!newestLastSeen || new Date(e.last_seen) > new Date(newestLastSeen))) {
        newestLastSeen = e.last_seen;
      }
    });

    const updates = { adsb_summary_text: buildAdsBSummary(recent, newestLastSeen, now) };
    if (
      newestLastSeen &&
      (!aircraft.adsb_last_seen_at || new Date(newestLastSeen) > new Date(aircraft.adsb_last_seen_at))
    ) {
      updates.adsb_last_seen_at = newestLastSeen;
    }

    await base44.entities.Aircraft.update(aircraftId, updates);
    return Response.json({ ok: true, updates });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}