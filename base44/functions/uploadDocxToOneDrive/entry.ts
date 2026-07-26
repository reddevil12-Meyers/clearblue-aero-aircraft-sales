import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { filename, base64data } = await req.json();
    if (!filename || !base64data) {
      return Response.json({ error: 'filename and base64data are required' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('microsoft_word');

    // Decode base64 to raw bytes
    const binaryString = atob(base64data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to OneDrive under a dedicated folder
    const folderName = 'ClearBlue Aero - Purchase Agreements';
    const safeFilename = filename.replace(/[/\\]/g, '_');
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${folderName}/${safeFilename}:/content`;

    const graphRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
      body: bytes,
    });

    if (!graphRes.ok) {
      const errText = await graphRes.text();
      return Response.json({ error: `Graph API error (${graphRes.status}): ${errText}` }, { status: 502 });
    }

    const data = await graphRes.json();
    return Response.json({
      webUrl: data.webUrl,
      id: data.id,
      name: data.name,
    });
  } catch (error) {
    console.error('uploadDocxToOneDrive error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});