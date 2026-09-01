import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const {
      n_number,
      hangar_city,
      letters_status,
      counsel_name,
      firm,
      counsel_email,
      pr_client_name,
      time_critical
    } = body;

    if (!counsel_name || !counsel_email) {
      return Response.json({ error: 'Counsel name and email are required' }, { status: 400 });
    }

    const SOURCE = 'estate-aircraft';

    // Store the lead as a Client record tagged estate-aircraft.
    const [firstName, ...lastNameParts] = (counsel_name || '').trim().split(' ');
    const lastName = lastNameParts.join(' ') || 'Counsel';

    const notes = [
      `Source: ${SOURCE}`,
      `N-Number: ${n_number || '—'}`,
      `Hangar / Airport City: ${hangar_city || '—'}`,
      `Letters Status: ${letters_status || '—'}`,
      `Counsel: ${counsel_name}${firm ? `, ${firm}` : ''}`,
      `Counsel Email: ${counsel_email}`,
      `PR / Client: ${pr_client_name || '—'}`,
      `Time-critical notes: ${time_critical || '—'}`
    ].join('\n');

    const newClient = await base44.asServiceRole.entities.Client.create({
      first_name: firstName || 'Estate',
      last_name: lastName,
      email: counsel_email,
      client_type: 'Owner',
      lead_source: 'Website',
      lead_subsource: SOURCE,
      status: 'Prospect',
      notes
    });

    // Follow-up activity for the team.
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // Situation Report within 3 business days
    await base44.asServiceRole.entities.Activity.create({
      type: 'Follow-up',
      subject: `Estate Aircraft intake — ${n_number || 'no N-number'} (${counsel_name})`,
      description: notes,
      client_id: newClient.id,
      client_name: `${firstName || 'Estate'} ${lastName}`,
      date: now.toISOString(),
      due_date: dueDate.toISOString(),
      status: 'Open',
      priority: 'High'
    });

    // Email the site inbox (non-blocking).
    try {
      const rows = [
        ['Source', SOURCE],
        ['N-Number', n_number || '—'],
        ['Hangar / Airport City', hangar_city || '—'],
        ['Letters Status', letters_status || '—'],
        ['Counsel', counsel_name || '—'],
        ['Firm', firm || '—'],
        ['Counsel Email', counsel_email || '—'],
        ['PR / Client', pr_client_name || '—'],
        ['Time-critical notes', time_critical || '—']
      ].map(([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-weight:600;vertical-align:top;white-space:nowrap;">${k}</td><td style="padding:6px 0;color:#1a1a1a;vertical-align:top;">${(v || '').replace(/\n/g, '<br />')}</td></tr>`
      ).join('');

      await base44.functions.invoke('sendExternalEmail', {
        to: 'sales@flyclearblue.com',
        subject: `Estate Aircraft intake — ${n_number || 'no N-number'} — ${counsel_name}`,
        html: `<div style="font-family:'Open Sans',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
<div style="text-align:center;margin-bottom:24px;"><img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png" alt="ClearBlue Aero" style="max-width:240px;height:auto;" /></div>
<p style="font-size:22px;font-weight:700;color:#00447f;margin-bottom:16px;">New Estate Aircraft Concierge Intake</p>
<p style="font-size:14px;color:#64748b;margin-bottom:16px;">A Situation Report has been requested. Reply to counsel within three business days of a complete intake.</p>
<table style="width:100%;border-collapse:collapse;font-size:15px;">${rows}</table>
<p style="font-size:13px;color:#64748b;margin-top:24px;">Source tag: <strong>${SOURCE}</strong>. Lead stored in CRM with a High-priority follow-up due in 3 days.</p>
</div>`
      });
    } catch (emailError) {
      console.log('Estate intake email failed (non-blocking):', emailError.message);
    }

    return Response.json({ success: true, clientId: newClient.id });
  } catch (error) {
    console.error('Estate intake error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});