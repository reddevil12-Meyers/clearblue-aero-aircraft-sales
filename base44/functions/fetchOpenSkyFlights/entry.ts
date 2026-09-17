import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { fetchOpenSkyFlights } from "../../shared/opensky.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const icao24 = body && body.icao24;
    if (!icao24 || !/^[0-9a-fA-F]{6}$/.test(String(icao24))) {
      return Response.json({ error: "A valid 6-character hex icao24 is required" }, { status: 400 });
    }

    let result;
    try {
      // Token cache access runs as service role (ApiTokenCache is admin-only)
      result = await fetchOpenSkyFlights(base44.asServiceRole, icao24, body.beginUnix, body.endUnix);
    } catch (validationError) {
      return Response.json({ error: validationError.message }, { status: 400 });
    }

    if (result.status === 429) {
      return Response.json(
        { error: "OpenSky rate limit reached", retry_after: result.retryAfter },
        { status: 429 }
      );
    }

    return Response.json({ icao24: icao24.toLowerCase(), flights: result.flights });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}