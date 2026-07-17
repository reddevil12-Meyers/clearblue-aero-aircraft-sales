import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (_) {}

    const affiliates = await base44.asServiceRole.entities.Affiliate.filter({ email: user.email.toLowerCase() });
    if (!affiliates || affiliates.length === 0) {
      return Response.json({ error: 'No affiliate account found for this user' }, { status: 404 });
    }

    const affiliate = affiliates[0];

    // Only allow updating branding fields
    const allowedFields = ['brand_name', 'brand_logo_url', 'brand_color', 'brand_tagline', 'white_label_enabled'];
    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No valid branding fields to update' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.Affiliate.update(affiliate.id, updateData);

    return Response.json({ success: true, affiliate: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});