import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { id } = await req.json();

    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

    const aircraft = await base44.asServiceRole.entities.Aircraft.get(id);

    if (!aircraft || !aircraft.show_on_public) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    // Generate signed URLs for images
    if (aircraft.images?.length) {
      aircraft.images = await Promise.all(
        aircraft.images.map(async (uri) => {
          try {
            const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 3600 });
            return signed_url;
          } catch {
            return uri;
          }
        })
      );
    }

    return Response.json({ aircraft });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});