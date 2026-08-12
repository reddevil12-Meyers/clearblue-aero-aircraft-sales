import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { runSyncToZoho } from "../../shared/zohoSync.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    let body: any = {};
    try { body = await req.json(); } catch (_) { /* allow empty */ }

    const result = await runSyncToZoho(base44.asServiceRole, {
      mode: body.mode || 'both',
      lead_ids: body.lead_ids,
      client_ids: body.client_ids,
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}