import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
    const aircraft = await base44.asServiceRole.entities.Aircraft.filter(
      { show_on_public: true },
      'sort_order',
      200
    );

    aircraft.sort((a, b) => {
      const aHas = a.sort_order != null;
      const bHas = b.sort_order != null;
      if (aHas && bHas) return a.sort_order - b.sort_order;
      if (aHas) return -1;
      if (bHas) return 1;
      return 0;
    });

    const result = aircraft.map(a => ({
      ...a,
      images: (a.images || []).map(resolveImageUrl)
    }));

    return Response.json({ aircraft: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});