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