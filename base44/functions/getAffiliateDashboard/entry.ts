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

    // Auto-sync: if affiliate is Active, ensure the user has the 'affiliate' role and is linked
    let roleUpdated = false;
    let linked = false;
    if (affiliate.status === 'Active') {
      if (user.role !== 'affiliate') {
        try {
          await base44.asServiceRole.entities.User.update(user.id, { role: 'affiliate' });
          await base44.asServiceRole.entities.UserActivity.create({
            user_email: user.email,
            action: 'Role Changed',
            description: 'Auto-promoted to affiliate role on dashboard visit',
            performed_by: 'system',
            timestamp: new Date().toISOString(),
            new_value: 'affiliate'
          });
          roleUpdated = true;
        } catch (e) {
          console.log('Role promotion failed (non-blocking):', e.message);
        }
      }
      if (!affiliate.user_id || affiliate.user_id !== user.id) {
        try {
          await base44.asServiceRole.entities.Affiliate.update(affiliate.id, { user_id: user.id });
          linked = true;
        } catch (e) {
          console.log('User linking failed (non-blocking):', e.message);
        }
      }
    }

    const referrals = await base44.asServiceRole.entities.Referral.filter(
      { affiliate_id: affiliate.id },
      '-created_date',
      200
    );

    return Response.json({ affiliate, referrals: referrals || [], roleUpdated, linked });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});