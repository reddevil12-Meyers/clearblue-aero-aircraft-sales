import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { to, subject, body, attachment_url, attachment_name } = await req.json();
    if (!to || !subject || !body) {
      return Response.json({ error: 'to, subject, and body are required' }, { status: 400 });
    }

    let emailBody = body;

    if (attachment_url) {
      emailBody += `\n\n---\nAttached Document: <a href="${attachment_url}">${attachment_name || 'View Document'}</a>`;
    }

    await base44.integrations.Core.SendEmail({
      to,
      subject,
      body: emailBody
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});