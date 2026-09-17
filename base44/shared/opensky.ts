import { secrets } from "base44:runtime";

const PROVIDER = "opensky";
const TOKEN_URL = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";
const API_BASE = "https://opensky-network.org/api";
const TOKEN_SKEW_MS = 60 * 1000; // treat token as expired 60s before real expiry

async function getCachedTokenRecord(base44) {
  const rows = await base44.entities.ApiTokenCache.filter({ provider: PROVIDER });
  return rows && rows[0] ? rows[0] : null;
}

async function requestToken(base44) {
  const clientId = secrets.get("OPENSKY_CLIENT_ID");
  const clientSecret = secrets.get("OPENSKY_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error("OpenSky credentials are not configured");
  }
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`OpenSky token request failed with status ${res.status}`);
  }
  const data = await res.json();
  const expiresAt = new Date(Date.now() + (Number(data.expires_in) || 1800) * 1000).toISOString();
  const record = await getCachedTokenRecord(base44);
  const payload = { provider: PROVIDER, access_token: data.access_token, expires_at: expiresAt, retry_after: null };
  if (record) {
    await base44.entities.ApiTokenCache.update(record.id, payload);
  } else {
    await base44.entities.ApiTokenCache.create(payload);
  }
  return data.access_token;
}

// Returns the bearer token for server-side use only. Never send it in a response.
export async function getOpenSkyToken(base44, forceRefresh = false) {
  if (!forceRefresh) {
    const record = await getCachedTokenRecord(base44);
    if (
      record &&
      record.access_token &&
      record.expires_at &&
      new Date(record.expires_at).getTime() - TOKEN_SKEW_MS > Date.now()
    ) {
      return record.access_token;
    }
  }
  return requestToken(base44);
}

// Safe info about the cached token — no secrets, no token value.
export async function getTokenInfo(base44) {
  const record = await getCachedTokenRecord(base44);
  if (!record || !record.expires_at) {
    return { cached: false, valid: false, expires_at: null, retry_after: null };
  }
  return {
    cached: true,
    valid: new Date(record.expires_at).getTime() - TOKEN_SKEW_MS > Date.now(),
    expires_at: record.expires_at,
    retry_after: record.retry_after || null,
  };
}

function logCall(icao24, res) {
  const creditHeaders = ["x-rate-limit-remaining", "x-credits-consumed", "x-credits-remaining"]
    .map((h) => `${h}=${res.headers.get(h) ?? "n/a"}`)
    .join(" ");
  console.log(`[opensky] provider=${PROVIDER} icao24=${icao24} status=${res.status} ${creditHeaders}`);
}

async function openSkyGet(base44, url, icao24) {
  const token = await getOpenSkyToken(base44);
  let res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) {
    // Token rejected — force one fresh token and retry once
    const freshToken = await getOpenSkyToken(base44, true);
    res = await fetch(url, { headers: { Authorization: `Bearer ${freshToken}` } });
  }
  logCall(icao24, res);
  const record = await getCachedTokenRecord(base44);
  if (res.status === 429) {
    const retryAfter = res.headers.get("retry-after");
    if (record) {
      await base44.entities.ApiTokenCache.update(record.id, { retry_after: retryAfter });
    }
  } else if (record && record.retry_after) {
    await base44.entities.ApiTokenCache.update(record.id, { retry_after: null });
  }
  return res;
}

// Current live state vectors for MANY aircraft in a single API call
// (keeps credit use low). Returns the raw OpenSky state-vector array.
export async function fetchOpenSkyStates(base44, icao24List) {
  const hexes = (Array.isArray(icao24List) ? icao24List : [icao24List])
    .map((h) => String(h).toLowerCase())
    .filter(Boolean);
  if (!hexes.length) return { status: 200, states: [] };
  const params = hexes.map((h) => `icao24=${encodeURIComponent(h)}`).join("&");
  const res = await openSkyGet(base44, `${API_BASE}/states/all?${params}`, hexes.join(","));
  if (res.status === 429) {
    return { status: 429, retryAfter: res.headers.get("retry-after"), states: [] };
  }
  if (!res.ok) {
    throw new Error(`OpenSky states request failed with status ${res.status}`);
  }
  const data = await res.json();
  return { status: 200, states: Array.isArray(data && data.states) ? data.states : [] };
}

// Current live state vector for one aircraft (or null if not transmitting)
export async function fetchOpenSkyState(base44, icao24) {
  const hex = String(icao24).toLowerCase();
  const url = `${API_BASE}/states/all?icao24=${encodeURIComponent(hex)}`;
  const res = await openSkyGet(base44, url, hex);
  if (res.status === 429) {
    return { status: 429, retryAfter: res.headers.get("retry-after"), state: null };
  }
  if (!res.ok) {
    throw new Error(`OpenSky states request failed with status ${res.status}`);
  }
  const data = await res.json();
  const states = data && Array.isArray(data.states) ? data.states : [];
  return {
    status: 200,
    state: states.length ? states[0] : null,
    serverTime: data && data.time ? new Date(data.time * 1000).toISOString() : null,
  };
}

// Flight intervals for one aircraft; window must be at most 2 days
export async function fetchOpenSkyFlights(base44, icao24, beginUnix, endUnix) {
  const begin = Number(beginUnix);
  const end = Number(endUnix);
  if (!Number.isFinite(begin) || !Number.isFinite(end)) {
    throw new Error("beginUnix and endUnix are required");
  }
  if (end <= begin) {
    throw new Error("endUnix must be after beginUnix");
  }
  if (end - begin > 2 * 24 * 60 * 60) {
    throw new Error("Time window too large: end-begin must be 2 days or less");
  }
  const hex = String(icao24).toLowerCase();
  const url = `${API_BASE}/flights/aircraft?icao24=${encodeURIComponent(hex)}&begin=${begin}&end=${end}`;
  const res = await openSkyGet(base44, url, hex);
  if (res.status === 429) {
    return { status: 429, retryAfter: res.headers.get("retry-after"), flights: [] };
  }
  if (!res.ok) {
    throw new Error(`OpenSky flights request failed with status ${res.status}`);
  }
  const flights = await res.json();
  return { status: 200, flights: Array.isArray(flights) ? flights : [] };
}

