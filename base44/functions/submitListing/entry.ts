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
      asking_price, location, notes
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
      const detailLines = [
        `Name: ${name}`, `Email: ${email}`, `Phone: ${phone}`,
        `Aircraft: ${aircraftSummary}`, `Registration: ${registration}`,
        `Total Time: ${total_time} hrs`, `Engine Time SMOH: ${engine_time_smoh} hrs`,
        `Avionics: ${avionics_suite}`, `Interior: ${interior_condition}`,
        `Exterior: ${exterior_condition}`, `Asking Price: $${asking_price}`,
        `Location: ${location}`, `Notes: ${notes}`
      ].join('\n');

      await base44.integrations.Core.SendEmail({
        to: 'sales@flyclearblue.com',
        subject: `New ${isTwin ? 'Multi-Engine' : 'Single Engine'} Listing — ${aircraftSummary}`,
        body: `New aircraft listing submission:\n\n${detailLines}`,
      });
    } catch (emailError) {
      console.log('Email notification failed (non-blocking):', emailError.message);
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