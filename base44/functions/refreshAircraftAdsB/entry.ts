import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { fetchOpenSkyState } from "../../shared/opensky.ts";

const ACTIVE_WINDOW_MS = 15 * 60 * 1000; // contact within 15 min counts as active

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const aircraftId = body && body.aircraftId;
    if (!aircraftId) {
      return Response.json({ error: "aircraftId is required" }, { status: 400 });
    }

    const aircraft = await base44.entities.Aircraft.get(aircraftId);
    if (!aircraft) {
      return Response.json({ error: "Aircraft not found" }, { status: 404 });
    }

    if (!aircraft.icao24) {
      await base44.entities.Aircraft.update(aircraftId, { adsb_status: "no_hex" });
      return Response.json({ ok: true, adsb_status: "no_hex" });
    }

    const result = await fetchOpenSkyState(base44, aircraft.icao24);

    if (result.status === 429) {
      await base44.entities.Aircraft.update(aircraftId, {
        adsb_status: "error",
        adsb_summary_text: "OpenSky rate limit reached — try again later.",
      });
      return Response.json(
        { ok: false, adsb_status: "error", retry_after: result.retryAfter },
        { status: 429 }
      );
    }

    const state = result.state;
    if (state) {
      // state vector: [icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, ..., on_ground, ...]
      const lastContactUnix = Number(state[4]) || null;
      const lastSeenAt = lastContactUnix ? new Date(lastContactUnix * 1000).toISOString() : null;
      const callsign = state[1] ? String(state[1]).trim() : null;
      const onGround = Boolean(state[8]);
      const isActive =
        lastContactUnix && Date.now() - lastContactUnix * 1000 < ACTIVE_WINDOW_MS ? "active" : "quiet";
      const summaryParts = [];
      if (lastSeenAt) summaryParts.push(`Last ADS-B contact ${new Date(lastSeenAt).toLocaleString("en-US", { timeZone: "America/New_York" })} ET`);
      if (callsign) summaryParts.push(`callsign ${callsign}`);
      summaryParts.push(onGround ? "on ground" : "airborne");
      const summary = `OpenSky: ${summaryParts.join(", ")}.`;

      const updates = {
        adsb_status: isActive,
        adsb_last_seen_at: lastSeenAt,
        adsb_last_lat: typeof state[6] === "number" ? state[6] : null,
        adsb_last_lon: typeof state[5] === "number" ? state[5] : null,
        adsb_summary_text: summary,
      };
      await base44.entities.Aircraft.update(aircraftId, updates);
      return Response.json({ ok: true, ...updates });
    }

    // ICAO known but no live state — aircraft is not currently transmitting
    const updates = {
      adsb_status: "quiet",
      adsb_summary_text: "OpenSky: no ADS-B contact currently — aircraft is not transmitting.",
    };
    await base44.entities.Aircraft.update(aircraftId, updates);
    return Response.json({ ok: true, ...updates });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}