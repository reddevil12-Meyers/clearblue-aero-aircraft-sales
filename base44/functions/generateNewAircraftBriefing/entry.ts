import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sanitizeFilename, renderBriefingDoc, generateBriefingText } from '../../shared/briefingPdf.ts';
import { getDriveToken, findOrCreateRootFolder, findOrCreateMakeFolder, briefingExists, uploadPdf } from '../../shared/driveBriefings.ts';

// Triggered by an entity automation on Aircraft create.
// Payload shape: { data: { make, model, ... } }
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({})) || {};
    const aircraft = body.data || body.aircraft || {};
    const make = (aircraft.make || '').trim();
    const model = (aircraft.model || '').trim();
    if (!make || !model) return Response.json({ skipped: true, reason: 'missing make or model' });

    const token = await getDriveToken(base44);
    const rootId = await findOrCreateRootFolder(token);
    const folderId = await findOrCreateMakeFolder(token, rootId, make);
    const filename = sanitizeFilename(make, model);

    if (await briefingExists(token, folderId, filename)) {
      return Response.json({ skipped: true, reason: 'briefing already exists', filename });
    }

    const content = await generateBriefingText(base44, make, model);
    const doc = renderBriefingDoc(make, model, content);
    const pdfBytes = await doc.output('arraybuffer');
    const driveFile = await uploadPdf(token, folderId, filename, pdfBytes);

    return Response.json({ created: true, filename, drive_file: driveFile });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}