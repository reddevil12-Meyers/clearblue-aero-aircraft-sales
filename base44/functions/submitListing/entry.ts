import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { name, email, phone, make, model, year, registration, engineType, ...rest } = body;

    const isTwin = engineType === 'twin';

    // Create client record
    const [firstName, ...lastNameParts] = (name || '').trim().split(' ');
    const lastName = lastNameParts.join(' ') || 'Lead';
    const detailLines = Object.entries(body)
      .filter(([k]) => !['name', 'email', 'phone'].includes(k))
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    const newClient = await base44.asServiceRole.entities.Client.create({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      client_type: 'Seller',
      lead_source: 'Website',
      status: 'Prospect',
      notes: `Aircraft Listing Submission (${isTwin ? 'Multi-Engine' : 'Single Engine'}):\n\n${detailLines}`
    });

    // Create follow-up activity
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    await base44.asServiceRole.entities.Activity.create({
      type: 'Follow-up',
      subject: `New listing submission: ${year} ${make} ${model}`,
      description: `Aircraft listing form submitted by ${name}.\n\n${detailLines}`,
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
        to: 'sales@flyclearblue.com',
        subject: `New ${isTwin ? 'Multi-Engine' : 'Single Engine'} Listing — ${year} ${make} ${model}`,
        body: `New aircraft listing submission from ${name} (${email}, ${phone}):\n\n${detailLines}`,
      });
    } catch (emailError) {
      console.log('Email notification failed (non-blocking):', emailError.message);
    }

    return Response.json({ success: true, clientId: newClient.id });
  } catch (error) {
    console.error('Listing submission error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});