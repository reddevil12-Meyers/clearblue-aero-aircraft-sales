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

    // Send confirmation email to the applicant
    try {
      await base44.integrations.Core.SendEmail({
        to: normalizedEmail,
        subject: `Welcome to the ClearBlue Aero Alliance, ${first_name}!`,
        body: `Hi ${first_name},\n\nThank you for applying to the ClearBlue Aero Affiliate Program! Your application has been received and is now under review.\n\nYour Referral Code: ${referral_code}\n\nOnce your application is approved, you'll receive a separate email with a link to set up your dashboard login. From your dashboard you'll be able to:\n  - Track your referrals and earnings\n  - Access your unique referral link and QR code\n  - Manage your white-label branding\n\nIf you have any questions, don't hesitate to reach out at sales@flyclearblue.com or (386) 227-6840.\n\nBest regards,\nThe ClearBlue Aero Team`
      });
    } catch (emailError) {
      console.log('Affiliate confirmation email failed (non-blocking):', emailError.message);
    }

    // Notify admin of new affiliate application
    try {
      await base44.integrations.Core.SendEmail({
        to: 'sales@flyclearblue.com',
        subject: `New Affiliate Application — ${first_name} ${last_name}`,
        body: `A new affiliate has applied to the ClearBlue Aero Affiliate Program.\n\nName: ${first_name} ${last_name}\nEmail: ${normalizedEmail}\nPhone: ${phone || 'Not provided'}\nCompany: ${company || 'Not provided'}\nReferral Code: ${referral_code}\n\nReview and approve this affiliate in the admin panel under Affiliates.`
      });
    } catch (emailError) {
      console.log('Admin notification email failed (non-blocking):', emailError.message);
    }

    return Response.json({ success: true, affiliate });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});