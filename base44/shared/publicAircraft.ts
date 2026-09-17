// ADS-B fields that must never be exposed on public endpoints, plus the
// activity fields that are only included for listings published with
// adsb_public_visible enabled. Public pages receive Aircraft data
// exclusively via service-role endpoints that run this sanitizer.
const INTERNAL_ADSB_FIELDS = [
  "tail_number",
  "icao24",
  "icao24_source",
  "icao24_verified_at",
  "adsb_last_lat",
  "adsb_last_lon",
  "priority_adsb",
  "adsb_public_visible",
];
const ACTIVITY_FIELDS = ["adsb_status", "adsb_summary_text", "adsb_last_seen_at"];

export function stripAircraftForPublic(aircraft, { includeActivity = false } = {}) {
  const out = { ...aircraft };
  for (const f of INTERNAL_ADSB_FIELDS) delete out[f];
  if (!includeActivity) {
    for (const f of ACTIVITY_FIELDS) delete out[f];
  }
  return out;
}