// Normalize a tail number for lookup: uppercase, trim, strip spaces and dashes.
// US registrations keep their leading N (it is part of the registration);
// foreign prefixes (JA, D-, G-...) stay as-is since they are the registration.
export function normalizeTailNumber(tail) {
  return String(tail || "").toUpperCase().trim().replace(/[\s-]+/g, "");
}

// ---------------------------------------------------------------------------
// US FAA N-number -> ICAO 24-bit derivation.
// The FAA assigns US Mode S addresses sequentially: a00001 = N1 up to
// adf7c7 = N99999 (suffix alphabet excludes I and O). Ported from the
// published FAA mapping (ref: guillaumemichel/icao-nnumber_converter).
// Deterministic — NOT a guess. Returns null for non-US or malformed regs.
const US_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const US_DIGITS = "0123456789";
const US_ALL = US_LETTERS + US_DIGITS;
const US_SUFFIX_SIZE = 1 + US_LETTERS.length * (1 + US_LETTERS.length); // 601
const US_BUCKET4 = 1 + US_LETTERS.length + US_DIGITS.length; // 35
const US_BUCKET3 = US_DIGITS.length * US_BUCKET4 + US_SUFFIX_SIZE; // 951
const US_BUCKET2 = US_DIGITS.length * US_BUCKET3 + US_SUFFIX_SIZE; // 10111
const US_BUCKET1 = US_DIGITS.length * US_BUCKET2 + US_SUFFIX_SIZE; // 101711

function usSuffixOffset(s) {
  if (!s.length) return 0;
  if (s.length > 2) return null;
  for (const c of s) {
    if (!US_LETTERS.includes(c)) return null;
  }
  let count = (US_LETTERS.length + 1) * US_LETTERS.indexOf(s[0]) + 1;
  if (s.length === 2) count += US_LETTERS.indexOf(s[1]) + 1;
  return count;
}

export function usTailToIcao24(tail) {
  const n = normalizeTailNumber(tail);
  if (!n.startsWith("N") || n.length < 2 || n.length > 6) return null;
  for (const c of n) {
    if (!US_ALL.includes(c)) return null;
  }
  // Letters may only appear as a 1-2 character suffix at the end
  for (let i = 1; i < n.length - 2; i++) {
    if (US_LETTERS.includes(n[i])) return null;
  }
  const s = n.slice(1);
  let count = 1;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (i === 4) {
      // 5th character after N: digits 0-9 (10000-99999 series)
      count += US_ALL.indexOf(c) + 1;
    } else if (US_LETTERS.includes(c)) {
      const off = usSuffixOffset(s.slice(i));
      if (off == null) return null;
      count += off;
      break; // nothing comes after the letter suffix
    } else {
      const d = c.charCodeAt(0) - 48;
      if (i === 0) count += (d - 1) * US_BUCKET1;
      else if (i === 1) count += d * US_BUCKET2 + US_SUFFIX_SIZE;
      else if (i === 2) count += d * US_BUCKET3 + US_SUFFIX_SIZE;
      else if (i === 3) count += d * US_BUCKET4 + US_SUFFIX_SIZE;
    }
  }
  return "a" + count.toString(16).padStart(5, "0");
}

// Resolve an Aircraft's icao24 from its tail_number via the IcaoLookup table.
// Never guesses, and never overwrites a manually-entered icao24.
export async function resolveAircraftIcao24(base44, aircraftId) {
  const aircraft = await base44.entities.Aircraft.get(aircraftId);
  if (!aircraft) {
    return { ok: false, reason: "not_found" };
  }

  // A manual icao24 is authoritative — automatic resolution must not touch it
  if (aircraft.icao24 && aircraft.icao24_source === "manual") {
    return { ok: true, skipped: true, reason: "manual_icao24" };
  }

  // Tail number field first; fall back to the record's registration, which
  // is the tail number on virtually every existing record (the field was
  // introduced later and older records only carry registration).
  const reg = normalizeTailNumber(aircraft.tail_number || aircraft.registration);
  if (!reg) {
    return { ok: true, skipped: true, reason: "no_tail_number" };
  }

  // US N-numbers: derive the official FAA-assigned hex deterministically.
  // Non-US registrations: fall back to the IcaoLookup table.
  const derived = usTailToIcao24(reg);
  const matches = derived ? [] : await base44.entities.IcaoLookup.filter({ registration: reg });
  const match = matches && matches[0];

  if (derived || (match && match.icao24)) {
    const updates = derived
      ? {
          icao24: derived,
          icao24_source: "faa_derived",
          icao24_verified_at: new Date().toISOString(),
        }
      : {
          icao24: String(match.icao24).toLowerCase(),
          icao24_source: match.source || "icao_lookup",
          icao24_verified_at: new Date().toISOString(),
        };
    // Backfill the tail number field so the ADS-B panel shows it going forward
    if (!aircraft.tail_number) {
      updates.tail_number = reg;
    }
    await base44.entities.Aircraft.update(aircraftId, updates);
    return { ok: true, resolved: true, updates };
  }

  // No lookup match — do not guess; flag for manual entry
  await base44.entities.Aircraft.update(aircraftId, { adsb_status: "no_hex" });
  return { ok: true, resolved: false, adsb_status: "no_hex" };
}