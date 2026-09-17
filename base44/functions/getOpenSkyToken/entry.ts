import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { getOpenSkyToken, getTokenInfo } from "../../shared/opensky.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    await getOpenSkyToken(base44, Boolean(body && body.forceRefresh));

    // Never return the token itself — only cache status
    const info = await getTokenInfo(base44);
    return Response.json({
      ok: true,
      provider: "opensky",
      cached: info.cached,
      valid: info.valid,
      expires_at: info.expires_at,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}