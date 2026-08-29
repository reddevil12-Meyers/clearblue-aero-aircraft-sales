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

    const htmlBody = `<div style="font-family:'Open Sans',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
<div style="text-align:center;margin-bottom:32px;">
<img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1c49af472_logo-01.png" alt="ClearBlue Aero" style="max-width:260px;height:auto;" />
</div>
<div style="font-size:16px;line-height:1.6;">${emailBody}</div>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;" />
<p style="font-size:14px;line-height:1.6;color:#64748b;">© 2026 ClearBlue Aero · <a href="mailto:sales@clearblueaero.com" style="color:#00447f;">sales@clearblueaero.com</a> · <a href="tel:+13862276840" style="color:#00447f;">386 227-6840</a></p>
</div>`;

    await base44.integrations.Core.SendEmail({
      to,
      subject,
      body: htmlBody
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});