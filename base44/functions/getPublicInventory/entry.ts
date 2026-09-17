import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { stripAircraftForPublic } from '../../shared/publicAircraft.ts';

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
  return uri;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  try {
    const base44 = createClientFromRequest(req);

    // Parse pagination params from POST body or query string
    let limit = 200;
    let offset = 0;
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      if (body.limit) limit = body.limit;
      if (body.offset) offset = body.offset;
    } else {
      const url = new URL(req.url);
      const qLimit = url.searchParams.get('limit');
      const qOffset = url.searchParams.get('offset');
      if (qLimit) limit = parseInt(qLimit);
      if (qOffset) offset = parseInt(qOffset);
    }

    const aircraft = await base44.asServiceRole.entities.Aircraft.filter(
      { show_on_public: true, status: { $in: ["Coming Soon", "Available", "For Lease", "Under Contract", "Closing", "Sold"] } },
      'sort_order',
      200
    );

    // Mirror the CRM reorder-page order exactly:
    // new records (no sort_order yet) first, newest created first, then manual sort order.
    aircraft.sort((a, b) => {
      const aHas = a.sort_order != null;
      const bHas = b.sort_order != null;
      if (!aHas && !bHas) return new Date(b.created_date || 0) - new Date(a.created_date || 0);
      if (!aHas) return -1;
      if (!bHas) return 1;
      return a.sort_order - b.sort_order;
    });

    const paged = aircraft.slice(offset, offset + limit);
    const hasMore = offset + limit < aircraft.length;
    const total = aircraft.length;

    const result = paged.map(a => {
      const pub = stripAircraftForPublic(a);
      pub.images = (a.images || []).map(resolveImageUrl);
      return pub;
    });

    return Response.json({ aircraft: result, hasMore, total }, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
});