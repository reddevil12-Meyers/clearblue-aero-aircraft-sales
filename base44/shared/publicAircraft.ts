// Public pages receive Aircraft data exclusively via service-role endpoints
// that run this sanitizer — the single choke point for stripping any
// internal-only fields before they reach a public payload.
export function stripAircraftForPublic(aircraft) {
  return { ...aircraft };
}

// Rewrite base44.app public file URLs to media.base44.com CDN (no auth required)
export function resolveImageUrl(uri) {
  if (!uri) return uri;
  const match = uri.match(/https:\/\/base44\.app\/api\/apps\/[^/]+\/files\/mp\/public\/([^/]+)\/(.+)/);
  if (match) return `https://media.base44.com/images/public/${match[1]}/${match[2]}`;
  return uri;
}