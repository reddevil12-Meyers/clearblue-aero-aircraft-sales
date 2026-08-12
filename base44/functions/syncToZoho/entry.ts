import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getZohoAccessToken, zohoApiBase } from "../../shared/zohoAuth.ts";

// Maps a Lead record into Zoho CRM Lead fields.
function leadToZohoLead(l: any) {
  const props: Record<string, string> = {};
  if (l.last_name) props.Last_Name = l.last_name;
  if (l.first_name) props.First_Name = l.first_name;
  if (l.email) props.Email = l.email;
  if (l.phone) props.Phone = l.phone;
  if (l.company) props.Company = l.company;
  if (l.aircraft_interest) props.Description = l.aircraft_interest;
  if (l.lead_source) props.Lead_Source = l.lead_source;
  return props;
}

// Maps a Client record into Zoho CRM Contact fields.
function clientToZohoContact(c: any) {
  const props: Record<string, string> = {};
  if (c.last_name) props.Last_Name = c.last_name;
  if (c.first_name) props.First_Name = c.first_name;
  if (c.email) props.Email = c.email;
  if (c.phone) props.Phone = c.phone;
  if (c.company) props.Title = c.company;
  if (c.address) props.Mailing_Street = c.address;
  if (c.city) props.Mailing_City = c.city;
  if (c.state) props.Mailing_State = c.state;
  if (c.zip) props.Mailing_Zip = c.zip;
  if (c.aircraft_interests) props.Description = c.aircraft_interests;
  return props;
}

// Upsert a record to a Zoho module (Leads or Contacts) by email search.
async function upsertToZoho(apiBase: string, accessToken: string, module: string, props: Record<string, string>, email?: string) {
  let zohoId: string | null = null;
  if (email) {
    try {
      const searchRes = await fetch(`${apiBase}/${module}/search?email=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.data && searchData.data.length > 0) {
          zohoId = searchData.data[0].id;
        }
      }
    } catch (e) {
      console.log(`Zoho ${module} search failed (non-blocking):`, (e as Error).message);
    }
  }

  let action: string;
  if (zohoId) {
    const updateRes = await fetch(`${apiBase}/${module}/${zohoId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [props] }),
    });
    if (!updateRes.ok) {
      const err = await updateRes.text();
      return { zoho_id: null, action: null, error: `Update failed: ${err}` };
    }
    action = 'updated';
  } else {
    const createRes = await fetch(`${apiBase}/${module}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [props] }),
    });
    if (!createRes.ok) {
      const err = await createRes.text();
      return { zoho_id: null, action: null, error: `Create failed: ${err}` };
    }
    const createData = await createRes.json();
    if (createData.data && createData.data[0]) {
      zohoId = createData.data[0].details?.id || createData.data[0].id || null;
    }
    action = 'created';
  }
  return { zoho_id: zohoId, action, error: null };
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    let body: any = {};
    try { body = await req.json(); } catch (_) { /* allow empty */ }
    const mode = body.mode || 'both'; // 'leads' | 'contacts' | 'both'
    const lead_ids = body.lead_ids;
    const client_ids = body.client_ids;

    const accessToken = await getZohoAccessToken();
    const apiBase = zohoApiBase();
    const leadResults: any[] = [];
    const contactResults: any[] = [];

    // Sync Lead records → Zoho Leads
    if (mode === 'leads' || mode === 'both') {
      let leads: any[];
      if (Array.isArray(lead_ids) && lead_ids.length > 0) {
        leads = [];
        for (const id of lead_ids) leads.push(await base44.asServiceRole.entities.Lead.get(id));
      } else {
        leads = await base44.asServiceRole.entities.Lead.list('-updated_date', 200);
      }
      for (const l of leads) {
        if (!l.email && !l.last_name) { leadResults.push({ id: l.id, skipped: true, reason: 'missing last name and email' }); continue; }
        const props = leadToZohoLead(l);
        const res = await upsertToZoho(apiBase, accessToken, 'Leads', props, l.email);
        leadResults.push({ id: l.id, email: l.email, ...res });
      }
    }

    // Sync Client records → Zoho Contacts
    if (mode === 'contacts' || mode === 'both') {
      let clients: any[];
      if (Array.isArray(client_ids) && client_ids.length > 0) {
        clients = [];
        for (const id of client_ids) clients.push(await base44.asServiceRole.entities.Client.get(id));
      } else {
        clients = await base44.asServiceRole.entities.Client.list('-updated_date', 200);
      }
      for (const c of clients) {
        if (!c.email && !c.last_name) { contactResults.push({ id: c.id, skipped: true, reason: 'missing last name and email' }); continue; }
        const props = clientToZohoContact(c);
        const res = await upsertToZoho(apiBase, accessToken, 'Contacts', props, c.email);
        contactResults.push({ id: c.id, email: c.email, ...res });
      }
    }

    return Response.json({
      success: true,
      leads: { processed: leadResults.length, results: leadResults },
      contacts: { processed: contactResults.length, results: contactResults },
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}