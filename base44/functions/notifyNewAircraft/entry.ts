import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Only notify on create events for public aircraft
    if (event?.type !== 'create' || !data?.show_on_public) {
      return Response.json({ skipped: true });
    }

    const aircraft = data;
    const subscribers = await base44.asServiceRole.entities.NewsletterSubscriber.filter({ subscribed: true });

    if (subscribers.length === 0) return Response.json({ sent: 0 });

    const title = `${aircraft.year} ${aircraft.make} ${aircraft.model}`;
    const price = aircraft.asking_price ? `$${aircraft.asking_price.toLocaleString()}` : 'Price on request';
    const location = aircraft.location || '';

    const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
  <div style="background: #00447f; padding: 24px 32px;">
    <img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1c49af472_logo-01.png" alt="ClearBlue Aero" style="max-width:260px;height:auto;" />
  </div>
  <div style="padding: 32px;">
    <p style="color: #C9A84C; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px;">New Aircraft Listed</p>
    <h1 style="color: #00447f; font-size: 28px; margin: 0 0 8px;">${title}</h1>
    ${location ? `<p style="color: #888; font-size: 14px; margin: 0 0 20px;">📍 ${location}</p>` : ''}
    <p style="color: #00447f; font-size: 24px; font-weight: bold; margin: 0 0 24px;">${price}</p>
    ${aircraft.notes ? `<p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">${aircraft.notes.slice(0, 300)}${aircraft.notes.length > 300 ? '…' : ''}</p>` : ''}
    <a href="https://app.flyclearblue.com/inventory/${aircraft.id}" style="display: inline-block; background: #00447f; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">View Aircraft →</a>
  </div>
  <div style="background: #f5f6f8; padding: 20px 32px; font-size: 12px; color: #aaa; text-align: center;">
    <p>You're receiving this because you subscribed to ClearBlue Aero aircraft alerts.</p>
    <p style="margin-top: 4px;">© 2026 ClearBlue Aero · sales@flyclearblue.com · 386 227-6840</p>
  </div>
</div>`;

    let sent = 0;
    for (const sub of subscribers) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: sub.email,
        subject: `New Aircraft: ${title} — ClearBlue Aero`,
        body: emailBody,
        from_name: 'ClearBlue Aero'
      });
      sent++;
    }

    return Response.json({ sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});