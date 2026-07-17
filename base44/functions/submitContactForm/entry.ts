import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { name, email, phone, subject, message, referral_code } = body;

    // Determine client type from subject
    let clientType = 'Both';
    if (subject.toLowerCase().includes('buy')) clientType = 'Buyer';
    else if (subject.toLowerCase().includes('sell')) clientType = 'Seller';
    else if (subject.toLowerCase().includes('appraisal')) clientType = 'Appraiser Client';

    // Create client record
    const [firstName, ...lastNameParts] = name.trim().split(' ');
    const lastName = lastNameParts.join(' ') || 'Lead';
    const newClient = await base44.asServiceRole.entities.Client.create({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      client_type: clientType,
      lead_source: 'Website',
      status: 'Prospect',
      notes: `Contact Form:\nSubject: ${subject}\n\n${message}`
    });

    // Create follow-up activity
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    await base44.asServiceRole.entities.Activity.create({
      type: 'Follow-up',
      subject: `Follow up on new website lead from ${firstName} ${lastName}`,
      description: `Contact form inquiry:\nSubject: ${subject}\n\nMessage: ${message}`,
      client_id: newClient.id,
      client_name: `${firstName} ${lastName}`,
      date: now.toISOString(),
      due_date: dueDate.toISOString(),
      status: 'Open',
      priority: 'Normal'
    });

    // Send email notification (non-blocking)
    try {
      await base44.integrations.Core.SendEmail({
        to: "sales@flyclearblue.com",
        subject: `Website Contact: ${subject || 'General Inquiry'} — ${name}`,
        body: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nSubject: ${subject}\n\nMessage:\n${message}`,
      });
    } catch (emailError) {
      console.log('Email notification failed (non-blocking):', emailError.message);
    }

    // Track affiliate referral if code present
    if (referral_code) {
      try {
        const affiliates = await base44.asServiceRole.entities.Affiliate.filter({ referral_code });
        if (affiliates && affiliates.length > 0) {
          const aff = affiliates[0];
          const clientName = `${firstName} ${lastName}`;
          await base44.asServiceRole.entities.Referral.create({
            affiliate_id: aff.id,
            referral_code,
            client_name: clientName,
            client_email: email,
            client_phone: phone,
            client_id: newClient.id,
            status: 'Lead',
            commission_status: 'Pending',
            source: 'Referral Link'
          });
          await base44.asServiceRole.entities.Affiliate.update(aff.id, {
            total_referrals: (aff.total_referrals || 0) + 1,
            active_referrals: (aff.active_referrals || 0) + 1
          });
        }
      } catch (refError) {
        console.log('Referral tracking failed (non-blocking):', refError.message);
      }
    }

    return Response.json({ success: true, clientId: newClient.id });
  } catch (error) {
    console.error('Contact form error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});