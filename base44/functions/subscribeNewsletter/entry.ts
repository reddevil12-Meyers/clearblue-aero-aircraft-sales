import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, name } = await req.json();

    if (!email) return Response.json({ error: 'Email is required' }, { status: 400 });

    // Check if already subscribed
    const existing = await base44.asServiceRole.entities.NewsletterSubscriber.filter({ email });
    if (existing.length > 0) {
      // Re-subscribe if they were unsubscribed
      if (!existing[0].subscribed) {
        await base44.asServiceRole.entities.NewsletterSubscriber.update(existing[0].id, { subscribed: true });
        return Response.json({ success: true, message: 'Welcome back! You are now subscribed.' });
      }
      return Response.json({ success: true, message: 'You are already subscribed!' });
    }

    await base44.asServiceRole.entities.NewsletterSubscriber.create({ email, name: name || '', subscribed: true });

    return Response.json({ success: true, message: 'Successfully subscribed!' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});