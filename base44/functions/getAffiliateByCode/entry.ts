import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);

    let code = url.searchParams.get('code');
    if (!code) {
      try {
        const body = await req.json();
        code = body.code;
      } catch (_) {}
    }

    if (!code) {
      return Response.json({ found: false });
    }

    const affiliates = await base44.asServiceRole.entities.Affiliate.filter({ referral_code: code });
    if (!affiliates || affiliates.length === 0) {
      return Response.json({ found: false });
    }

    const aff = affiliates[0];

    // Only return branding info if white_label is enabled and affiliate is active
    if (aff.status !== 'Active' || !aff.white_label_enabled) {
      return Response.json({ found: true, white_label: false });
    }

    return Response.json({
      found: true,
      white_label: true,
      brand_name: aff.brand_name || `${aff.first_name} ${aff.last_name}`,
      brand_logo_url: aff.brand_logo_url || null,
      brand_color: aff.brand_color || '#00447f',
      brand_tagline: aff.brand_tagline || null,
      affiliate_name: `${aff.first_name} ${aff.last_name}`
    });
  } catch (error) {
    return Response.json({ found: false, error: error.message });
  }
});