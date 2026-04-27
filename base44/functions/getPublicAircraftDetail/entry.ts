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
    const { id } = await req.json();

    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

    const aircraft = await base44.asServiceRole.entities.Aircraft.get(id);

    if (!aircraft || !aircraft.show_on_public) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    // Sign all images sequentially to avoid rate limits
    if (aircraft.images?.length) {
      const signedImages = [];
      for (const uri of aircraft.images) {
        signedImages.push(await signUrl(base44, uri));
      }
      aircraft.images = signedImages;
    }

    return Response.json({ aircraft });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});