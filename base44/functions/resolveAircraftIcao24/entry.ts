import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { resolveAircraftIcao24 } from "../../shared/opensky.ts";

// Invoked by the "Resolve Aircraft ICAO24 on Tail Change" entity automation
// (no user session) and by the staff "Resolve ICAO24" button in the aircraft UI.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const aircraftId = body && (body.aircraftId || body.aircraft_id);
    if (!aircraftId) {
      return Response.json({ error: "aircraftId is required" }, { status: 400 });
    }
    const result = await resolveAircraftIcao24(base44.asServiceRole, aircraftId);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}