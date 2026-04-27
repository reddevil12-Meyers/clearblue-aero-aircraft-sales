import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function resolveImageUrl(uri) {
  if (!uri) return uri;
  // Rewrite base44.app public file URLs to media.base44.com CDN (no auth required)
  const match = uri.match(/https:\/\/base44\.app\/api\/apps\/[^/]+\/files\/mp\/public\/([^/]+)\/(.+)/);
  if (match) return `https://media.base44.com/images/public/${match[1]}/${match[2]}`;
  // Private URIs need signing — handled separately; public https URLs pass through
  return uri;
}

async function signUrl(base44, uri) {
  if (!uri) return uri;
  // Rewrite base44.app public URLs to CDN
  const resolved = resolveImageUrl(uri);
  if (resolved !== uri) return resolved;
  // If it's already an http URL (external), pass through
  if (uri.startsWith('http')) return uri;
  // Otherwise it's a private URI — sign it
  try {
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 3600 });
    return signed_url;
  } catch {
    return uri;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const aircraft = await base44.asServiceRole.entities.Aircraft.filter(
      { show_on_public: true },
      'sort_order',
      200
    );

    // Sort: by sort_order (nulls last)
    aircraft.sort((a, b) => {
      const aHas = a.sort_order != null;
      const bHas = b.sort_order != null;
      if (aHas && bHas) return a.sort_order - b.sort_order;
      if (aHas) return -1;
      if (bHas) return 1;
      return 0;
    });

    // For inventory cards, only sign the first image (thumbnail) — sequential to avoid rate limits
    const result = [];
    for (const a of aircraft) {
      if (a.images?.length) {
        const firstSigned = await signUrl(base44, a.images[0]);
        result.push({ ...a, images: [firstSigned, ...a.images.slice(1)] });
      } else {
        result.push(a);
      }
    }

    return Response.json({ aircraft: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});