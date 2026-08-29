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

    // Step 1: Check if the user already exists (e.g., previously registered) — if so, promote and link now
    let userId = null;
    const users = await base44.asServiceRole.entities.User.filter({ email: affiliate.email });
    if (users && users.length > 0) {
      userId = users[0].id;
      await base44.asServiceRole.entities.User.update(userId, { role: 'affiliate' });
    }

    // Step 2: Update affiliate record — link user_id (if found) and set status to Active
    // If user doesn't exist yet, getAffiliateDashboard will auto-promote and link them when they log in
    await base44.asServiceRole.entities.Affiliate.update(affiliate_id, {
      user_id: userId,
      status: 'Active'
    });

    // Step 3: Send platform invitation so the affiliate can set up their own password (admin-initiated)
    try {
      await base44.users.inviteUser(affiliate.email, 'affiliate');
    } catch (inviteError) {
      console.log('Affiliate invite failed (non-blocking — user may already exist):', inviteError.message);
    }

    // Step 4: Send approval notification email via Resend
    try {
      await base44.functions.invoke('sendExternalEmail', {
        to: affiliate.email,
        subject: `You've been approved!`,
        html: `<div style="font-family:'Open Sans',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
<div style="text-align:center;margin-bottom:32px;">
<img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1c49af472_logo-01.png" alt="ClearBlue Aero Alliance" style="max-width:260px;height:auto;" />
</div>
<p style="font-size:28px;font-weight:700;color:#00447f;text-align:center;margin-bottom:8px;">You've been approved!</p>
<p style="font-size:16px;line-height:1.6;">Hey ${affiliate.first_name},</p>
<p style="font-size:16px;line-height:1.6;">Your application to the <strong>ClearBlue Aero Affiliate Program</strong> has been approved! We're excited to have you on board.</p>
<p style="font-size:16px;line-height:1.6;">Your referral code is <strong>${affiliate.referral_code}</strong>.</p>
<p style="font-size:16px;line-height:1.6;">Your account has been created! To get started, click the button below to set up your password:</p>
<p style="text-align:center;margin:24px 0;">
<a href="https://app.flyclearblue.com/forgot-password" style="display:inline-block;background:#00447f;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:700;font-size:16px;">Set Up Your Password</a>
</p>
<p style="font-size:16px;line-height:1.6;">Enter your email address <strong>${affiliate.email}</strong> on that page, and we'll send you a link to create your password. Once set, you'll be able to log in and access your affiliate dashboard to track referrals, manage earnings, and customize your branding.</p>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;" />
<p style="font-size:14px;line-height:1.6;color:#64748b;">If you have any questions, don't hesitate to reach out at <a href="mailto:sales@clearblueaero.com" style="color:#00447f;">sales@clearblueaero.com</a> or <a href="tel:+13862276840" style="color:#00447f;">386 227-6840</a>.</p>
<p style="font-size:14px;line-height:1.6;color:#64748b;margin-top:24px;">Best regards,<br /><strong>The ClearBlue Aero Alliance Team</strong></p>
</div>`
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