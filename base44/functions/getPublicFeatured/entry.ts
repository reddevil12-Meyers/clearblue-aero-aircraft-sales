import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const aircraft = await base44.asServiceRole.entities.Aircraft.filter(
      { show_on_public: true, featured: true },
      'sort_order',
      10
    );
    // Sort: by sort_order (nulls last), take first 3
    aircraft.sort((a, b) => {
      const aHas = a.sort_order != null;
      const bHas = b.sort_order != null;
      if (aHas && bHas) return a.sort_order - b.sort_order;
      if (aHas) return -1;
      if (bHas) return 1;
      return 0;
    });
    return Response.json({ aircraft: aircraft.slice(0, 3) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});