import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const {
      name, email, phone, engineType,
      make, model, year, registration, serial_number,
      total_time, engine_time_smoh, avionics_suite,
      interior_condition, exterior_condition,
      asking_price, location, notes, referral_code
    } = body;

    const isTwin = engineType === 'twin';

    // 1. Create Client (Seller)
    const [firstName, ...lastNameParts] = (name || '').trim().split(' ');
    const lastName = lastNameParts.join(' ') || 'Lead';

    const newClient = await base44.asServiceRole.entities.Client.create({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      client_type: 'Seller',
      lead_source: 'Website',
      status: 'Prospect',
      notes: notes || ''
    });

    // 2. Create Aircraft record
    const aircraftData = {
      make: make || 'Other',
      model: model || '',
      year: year ? Number(year) : undefined,
      registration: registration || '',
      serial_number: serial_number || undefined,
      total_time: total_time ? Number(total_time) : undefined,
      engine_time_smoh: engine_time_smoh ? Number(engine_time_smoh) : undefined,
      engine_time_type: 'SMOH',
      engine_type: isTwin ? 'Piston' : 'Piston',
      num_engines: isTwin ? 2 : 1,
      avionics_suite: avionics_suite || undefined,
      interior_condition: interior_condition || undefined,
      exterior_condition: exterior_condition || undefined,
      asking_price: asking_price ? Number(asking_price) : undefined,
      location: location || undefined,
      seller_id: newClient.id,
      status: 'Available',
      show_on_public: false,
      notes: notes || undefined
    };

    // Remove undefined fields
    Object.keys(aircraftData).forEach(k => aircraftData[k] === undefined && delete aircraftData[k]);

    const newAircraft = await base44.asServiceRole.entities.Aircraft.create(aircraftData);

    // 3. Create Deal
    const sellerName = `${firstName} ${lastName}`.trim();
    const aircraftSummary = `${year || ''} ${make || ''} ${model || ''}`.trim();

    const newDeal = await base44.asServiceRole.entities.Deal.create({
      title: `Sell ${aircraftSummary}`,
      aircraft_id: newAircraft.id,
      aircraft_summary: aircraftSummary,
      seller_id: newClient.id,
      seller_name: sellerName,
      stage: 'Lead',
      asking_price: asking_price ? Number(asking_price) : undefined,
      priority: 'Medium',
      notes: `Listing submitted via website by ${name} (${email}, ${phone}).${notes ? '\n\n' + notes : ''}`
    });

    // 4. Create follow-up activity
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    await base44.asServiceRole.entities.Activity.create({
      type: 'Follow-up',
      subject: `New listing: ${aircraftSummary}`,
      description: `Website listing form submitted. Client: ${sellerName} (${email}, ${phone}).`,
      client_id: newClient.id,
      client_name: sellerName,
      deal_id: newDeal.id,
      aircraft_id: newAircraft.id,
      date: now.toISOString(),
      due_date: dueDate.toISOString(),
      status: 'Open',
      priority: 'Normal'
    });

    // 5. Send email notification (non-blocking)
    try {
      const rows = [
        ['Name', name], ['Email', email], ['Phone', phone],
        ['Aircraft', aircraftSummary], ['Registration', registration || '—'],
        ['Total Time', total_time ? `${total_time} hrs` : '—'],
        ['Engine Time SMOH', engine_time_smoh ? `${engine_time_smoh} hrs` : '—'],
        ['Avionics', avionics_suite || '—'], ['Interior', interior_condition || '—'],
        ['Exterior', exterior_condition || '—'],
        ['Asking Price', asking_price ? `$${Number(asking_price).toLocaleString()}` : '—'],
        ['Location', location || '—'], ['Notes', notes || '—'],
      ].map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-weight:600;vertical-align:top;white-space:nowrap;">${k}</td><td style="padding:6px 0;color:#1a1a1a;vertical-align:top;">${(v || '').replace(/\n/g, '<br />')}</td></tr>`).join('');
      await base44.functions.invoke('sendExternalEmail', {
        to: 'sales@flyclearblue.com',
        subject: `New ${isTwin ? 'Multi-Engine' : 'Single Engine'} Listing — ${aircraftSummary}`,
        html: `<div style="font-family:'Open Sans',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
<div style="text-align:center;margin-bottom:24px;"><img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1c49af472_logo-01.png" alt="ClearBlue Aero" style="max-width:240px;height:auto;" /></div>
<p style="font-size:22px;font-weight:700;color:#00447f;margin-bottom:16px;">New Aircraft Listing Submission</p>
<table style="width:100%;border-collapse:collapse;font-size:15px;">${rows}</table>
<p style="font-size:13px;color:#64748b;margin-top:24px;">A client, aircraft, and deal record have been created in the CRM. A follow-up activity is scheduled.</p>
</div>`
      });
    } catch (emailError) {
      console.log('Email notification failed (non-blocking):', emailError.message);
    }

    // 6. Sync lead to HubSpot CRM (non-blocking)
    try {
      const aircraftSummaryParts = [
        aircraftSummary,
        registration ? `N-Number: ${registration}` : null,
        asking_price ? `Asking: $${Number(asking_price).toLocaleString()}` : null,
        total_time ? `Total Time: ${total_time} hrs` : null,
        engine_time_smoh ? `Engine SMOH: ${engine_time_smoh} hrs` : null,
        avionics_suite ? `Avionics: ${avionics_suite}` : null,
        interior_condition ? `Interior: ${interior_condition}` : null,
        exterior_condition ? `Exterior: ${exterior_condition}` : null,
        location ? `Location: ${location}` : null,
      ].filter(Boolean);
      await base44.functions.invoke('syncToHubspot', {
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        lead_source: 'Website',
        aircraft_summary: `Aircraft Lead: ${aircraftSummaryParts.join(' | ')}`,
        notes: notes || ''
      });
    } catch (hubspotError) {
      console.log('HubSpot sync failed (non-blocking):', hubspotError.message);
    }

    // 7. Track affiliate referral if code present
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
            deal_id: newDeal.id,
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
      dealId: newDeal.id
    });
  } catch (error) {
    console.error('Listing submission error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});