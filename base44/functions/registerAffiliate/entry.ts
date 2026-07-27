import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let body = {};
    try { body = await req.json(); } catch (_) {}

    const { first_name, last_name, email, phone, company } = body;

    if (!first_name || !last_name || !email) {
      return Response.json({ error: 'First name, last name, and email are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = await base44.asServiceRole.entities.Affiliate.filter({ email: normalizedEmail });
    if (existing && existing.length > 0) {
      return Response.json({ error: 'An affiliate with this email already exists' }, { status: 409 });
    }

    // Generate unique referral code
    const base = last_name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'AFF';
    let referral_code = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
    let codeExists = await base44.asServiceRole.entities.Affiliate.filter({ referral_code });
    let attempts = 0;
    while (codeExists && codeExists.length > 0 && attempts < 10) {
      referral_code = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
      codeExists = await base44.asServiceRole.entities.Affiliate.filter({ referral_code });
      attempts++;
    }

    const affiliate = await base44.asServiceRole.entities.Affiliate.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      phone: phone || '',
      company: company || '',
      referral_code,
      status: 'Pending',
      commission_rate: 250,
      total_referrals: 0,
      active_referrals: 0,
      total_earnings: 0,
      total_paid: 0,
      white_label_enabled: false,
      brand_color: '#00447f'
    });

    // Send confirmation email to the applicant via Resend (external — reaches unregistered users)
    try {
      await base44.functions.invoke('sendExternalEmail', {
        to: normalizedEmail,
        subject: `Welcome to the ClearBlue Aero Alliance, ${first_name}!`,
        html: `<div style="font-family:'Open Sans',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
<div style="text-align:center;margin-bottom:32px;">
<img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1c49af472_logo-01.png" alt="ClearBlue Aero Alliance" style="max-width:260px;height:auto;" />
</div>
<p style="font-size:28px;font-weight:700;color:#00447f;text-align:center;margin-bottom:8px;">Welcome, ${first_name}!</p>
<p style="font-size:16px;line-height:1.6;">Thank you for applying to the ClearBlue Aero Affiliate Program! Your application has been received and is now under review.</p>
<p style="font-size:16px;line-height:1.6;">Your Referral Code: <strong>${referral_code}</strong></p>
<p style="font-size:16px;line-height:1.6;">Once your application is approved, you'll receive a separate email with a link to create your account and access your affiliate dashboard. From your dashboard you'll be able to:</p>
<ul style="font-size:16px;line-height:1.8;color:#64748b;">
  <li>Track your referrals and earnings</li>
  <li>Access your unique referral link and QR code</li>
  <li>Manage your white-label branding</li>
</ul>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;" />
<p style="font-size:14px;line-height:1.6;color:#64748b;">If you have any questions, don't hesitate to reach out at <a href="mailto:sales@clearblueaero.com" style="color:#00447f;">sales@clearblueaero.com</a> or <a href="tel:+13862276840" style="color:#00447f;">(386) 227-6840</a>.</p>
<p style="font-size:14px;line-height:1.6;color:#64748b;margin-top:24px;">Best regards,<br /><strong>The ClearBlue Aero Team</strong></p>
</div>`
      });
    } catch (emailError) {
      console.log('Affiliate confirmation email failed (non-blocking):', emailError.message);
    }

    // Notify admin of new affiliate application
    try {
      await base44.functions.invoke('sendExternalEmail', {
        to: 'sales@flyclearblue.com',
        subject: `New Affiliate Application — ${first_name} ${last_name}`,
        html: `<div style="font-family:'Open Sans',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
<p style="font-size:22px;font-weight:700;color:#00447f;">New Affiliate Application</p>
<table style="font-size:16px;line-height:1.8;color:#1a1a1a;">
<tr><td style="font-weight:600;padding-right:12px;">Name:</td><td>${first_name} ${last_name}</td></tr>
<tr><td style="font-weight:600;padding-right:12px;">Email:</td><td>${normalizedEmail}</td></tr>
<tr><td style="font-weight:600;padding-right:12px;">Phone:</td><td>${phone || 'Not provided'}</td></tr>
<tr><td style="font-weight:600;padding-right:12px;">Company:</td><td>${company || 'Not provided'}</td></tr>
<tr><td style="font-weight:600;padding-right:12px;">Referral Code:</td><td><strong>${referral_code}</strong></td></tr>
</table>
<p style="font-size:14px;color:#64748b;margin-top:24px;">Review and approve this affiliate in the admin panel under Affiliates.</p>
</div>`
      });
    } catch (emailError) {
      console.log('Admin notification email failed (non-blocking):', emailError.message);
    }

    return Response.json({ success: true, affiliate });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});