import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { email, role } = body;

    // Invite user (creates the pending account + role on the platform)
    await base44.users.inviteUser(email, role || 'user');

    // The platform invite email links to the home page (not adjustable),
    // so we send our own email with a direct link to the register page.
    const appOrigin = Deno.env.get('APP_ORIGIN') || 'https://clearblueaero.com';
    const registerUrl = `${appOrigin}/register`;
    const inviterName = user.full_name || user.email || 'ClearBlue Aero';
    const roleLabel = (role || 'user') === 'admin' ? 'Administrator' : 'Team Member';

    const html = `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
        <h2 style="color:#00447f; margin-bottom: 16px;">You're invited to ClearBlue Aero</h2>
        <p style="font-size: 15px; line-height: 1.6;">
          ${inviterName} has invited you to join ClearBlue Aero as a <strong>${roleLabel}</strong>.
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
          Click the button below to set up your account and access the platform.
        </p>
        <p style="margin: 28px 0;">
          <a href="${registerUrl}"
             style="display:inline-block; background:#00447f; color:#ffffff; text-decoration:none;
                    padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Access App &amp; Register
          </a>
        </p>
        <p style="font-size: 13px; color: #64748b;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${registerUrl}" style="color:#00447f;">${registerUrl}</a>
        </p>
      </div>
    `;

    try {
      const apiKey = Deno.env.get('RESEND_API_KEY');
      const fromEmail = Deno.env.get('FROM_EMAIL');
      if (apiKey && fromEmail) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email],
            subject: "You're invited to ClearBlue Aero",
            html,
          }),
        });
      }
    } catch (emailError) {
      console.error('Custom invite email failed (account still created):', emailError);
    }

    // Log activity
    await base44.asServiceRole.entities.UserActivity.create({
      user_email: email,
      action: 'Invited',
      description: `Invited as ${role || 'user'}`,
      performed_by: user.email,
      timestamp: new Date().toISOString(),
      new_value: role || 'user'
    });

    return Response.json({ success: true, email });
  } catch (error) {
    console.error('Invite user error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});