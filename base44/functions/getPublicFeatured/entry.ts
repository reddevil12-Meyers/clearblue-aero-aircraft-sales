import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=60',
};

function resolveImageUrl(uri) {
  if (!uri) return uri;
  // Rewrite base44.app public file URLs to media.base44.com CDN (no auth required)
  const match = uri.match(/https:\/\/base44\.app\/api\/apps\/[^/]+\/files\/mp\/public\/([^/]+)\/(.+)/);
  if (match) return `https://media.base44.com/images/public/${match[1]}/${match[2]}`;
  // All other URLs (external, etc.) pass through unchanged
  return uri;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  try {
    const base44 = createClientFromRequest(req);
    const aircraft = await base44.asServiceRole.entities.Aircraft.filter(
      { show_on_public: true, featured: true, status: { $ne: "Lead" } },
      'sort_order',
      10
    );
    aircraft.sort((a, b) => {
      const aHas = a.sort_order != null;
      const bHas = b.sort_order != null;
      if (aHas && bHas) return a.sort_order - b.sort_order;
      if (aHas) return -1;
      if (bHas) return 1;
      return 0;
    });

    const result = aircraft.slice(0, 3).map(a => ({
      ...a,
      images: (a.images || []).map(resolveImageUrl)
    }));

    return Response.json({ aircraft: result }, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
});