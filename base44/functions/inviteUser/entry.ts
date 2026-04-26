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

    // Invite user
    await base44.users.inviteUser(email, role || 'user');

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