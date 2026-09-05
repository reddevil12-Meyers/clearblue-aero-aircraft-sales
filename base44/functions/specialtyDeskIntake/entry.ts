import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { createZohoLead } from "../../shared/zoho.ts";

const esc = (v) => (v || '').replace(/\n/g, '<br />');

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { desk_slug, name, email, phone, role, model_interest, budget_or_nnumber, notes } = body;

    const [firstName, ...lastNameParts] = String(name || '').trim().split(' ');
    const lastName = lastNameParts.join(' ') || 'Lead';

    const clientType =
      role === 'Sell this make' ? 'Owner' : role === 'Buy this make' ? 'Buyer' : 'Both Buyer and Owner';

    const summaryLines = [
      `Specialty Desk Intake (${desk_slug})`,
      `Role: ${role}`,
      model_interest ? `Model / mission: ${model_interest}` : null,
      budget_or_nnumber ? `Budget / N-number: ${budget_or_nnumber}` : null,
      notes ? `Notes: ${notes}` : null,
    ].filter(Boolean);
    const summary = summaryLines.join('\n');

    // Create client record tagged with the desk slug
    const newClient = await base44.asServiceRole.entities.Client.create({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      client_type: clientType,
      lead_source: 'Website',
      lead_subsource: `Specialty Desk — ${desk_slug}`,
      status: 'Prospect',
      notes: summary,
    });

    // Create follow-up activity
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    await base44.asServiceRole.entities.Activity.create({
      type: 'Follow-up',
      subject: `Follow up on ${desk_slug} desk lead from ${firstName} ${lastName}`,
      description: summary,
      client_id: newClient.id,
      client_name: `${firstName} ${lastName}`,
      date: now.toISOString(),
      due_date: dueDate.toISOString(),
      status: 'Open',
      priority: 'Normal',
    });

    // Email the site inbox (non-blocking)
    try {
      const rows = [
        ['Name', name], ['Email', email], ['Phone', phone],
        ['Desk', desk_slug], ['Role', role],
        ['Model / mission', model_interest], ['Budget / N-number', budget_or_nnumber],
        ['Notes', notes || '—'],
      ].map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-weight:600;vertical-align:top;white-space:nowrap;">${k}</td><td style="padding:6px 0;color:#1a1a1a;vertical-align:top;">${esc(v) || '—'}</td></tr>`).join('');
      await base44.functions.invoke('sendExternalEmail', {
        to: 'sales@flyclearblue.com',
        subject: `Specialty Desk (${desk_slug}) — ${name}`,
        html: `<div style="font-family:'Open Sans',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
<div style="text-align:center;margin-bottom:24px;"><img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1c49af472_logo-01.png" alt="ClearBlue Aero" style="max-width:240px;height:auto;" /></div>
<p style="font-size:22px;font-weight:700;color:#00447f;margin-bottom:16px;">New Specialty Desk Lead — ${desk_slug}</p>
<table style="width:100%;border-collapse:collapse;font-size:15px;">${rows}</table>
<p style="font-size:13px;color:#64748b;margin-top:24px;">Submitted from the ${desk_slug} specialty desk intake form. A client record and follow-up activity have been created in the CRM.</p>
</div>`,
      });
    } catch (emailError) {
      console.log('Email notification failed (non-blocking):', emailError.message);
    }

    // Sync lead to Zoho CRM (non-blocking)
    try {
      await createZohoLead({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        description: summary,
        tags: [`Specialty Desk - ${desk_slug}`, "ClearBlue Aero"],
      });
    } catch (zohoError) {
      console.log('Zoho lead sync failed (non-blocking):', zohoError.message);
    }

    return Response.json({ success: true, clientId: newClient.id });
  } catch (error) {
    console.error('Specialty desk intake error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}