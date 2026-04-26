import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { targetEmail, newRole } = body;

    // Update user role
    await base44.auth.updateMe({ role: newRole }, targetEmail);

    // Log activity
    await base44.asServiceRole.entities.UserActivity.create({
      user_email: targetEmail,
      action: 'Role Changed',
      description: `Role changed to ${newRole}`,
      performed_by: user.email,
      timestamp: new Date().toISOString(),
      previous_value: 'unknown',
      new_value: newRole
    });

    return Response.json({ success: true, email: targetEmail, role: newRole });
  } catch (error) {
    console.error('Update user role error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});