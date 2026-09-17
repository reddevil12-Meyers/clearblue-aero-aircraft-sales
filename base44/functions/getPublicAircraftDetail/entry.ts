import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Support both GET (query param) and POST (JSON body)
    let id;
    let site = null;
    if (req.method === 'GET') {
      const url = new URL(req.url);
      id = url.searchParams.get('id');
      site = url.searchParams.get('site');
    } else {
      const body = await req.json();
      id = body.id;
      site = body.site;
    }

    if (!id) return Response.json({ error: 'Missing id' }, { status: 400, headers: CORS_HEADERS });

    const aircraft = await base44.asServiceRole.entities.Aircraft.get(id);

    if (!aircraft || !aircraft.show_on_public || aircraft.status === "Lead") {
      return Response.json({ error: 'Not found' }, { status: 404, headers: CORS_HEADERS });
    }

    // If a site is specified, verify the aircraft is published to that site
    if (site && (!Array.isArray(aircraft.published_sites) || !aircraft.published_sites.includes(site))) {
      return Response.json({ error: 'Not found' }, { status: 404, headers: CORS_HEADERS });
    }

    // Public payload: internal ADS-B fields are stripped; activity fields
    // (status, summary, last seen) only when the listing is published with
    // the public-visibility flag enabled.
    const publicAircraft = stripAircraftForPublic(aircraft, {
      includeActivity: aircraft.adsb_public_visible === true,
    });
    publicAircraft.images = (aircraft.images || []).map(resolveImageUrl);

    return Response.json(
      { aircraft: publicAircraft },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
});