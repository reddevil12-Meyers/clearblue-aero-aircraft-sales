import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { logbook_url, aircraft_title, folder_id } = await req.json();
    if (!logbook_url) return Response.json({ error: 'logbook_url is required' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    // Fetch the file from the URL
    const fileRes = await fetch(logbook_url);
    if (!fileRes.ok) return Response.json({ error: 'Could not fetch file from URL' }, { status: 400 });

    const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';
    const fileBuffer = await fileRes.arrayBuffer();

    // Derive filename from URL
    const urlPath = new URL(logbook_url).pathname;
    const rawName = urlPath.split('/').pop() || 'logbook';
    const filename = decodeURIComponent(rawName);

    const metadata = { name: filename, mimeType: contentType };
    if (folder_id) metadata.parents = [folder_id];

    // Multipart upload
    const boundary = 'logbook_boundary_314159';
    const metaBytes = new TextEncoder().encode(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify(metadata) +
      `\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`
    );
    const closeBytes = new TextEncoder().encode(`\r\n--${boundary}--`);
    const bodyBytes = new Uint8Array(metaBytes.byteLength + fileBuffer.byteLength + closeBytes.byteLength);
    bodyBytes.set(metaBytes, 0);
    bodyBytes.set(new Uint8Array(fileBuffer), metaBytes.byteLength);
    bodyBytes.set(closeBytes, metaBytes.byteLength + fileBuffer.byteLength);

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary="${boundary}"`,
        },
        body: bodyBytes,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return Response.json({ error: 'Drive upload failed', details: err }, { status: 500 });
    }

    const driveFile = await uploadRes.json();
    return Response.json({ success: true, drive_file: driveFile });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});