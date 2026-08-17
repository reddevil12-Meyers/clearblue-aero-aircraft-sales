import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const {
      first_name, last_name, email, phone,
      make, model, year, total_hours,
      additional_notes, lead_source, referral_code
    } = body;

    // 1. Create Client (Seller)
    const newClient = await base44.asServiceRole.entities.Client.create({
      first_name: first_name || '',
      last_name: last_name || '',
      email,
      phone,
      client_type: 'Seller',
      lead_source: lead_source || 'Website',
      lead_subsource: 'Valuation Request',
      status: 'Prospect',
      aircraft_interests: `${year || ''} ${make || ''} ${model || ''}`.trim(),
      notes: additional_notes || ''
    });

    // 2. Create Aircraft record
    const aircraftData = {
      make: make || 'Other',
      model: model || '',
      year: year ? Number(year) : undefined,
      registration: 'Pending',
      total_time: total_hours ? Number(total_hours) : undefined,
      engine_type: 'Piston',
      num_engines: 1,
      seller_id: newClient.id,
      status: 'Appraisal Only',
      show_on_public: false,
      notes: additional_notes || undefined
    };

    Object.keys(aircraftData).forEach(k => aircraftData[k] === undefined && delete aircraftData[k]);

    const newAircraft = await base44.asServiceRole.entities.Aircraft.create(aircraftData);

    // 3. Create Appraisal record
    const aircraftSummary = `${year || ''} ${make || ''} ${model || ''}`.trim();
    const sellerName = `${first_name} ${last_name}`.trim();

    const newAppraisal = await base44.asServiceRole.entities.Appraisal.create({
      aircraft_id: newAircraft.id,
      aircraft_summary: aircraftSummary,
      client_id: newClient.id,
      client_name: sellerName,
      appraisal_type: 'Desktop',
      purpose: 'Sale/Purchase',
      status: 'Draft',
      logbook_status: 'Not Checked',
      appraiser_notes: `Valuation request submitted via website sell page.\n\nClient: ${sellerName} (${email}, ${phone})\nAircraft: ${aircraftSummary}\nTotal Hours: ${total_hours || 'N/A'}\nLead Source: ${lead_source || 'Website'}\n\nAdditional Notes:\n${additional_notes || 'None provided'}`
    });

    // 4. Send admin notification email
    try {
      const rows = [
        ['Name', sellerName], ['Email', email], ['Phone', phone],
        ['Aircraft', aircraftSummary], ['Total Hours', total_hours || 'N/A'],
        ['Lead Source', lead_source || 'Website'],
        ['Additional Notes', additional_notes || 'None'],
      ].map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-weight:600;vertical-align:top;white-space:nowrap;">${k}</td><td style="padding:6px 0;color:#1a1a1a;vertical-align:top;">${(v || '').replace(/\n/g, '<br />')}</td></tr>`).join('');
      await base44.functions.invoke('sendExternalEmail', {
        to: 'sales@flyclearblue.com',
        subject: `New Valuation Request — ${aircraftSummary}`,
        html: `<div style="font-family:'Open Sans',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
<div style="text-align:center;margin-bottom:24px;"><img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1c49af472_logo-01.png" alt="ClearBlue Aero" style="max-width:240px;height:auto;" /></div>
<p style="font-size:22px;font-weight:700;color:#00447f;margin-bottom:16px;">New Valuation Request</p>
<table style="width:100%;border-collapse:collapse;font-size:15px;">${rows}</table>
<p style="font-size:13px;color:#64748b;margin-top:24px;">A client, aircraft, and appraisal record have been created in the CRM.</p>
</div>`
      });
    } catch (emailError) {
      console.log('Email notification failed (non-blocking):', emailError.message);
    }

    // Sync lead to HubSpot CRM (non-blocking)
    try {
      await base44.functions.invoke('syncToHubspot', {
        email,
        first_name: first_name || '',
        last_name: last_name || '',
        phone,
        lead_source: lead_source || 'Website',
        aircraft_summary: `Valuation Request — ${aircraftSummary}`,
        notes: additional_notes || ''
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
          await base44.asServiceRole.entities.Referral.create({
            affiliate_id: aff.id,
            referral_code,
            client_name: sellerName,
            client_email: email,
            client_phone: phone,
            aircraft_summary: aircraftSummary,
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

    return Response.json({
      success: true,
      clientId: newClient.id,
      aircraftId: newAircraft.id,
      appraisalId: newAppraisal.id
    });
  } catch (error) {
    console.error('Valuation request error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});