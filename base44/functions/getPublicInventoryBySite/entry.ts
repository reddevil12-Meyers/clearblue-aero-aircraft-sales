import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

function resolveImageUrl(uri) {
  if (!uri) return uri;
  const match = uri.match(/https:\/\/base44\.app\/api\/apps\/[^/]+\/files\/mp\/public\/([^/]+)\/(.+)/);
  if (match) return `https://media.base44.com/images/public/${match[1]}/${match[2]}`;
  return uri;
}

const VALID_SITES = ['clearblue', 'beechcraft', 'gardner'];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Accept site from query param or POST body
    let site = null;
    let limit = 200;
    let offset = 0;
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      site = body.site || null;
      if (body.limit) limit = body.limit;
      if (body.offset) offset = body.offset;
    } else {
      const url = new URL(req.url);
      site = url.searchParams.get('site');
      const qLimit = url.searchParams.get('limit');
      const qOffset = url.searchParams.get('offset');
      if (qLimit) limit = parseInt(qLimit);
      if (qOffset) offset = parseInt(qOffset);
    }

    if (!site || !VALID_SITES.includes(site)) {
      return Response.json(
        { error: `Invalid or missing 'site' parameter. Must be one of: ${VALID_SITES.join(', ')}` },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Fetch all public aircraft, then filter by published_sites
    const aircraft = await base44.asServiceRole.entities.Aircraft.filter(
      { show_on_public: true },
      'sort_order',
      200
    );

    const filtered = aircraft.filter(a =>
      Array.isArray(a.published_sites) && a.published_sites.includes(site)
    );

    filtered.sort((a, b) => {
      const aHas = a.sort_order != null;
      const bHas = b.sort_order != null;
      if (aHas && bHas) return a.sort_order - b.sort_order;
      if (aHas) return -1;
      if (bHas) return 1;
      return 0;
    });

    const paged = filtered.slice(offset, offset + limit);
    const hasMore = offset + limit < filtered.length;
    const total = filtered.length;

    const result = paged.map(a => ({
      ...a,
      images: (a.images || []).map(resolveImageUrl)
    }));

    return Response.json(
      { aircraft: result, hasMore, total, site },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
});