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
      const detailLines = [
        `Name: ${sellerName}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Aircraft: ${aircraftSummary}`,
        `Total Hours: ${total_hours || 'N/A'}`,
        `Lead Source: ${lead_source || 'Website'}`,
        `Additional Notes: ${additional_notes || 'None'}`,
        '',
        `Client ID: ${newClient.id}`,
        `Aircraft ID: ${newAircraft.id}`,
        `Appraisal ID: ${newAppraisal.id}`
      ].join('\n');

      await base44.integrations.Core.SendEmail({
        to: 'sales@flyclearblue.com',
        subject: `New Valuation Request — ${aircraftSummary}`,
        body: `A new valuation request was submitted from the website:\n\n${detailLines}`
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