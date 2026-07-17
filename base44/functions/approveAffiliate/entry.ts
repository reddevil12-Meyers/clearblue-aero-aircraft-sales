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
        from_name: 'ClearBlue Aero Alliance',
        subject: `You're Approved — Welcome to the ClearBlue Aero Alliance, ${affiliate.first_name}!`,
        body: `<div style="font-family:'Open Sans',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
<div style="text-align:center;margin-bottom:32px;">
<img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png" alt="ClearBlue Aero Alliance" style="max-width:260px;height:auto;" />
</div>
<p style="font-size:16px;line-height:1.6;">Hi ${affiliate.first_name},</p>
<p style="font-size:16px;line-height:1.6;">Great news! Your application to the <strong>ClearBlue Aero Alliance</strong> has been approved. You're now part of an exclusive network of aviation professionals earning commissions for aircraft referrals.</p>
<div style="background:#f0f5fa;border-radius:10px;padding:20px;margin:24px 0;">
<p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Your Referral Code</p>
<p style="margin:0;font-size:22px;font-weight:700;color:#00447f;letter-spacing:0.05em;">${affiliate.referral_code}</p>
<p style="margin:12px 0 0;font-size:13px;color:#64748b;">Your unique referral link:</p>
<p style="margin:4px 0 0;font-size:14px;color:#00447f;word-break:break-all;">https://clearblueaero.com/?ref=${affiliate.referral_code}</p>
</div>
<p style="font-size:16px;line-height:1.6;">Ready to jump in? Click below to accept your invitation and start collaborating with your team.</p>
<div style="text-align:center;margin:28px 0;">
<a href="https://clearblueaero.com/login" style="display:inline-block;background:#00447f;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px;letter-spacing:0.02em;">Accept Invitation &amp; Go to Dashboard</a>
</div>
<p style="font-size:14px;line-height:1.6;color:#64748b;">Once logged in, you'll be able to:</p>
<ul style="font-size:14px;line-height:1.8;color:#64748b;padding-left:20px;">
<li>Track your referrals and earnings in real-time</li>
<li>Access your unique referral link and QR code</li>
<li>Manage your white-label branding</li>
<li>View your commission history</li>
</ul>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;" />
<p style="font-size:14px;line-height:1.6;color:#64748b;">If you have any questions, don't hesitate to reach out at <a href="mailto:sales@clearblueaero.com" style="color:#00447f;">sales@clearblueaero.com</a> or <a href="tel:+13862276840" style="color:#00447f;">(386) 227-6840</a>.</p>
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