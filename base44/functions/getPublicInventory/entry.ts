import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function signUrl(base44, uri) {
  // Only sign private file URIs (storage paths), not full https:// URLs
  if (!uri || uri.startsWith('http')) return uri;
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