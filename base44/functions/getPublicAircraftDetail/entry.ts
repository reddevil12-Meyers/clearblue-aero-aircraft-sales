import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function resolveImageUrl(uri) {
  if (!uri) return uri;
  // Rewrite base44.app public file URLs to media.base44.com CDN (no auth required)
  const match = uri.match(/https:\/\/base44\.app\/api\/apps\/[^/]+\/files\/mp\/public\/([^/]+)\/(.+)/);
  if (match) return `https://media.base44.com/images/public/${match[1]}/${match[2]}`;
  return uri;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { id } = await req.json();

    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

    const aircraft = await base44.asServiceRole.entities.Aircraft.get(id);

    if (!aircraft || !aircraft.show_on_public) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    aircraft.images = (aircraft.images || []).map(resolveImageUrl);

    return Response.json(
      { aircraft },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});