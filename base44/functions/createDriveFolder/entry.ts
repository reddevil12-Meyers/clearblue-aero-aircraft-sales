import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { folder_name } = await req.json();
    if (!folder_name) return Response.json({ error: 'folder_name is required' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folder_name,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: 'Failed to create folder', details: err }, { status: 500 });
    }

    const folder = await res.json();
    return Response.json({ success: true, folder });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});