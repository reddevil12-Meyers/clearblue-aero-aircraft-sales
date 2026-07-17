import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    let body = {};
    try { body = await req.json(); } catch (_) {}
    const { affiliate_id } = body;

    if (!affiliate_id) {
      return Response.json({ error: 'affiliate_id is required' }, { status: 400 });
    }

    const affiliate = await base44.asServiceRole.entities.Affiliate.get(affiliate_id);
    if (!affiliate) {
      return Response.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    if (affiliate.status === 'Active' && affiliate.user_id) {
      return Response.json({ error: 'Affiliate is already approved' }, { status: 409 });
    }

    // Step 1: Invite the user with 'user' role (admin is authenticated, so this works)
    await base44.users.inviteUser(affiliate.email, 'user');

    // Step 2: Check if the user already exists (e.g., previously registered) — if so, promote and link now
    let userId = null;
    const users = await base44.asServiceRole.entities.User.filter({ email: affiliate.email });
    if (users && users.length > 0) {
      userId = users[0].id;
      await base44.asServiceRole.entities.User.update(userId, { role: 'affiliate' });
    }

    // Step 3: Update affiliate record — link user_id (if found) and set status to Active
    // If user doesn't exist yet, getAffiliateDashboard will auto-promote and link them when they log in
    await base44.asServiceRole.entities.Affiliate.update(affiliate_id, {
      user_id: userId,
      status: 'Active'
    });

    // Step 4: Send approval email to the affiliate
    try {
      await base44.integrations.Core.SendEmail({
        to: affiliate.email,
        subject: `You're Approved — Welcome to the ClearBlue Aero Alliance, ${affiliate.first_name}!`,
        body: `Hi ${affiliate.first_name},\n\nGreat news! Your application to the ClearBlue Aero Affiliate Program has been approved.\n\nYour Referral Code: ${affiliate.referral_code}\n\nWe've sent you a separate email with a link to set up your dashboard login. Once logged in, you'll be able to:\n  - Track your referrals and earnings in real-time\n  - Access your unique referral link and QR code\n  - Manage your white-label branding\n  - View your commission history\n\nYour unique referral link: https://clearblueaero.com/?ref=${affiliate.referral_code}\n\nIf you have any questions, don't hesitate to reach out at sales@clearblueaero.com or (386) 227-6840.\n\nBest regards,\nThe ClearBlue Aero Team`
      });
    } catch (emailError) {
      console.log('Approval email failed (non-blocking):', emailError.message);
    }

    // Log activity
    await base44.asServiceRole.entities.UserActivity.create({
      user_email: affiliate.email,
      action: 'Role Changed',
      description: `Affiliate approved — role set to affiliate`,
      performed_by: user.email,
      timestamp: new Date().toISOString(),
      new_value: 'affiliate'
    });

    return Response.json({ success: true, affiliate_id, user_id: userId });
  } catch (error) {
    console.error('Approve affiliate error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});