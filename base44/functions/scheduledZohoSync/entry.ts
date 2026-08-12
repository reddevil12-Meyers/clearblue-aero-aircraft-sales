import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { runSyncToZoho, runSyncFromZoho } from "../../shared/zohoSync.ts";

// Scheduled two-way Zoho sync. Runs as service role (no user context).
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    const toResult = await runSyncToZoho(svc, { mode: 'both' });
    const fromResult = await runSyncFromZoho(svc, { mode: 'both' });

    return Response.json({ success: true, toZoho: toResult, fromZoho: fromResult });
  } catch (error) {
    console.error('Scheduled Zoho sync error:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}