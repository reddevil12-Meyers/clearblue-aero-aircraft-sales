import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { fetchOpenSkyState } from "../../shared/opensky.ts";

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

    const result = await fetchOpenSkyState(base44, icao24);
    if (result.status === 429) {
      return Response.json(
        { error: "OpenSky rate limit reached", retry_after: result.retryAfter },
        { status: 429 }
      );
    }

    const state = result.state;
    if (!state) {
      return Response.json({ icao24: icao24.toLowerCase(), state: null, server_time: result.serverTime });
    }

    // state vector: [icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, ...]
    return Response.json({
      icao24: state[0],
      callsign: state[1] ? String(state[1]).trim() : null,
      origin_country: state[2] || null,
      last_contact: state[4] ? new Date(state[4] * 1000).toISOString() : null,
      longitude: state[5],
      latitude: state[6],
      on_ground: Boolean(state[8]),
      server_time: result.serverTime,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}