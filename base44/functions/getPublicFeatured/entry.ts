import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const aircraft = await base44.asServiceRole.entities.Aircraft.filter(
      { show_on_public: true, featured: true },
      '-created_date',
      3
    );
    return Response.json({ aircraft });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});