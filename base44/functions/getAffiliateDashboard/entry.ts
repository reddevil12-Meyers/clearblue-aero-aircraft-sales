import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const affiliates = await base44.asServiceRole.entities.Affiliate.filter({ email: user.email.toLowerCase() });
    if (!affiliates || affiliates.length === 0) {
      return Response.json({ error: 'No affiliate account found for this user' }, { status: 404 });
    }

    const affiliate = affiliates[0];

    const referrals = await base44.asServiceRole.entities.Referral.filter(
      { affiliate_id: affiliate.id },
      '-created_date',
      200
    );

    return Response.json({ affiliate, referrals: referrals || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});