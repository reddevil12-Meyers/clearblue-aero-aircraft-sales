import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getZohoAccessToken, zohoApiBase } from "../../shared/zohoAuth.ts";

// Maps a Client record into Zoho CRM Lead fields.
function clientToZohoLead(c: any) {
  const props: Record<string, string> = {};
  if (c.last_name) props.Last_Name = c.last_name;
  if (c.first_name) props.First_Name = c.first_name;
  if (c.email) props.Email = c.email;
  if (c.phone) props.Phone = c.phone;
  if (c.company) props.Company = c.company;
  if (c.address) props.Street = c.address;
  if (c.city) props.City = c.city;
  if (c.state) props.State = c.state;
  if (c.zip) props.Zip_Code = c.zip;
  if (c.aircraft_interests) props.Description = c.aircraft_interests;
  if (c.client_type) props.Lead_Type = c.client_type;
  return props;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    let body: any = {};
    try { body = await req.json(); } catch (_) { /* allow empty */ }
    const { client_ids } = body;

    let clients: any[];
    if (Array.isArray(client_ids) && client_ids.length > 0) {
      clients = [];
      for (const id of client_ids) {
        clients.push(await base44.asServiceRole.entities.Client.get(id));
      }
    } else {
      clients = await base44.asServiceRole.entities.Client.list('-updated_date', 200);
    }

    const accessToken = await getZohoAccessToken();
    const apiBase = zohoApiBase();
    const results: any[] = [];

    for (const c of clients) {
      if (!c.email && !c.last_name) {
        results.push({ skipped: true, reason: 'missing last name and email' });
        continue;
      }

      let zohoId: string | null = null;
      // Search by email when available
      if (c.email) {
        try {
          const searchRes = await fetch(`${apiBase}/Leads/search?email=${encodeURIComponent(c.email)}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.data && searchData.data.length > 0) {
              zohoId = searchData.data[0].id;
            }
          }
        } catch (e) {
          console.log('Zoho search failed (non-blocking):', (e as Error).message);
        }
      }

      const props = clientToZohoLead(c);
      let action: string;

      if (zohoId) {
        const updateRes = await fetch(`${apiBase}/Leads/${zohoId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [props] }),
        });
        if (!updateRes.ok) {
          const err = await updateRes.text();
          results.push({ id: c.id, email: c.email, error: `Update failed: ${err}` });
          continue;
        }
        action = 'updated';
      } else {
        const createRes = await fetch(`${apiBase}/Leads`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [props] }),
        });
        if (!createRes.ok) {
          const err = await createRes.text();
          results.push({ id: c.id, email: c.email, error: `Create failed: ${err}` });
          continue;
        }
        const createData = await createRes.json();
        if (createData.data && createData.data[0] && createData.data[0].details && createData.data[0].details.id) {
          zohoId = createData.data[0].details.id;
        } else if (createData.data && createData.data[0] && createData.data[0].id) {
          zohoId = createData.data[0].id;
        }
        action = 'created';
      }

      results.push({ id: c.id, email: c.email, zoho_id: zohoId, action });
    }

    return Response.json({ success: true, processed: results.length, results });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}