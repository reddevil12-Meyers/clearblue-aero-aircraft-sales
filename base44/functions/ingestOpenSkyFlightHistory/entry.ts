import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { fetchOpenSkyFlights, fetchOpenSkyStates } from "../../shared/opensky.ts";

const DAY = 24 * 60 * 60; // seconds
const RUN_CAP = 40; // max non-priority aircraft per nightly run
const MAX_WINDOWS = 8; // max 2-day windows per aircraft per run
const COVERAGE_DAYS = 30;
// "listed" = Available, "incoming" = Coming Soon, plus the featured flag
const ELIGIBLE_STATUSES = ["Available", "Coming Soon"];

function label(a) {
  return `${a.registration || ""} ${a.year || ""} ${a.make || ""} ${a.model || ""}`.trim() || a.id;
}

function daysAgoText(iso, now) {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / (DAY * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

// Ingest one aircraft: 2-day windows walking backward (max 8 windows or 30 days
// of coverage, whichever first), dedupe upsert of AircraftFlightEvent, then
// status/summary/last-seen updates. Never stores track waypoints.
async function ingestOne(svc, ac, hex, now, nowUnix, liveLastSeenIso) {
  const apiFlights = [];
  for (let w = 0; w < MAX_WINDOWS; w++) {
    const end = nowUnix - w * 2 * DAY;
    const begin = Math.max(end - 2 * DAY, nowUnix - COVERAGE_DAYS * DAY);
    const r = await fetchOpenSkyFlights(svc, hex, begin, end);
    if (r.status === 429) throw new Error("OpenSky rate limit (429)");
    apiFlights.push(...r.flights);
    if (begin <= nowUnix - COVERAGE_DAYS * DAY) break;
  }

  // Upsert on (aircraft_id, icao24, first_seen) — no duplicates
  const existing = await svc.entities.AircraftFlightEvent.filter({ aircraft_id: ac.id });
  const seen = new Set(existing.map((e) => `${String(e.icao24 || "").toLowerCase()}|${e.first_seen}`));
  const toCreate = [];
  for (const f of apiFlights) {
    if (!f || !f.firstSeen || !f.lastSeen) continue;
    const firstSeenIso = new Date(f.firstSeen * 1000).toISOString();
    const key = `${hex}|${firstSeenIso}`;
    if (seen.has(key)) continue;
    seen.add(key);
    toCreate.push({
      aircraft_id: ac.id,
      icao24: hex,
      callsign: f.callsign || null,
      first_seen: firstSeenIso,
      last_seen: new Date(f.lastSeen * 1000).toISOString(),
      dep_airport: f.departureAirport || null,
      arr_airport: f.arrivalAirport || null,
      duration_min: Math.max(0, Math.round((f.lastSeen - f.firstSeen) / 60)),
      source: "opensky",
      fetched_at: now.toISOString(),
    });
  }
  if (toCreate.length) await svc.entities.AircraftFlightEvent.bulkCreate(toCreate);

  // 30-day stats from stored events (fresh + prior nightly runs)
  const cutoff = now.getTime() - COVERAGE_DAYS * DAY * 1000;
  const allEvents = [...existing, ...toCreate];
  const recent = allEvents.filter((e) => new Date(e.first_seen).getTime() >= cutoff);

  const airportCounts = {};
  recent.forEach((e) =>
    [e.dep_airport, e.arr_airport].forEach((ap) => {
      if (ap) airportCounts[ap] = (airportCounts[ap] || 0) + 1;
    })
  );
  const topAirports = Object.entries(airportCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map((x) => x[0]);

  let newestLastSeen = liveLastSeenIso || null;
  allEvents.forEach((e) => {
    if (e.last_seen && (!newestLastSeen || new Date(e.last_seen) > new Date(newestLastSeen))) {
      newestLastSeen = e.last_seen;
    }
  });

  const hasFlights = recent.length > 0;
  const updates = { adsb_status: hasFlights ? "active" : "quiet" };

  if (hasFlights) {
    const parts = [`${recent.length} flights in the last ${COVERAGE_DAYS} days.`];
    if (topAirports.length) parts.push(`Most frequent airports: ${topAirports.join(", ")}.`);
    parts.push(`Last seen ${daysAgoText(newestLastSeen, now)}.`);
    updates.adsb_summary_text = parts.join(" ");
  } else {
    updates.adsb_summary_text = `No ADS-B flights recorded in the last ${COVERAGE_DAYS} days.`;
  }

  // adsb_last_seen_at: newest last_seen or live state, only if newer
  if (
    newestLastSeen &&
    (!ac.adsb_last_seen_at || new Date(newestLastSeen) > new Date(ac.adsb_last_seen_at))
  ) {
    updates.adsb_last_seen_at = newestLastSeen;
  }

  return { created: toCreate.length, updates };
}

// Staff-only failure digest — one email per run, only when there are failures
async function sendFailureDigest(svc, failures, deferred, stopped, now) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("FROM_EMAIL");
  if (!apiKey || !fromEmail) {
    console.log("[adsb-ingest] Resend not configured; skipping digest");
    return { sent: false, reason: "email_not_configured" };
  }
  const users = await svc.entities.User.list("-created_date", 500);
  const recipients = users.filter((u) => u.role === "admin" && u.email).map((u) => u.email);
  if (!recipients.length) return { sent: false, reason: "no_admins" };

  const rows = failures
    .map(
      (f) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;">${f.aircraft}</td>` +
        `<td style="padding:6px 10px;border-bottom:1px solid #eee;">${f.icao24 || "&mdash;"}</td>` +
        `<td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:bold;">${f.reason}</td>` +
        `<td style="padding:6px 10px;border-bottom:1px solid #eee;color:#888;">${f.detail ? String(f.detail).slice(0, 120) : ""}</td></tr>`
    )
    .join("");
  const notes = [
    stopped === "429" ? "The run stopped early because OpenSky returned 429 (rate limit)." : "",
    stopped === "401" ? "The run stopped early because OpenSky rejected the credentials (401)." : "",
    deferred > 0 ? `${deferred} eligible aircraft were deferred to keep the run under the credit cap.` : "",
  ].filter(Boolean);

  const html = `
<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
  <div style="background:#00447f;padding:20px 28px;color:#fff;font-size:18px;font-weight:bold;">
    ADS-B Nightly Ingest &mdash; ${failures.length} issue${failures.length === 1 ? "" : "s"}
  </div>
  <div style="padding:24px 28px;">
    <p style="color:#555;font-size:14px;">Run at ${now.toLocaleString("en-US")}. Issues from last night's OpenSky flight-history ingest:</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px;color:#333;">
      <thead>
        <tr style="background:#f5f6f8;text-align:left;">
          <th style="padding:6px 10px;">Aircraft</th>
          <th style="padding:6px 10px;">ICAO24</th>
          <th style="padding:6px 10px;">Reason</th>
          <th style="padding:6px 10px;">Detail</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${notes.map((n) => `<p style="color:#b45309;font-size:13px;margin-top:12px;">${n}</p>`).join("")}
  </div>
  <div style="background:#f5f6f8;padding:16px 28px;font-size:12px;color:#aaa;text-align:center;">
    Internal staff digest &mdash; ClearBlue Aero
  </div>
</div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: recipients,
      subject: `ADS-B nightly ingest: ${failures.length} issue${failures.length === 1 ? "" : "s"}`,
      html,
    }),
  });
  return { sent: res.ok, recipients: recipients.length };
}

// Nightly job — invoked by the "Nightly ADS-B Flight History Ingest" schedule.
// Optional { limit } in the body caps the run for testing.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const cap = Number(body && body.limit) > 0 ? Number(body.limit) : RUN_CAP;
    const now = new Date();
    const nowUnix = Math.floor(now.getTime() / 1000);

    const all = await svc.entities.Aircraft.list("-updated_date", 2000);
    const inScope = all.filter((a) => ELIGIBLE_STATUSES.includes(a.status) || a.featured === true);

    const failures = inScope
      .filter((a) => !a.icao24)
      .map((a) => ({ aircraft: label(a), icao24: null, reason: "no_hex" }));
    const eligible = inScope.filter((a) => a.icao24);

    // priority_adsb aircraft bypass the cap; processing is sequential to stay
    // well under OpenSky daily credits
    const priority = eligible.filter((a) => a.priority_adsb === true);
    const regular = eligible.filter((a) => a.priority_adsb !== true);
    const selected = [...priority, ...regular.slice(0, Math.max(0, cap - priority.length))];
    const deferred = eligible.length - selected.length;

    // One batched live-state call for the newest "last seen" values
    const liveLastSeen = new Map();
    if (selected.length) {
      try {
        const r = await fetchOpenSkyStates(svc, selected.map((a) => a.icao24));
        if (r.status === 200) {
          r.states.forEach((s) => {
            if (s && s[0] && s[4]) {
              liveLastSeen.set(String(s[0]).toLowerCase(), new Date(s[4] * 1000).toISOString());
            }
          });
        }
      } catch (e) {
        console.log(`[adsb-ingest] live state fetch failed: ${e.message}`);
      }
    }

    const aircraftUpdates = [];
    let eventsCreated = 0;
    let stopped = null; // "429" | "401"

    for (const ac of selected) {
      if (stopped) break;
      const hex = String(ac.icao24).toLowerCase();
      try {
        const outcome = await ingestOne(svc, ac, hex, now, nowUnix, liveLastSeen.get(hex) || null);
        eventsCreated += outcome.created;
        aircraftUpdates.push({ id: ac.id, ...outcome.updates });
      } catch (e) {
        const msg = String((e && e.message) || e);
        const reason = msg.includes("429") ? "429" : msg.includes("401") ? "401" : "error";
        failures.push({ aircraft: label(ac), icao24: hex, reason, detail: msg.slice(0, 200) });
        if (reason === "429" || reason === "401") stopped = reason;
      }
    }

    if (aircraftUpdates.length) await svc.entities.Aircraft.bulkUpdate(aircraftUpdates);

    const digest = failures.length
      ? await sendFailureDigest(svc, failures, deferred, stopped, now)
      : { sent: false, reason: "no_failures" };

    return Response.json({
      ok: true,
      eligible: eligible.length,
      selected: selected.length,
      processed: aircraftUpdates.length,
      events_created: eventsCreated,
      deferred,
      stopped_by: stopped,
      failures: failures.length,
      digest,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}