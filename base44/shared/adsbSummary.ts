const DAY_MS = 24 * 60 * 60 * 1000;
export const ADSB_COVERAGE_DAYS = 30;

// Build the brokerage-style ADS-B summary from 30-day flight events.
// recentEvents: stored AircraftFlightEvent records within the coverage window.
export function buildAdsBSummary(recentEvents, newestLastSeenIso, now = new Date()) {
  if (!recentEvents || recentEvents.length === 0) {
    return `No ADS-B flights recorded in the last ${ADSB_COVERAGE_DAYS} days.`;
  }
  const counts = {};
  recentEvents.forEach((e) =>
    [e.dep_airport, e.arr_airport].forEach((ap) => {
      if (ap) counts[ap] = (counts[ap] || 0) + 1;
    })
  );
  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map((x) => x[0]);

  const parts = [`${recentEvents.length} flights in the last ${ADSB_COVERAGE_DAYS} days.`];
  if (top.length) parts.push(`Most frequent airports: ${top.join(", ")}.`);
  if (newestLastSeenIso) {
    const days = Math.floor((now.getTime() - new Date(newestLastSeenIso).getTime()) / DAY_MS);
    parts.push(`Last seen ${days <= 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`}.`);
  }
  return parts.join(" ");
}