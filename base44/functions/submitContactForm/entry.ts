import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { name, email, phone, subject, message, referral_code, lead_subsource } = body;

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
      lead_subsource: lead_subsource || 'Contact Us Form',
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
      const rows = [
        ['Name', name], ['Email', email], ['Phone', phone],
        ['Subject', subject || 'General Inquiry'], ['Message', message || '—'],
      ].map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-weight:600;vertical-align:top;white-space:nowrap;">${k}</td><td style="padding:6px 0;color:#1a1a1a;vertical-align:top;">${(v || '').replace(/\n/g, '<br />')}</td></tr>`).join('');
      await base44.functions.invoke('sendExternalEmail', {
        to: 'sales@flyclearblue.com',
        subject: `Website Contact: ${subject || 'General Inquiry'} — ${name}`,
        html: `<div style="font-family:'Open Sans',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
<div style="text-align:center;margin-bottom:24px;"><img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1c49af472_logo-01.png" alt="ClearBlue Aero" style="max-width:240px;height:auto;" /></div>
<p style="font-size:22px;font-weight:700;color:#00447f;margin-bottom:16px;">New Website Contact Lead</p>
<table style="width:100%;border-collapse:collapse;font-size:15px;">${rows}</table>
<p style="font-size:13px;color:#64748b;margin-top:24px;">This lead was submitted via the public contact form and a follow-up activity has been created in the CRM.</p>
</div>`
      });
    } catch (emailError) {
      console.log('Email notification failed (non-blocking):', emailError.message);
    }

    // Sync lead to HubSpot CRM (non-blocking)
    try {
      await base44.functions.invoke('syncToHubspot', {
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        lead_source: 'Website',
        notes: `Contact Form — Subject: ${subject}\n\n${message}`
      });
    } catch (hubspotError) {
      console.log('HubSpot sync failed (non-blocking):', hubspotError.message);
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