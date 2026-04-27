import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const aircraft = await base44.asServiceRole.entities.Aircraft.filter(
      { show_on_public: true },
      'sort_order',
      200
    );
    // Sort: by sort_order (nulls last), then by created_date desc
    aircraft.sort((a, b) => {
      const aHas = a.sort_order != null;
      const bHas = b.sort_order != null;
      if (aHas && bHas) return a.sort_order - b.sort_order;
      if (aHas) return -1;
      if (bHas) return 1;
      return 0;
    });

    // Generate signed URLs for images
    const signed = await Promise.all(aircraft.map(async (a) => {
      if (!a.images?.length) return a;
      const signedImages = await Promise.all(
        a.images.map(async (uri) => {
          try {
            const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 3600 });
            return signed_url;
          } catch {
            return uri;
          }
        })
      );
      return { ...a, images: signedImages };
    }));

    return Response.json({ aircraft: signed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});