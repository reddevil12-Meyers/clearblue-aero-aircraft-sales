import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

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

    // Send email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: "sales@flyclearblue.com",
      subject: `Website Contact: ${subject || 'General Inquiry'} — ${name}`,
      body: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nSubject: ${subject}\n\nMessage:\n${message}`,
    });

    return Response.json({ success: true, clientId: newClient.id });
  } catch (error) {
    console.error('Contact form error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});