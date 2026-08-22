import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sanitizeFilename, renderBriefingDoc, generateBriefingText } from '../../shared/briefingPdf.ts';
import { getDriveToken, findOrCreateRootFolder, findOrCreateMakeFolder, briefingExists, uploadPdf } from '../../shared/driveBriefings.ts';

const LIST_LIMIT = 500;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    let isAuthorized = false;
    try {
      const user = await base44.auth.me();
      if (user && user.role === 'admin') isAuthorized = true;
    } catch (_) {}
    if (!isAuthorized) {
      try {
        await base44.asServiceRole.entities.Aircraft.list('-created_date', 1);
        isAuthorized = true;
      } catch (_) {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    let body = {};
    try { body = await req.json(); } catch (_) {}

    // Compute the unique make+model pairs across all inventory
    if (body.action === 'pairs') {
      const all = await base44.asServiceRole.entities.Aircraft.list('-created_date', LIST_LIMIT);
      const seen = new Set();
      const pairs = [];
      for (const a of all) {
        if (!a.make || !a.model) continue;
        const key = `${a.make}|${a.model}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        pairs.push({ make: a.make, model: a.model });
      }
      return Response.json({ pairs });
    }

    // Process a batch of {make, model} pairs — dedup via Drive check
    const batch = Array.isArray(body.batch) ? body.batch : [];
    if (batch.length === 0) return Response.json({ processed: 0, results: [] });

    const token = await getDriveToken(base44);
    const rootId = await findOrCreateRootFolder(token);
    const results = [];

    for (const pair of batch) {
      const make = (pair.make || '').trim();
      const model = (pair.model || '').trim();
      if (!make || !model) { results.push({ make, model, status: 'skipped' }); continue; }
      try {
        const folderId = await findOrCreateMakeFolder(token, rootId, make);
        const filename = sanitizeFilename(make, model);
        if (await briefingExists(token, folderId, filename)) {
          results.push({ make, model, status: 'exists' });
          continue;
        }
        const content = await generateBriefingText(base44, make, model);
        const doc = renderBriefingDoc(make, model, content);
        const pdfBytes = await doc.output('arraybuffer');
        await uploadPdf(token, folderId, filename, pdfBytes);
        results.push({ make, model, status: 'created' });
      } catch (e) {
        results.push({ make, model, status: 'error', error: e.message });
      }
    }

    return Response.json({ processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}