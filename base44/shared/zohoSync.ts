import { getZohoAccessToken, zohoApiBase } from "./zohoAuth.ts";

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

// App → Zoho. svc = base44.asServiceRole client.
export async function runSyncToZoho(svc: any, opts: { mode?: string; lead_ids?: string[]; client_ids?: string[] } = {}) {
  const mode = opts.mode || 'both';
  const accessToken = await getZohoAccessToken();
  const apiBase = zohoApiBase();
  const leadResults: any[] = [];
  const contactResults: any[] = [];

  if (mode === 'leads' || mode === 'both') {
    let leads: any[];
    if (Array.isArray(opts.lead_ids) && opts.lead_ids.length > 0) {
      leads = [];
      for (const id of opts.lead_ids) leads.push(await svc.entities.Lead.get(id));
    } else {
      leads = await svc.entities.Lead.list('-updated_date', 200);
    }
    for (const l of leads) {
      if (!l.email && !l.last_name) { leadResults.push({ id: l.id, skipped: true, reason: 'missing last name and email' }); continue; }
      const props = leadToZohoLead(l);
      const res = await upsertToZoho(apiBase, accessToken, 'Leads', props, l.email);
      leadResults.push({ id: l.id, email: l.email, ...res });
    }
  }

  if (mode === 'contacts' || mode === 'both') {
    let clients: any[];
    if (Array.isArray(opts.client_ids) && opts.client_ids.length > 0) {
      clients = [];
      for (const id of opts.client_ids) clients.push(await svc.entities.Client.get(id));
    } else {
      clients = await svc.entities.Client.list('-updated_date', 200);
    }
    for (const c of clients) {
      if (!c.email && !c.last_name) { contactResults.push({ id: c.id, skipped: true, reason: 'missing last name and email' }); continue; }
      const props = clientToZohoContact(c);
      const res = await upsertToZoho(apiBase, accessToken, 'Contacts', props, c.email);
      contactResults.push({ id: c.id, email: c.email, ...res });
    }
  }

  return {
    success: true,
    leads: { processed: leadResults.length, results: leadResults },
    contacts: { processed: contactResults.length, results: contactResults },
  };
}

const ZOHO_LEAD_FIELDS = ['First_Name', 'Last_Name', 'Email', 'Phone', 'Company', 'Description', 'Lead_Source'];
const ZOHO_CONTACT_FIELDS = ['First_Name', 'Last_Name', 'Email', 'Phone', 'Title', 'Mailing_Street', 'Mailing_City', 'Mailing_State', 'Mailing_Zip', 'Description'];

async function fetchAllZoho(apiBase: string, accessToken: string, module: string, fields: string[]) {
  const records: any[] = [];
  let page = 1;
  let hasMore = true;
  do {
    const params = new URLSearchParams({ page: String(page), per_page: '200', fields: fields.join(',') });
    const res = await fetch(`${apiBase}/${module}?${params}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Zoho ${module} API error: ${err}`);
    }
    const data = await res.json();
    if (data.data) records.push(...data.data);
    hasMore = data.info && data.info.more_records === true;
    page++;
    if (!data.data || data.data.length === 0) hasMore = false;
  } while (hasMore && page <= 20);
  return records;
}

// Zoho → App. svc = base44.asServiceRole client.
export async function runSyncFromZoho(svc: any, opts: { mode?: string } = {}) {
  const mode = opts.mode || 'both';
  const accessToken = await getZohoAccessToken();
  const apiBase = zohoApiBase();
  const summary: any = {};

  if (mode === 'leads' || mode === 'both') {
    const zohoLeads = await fetchAllZoho(apiBase, accessToken, 'Leads', ZOHO_LEAD_FIELDS);
    const existingLeads = await svc.entities.Lead.list('-created_date', 500);
    const leadByEmail = new Map<string, any>();
    for (const l of existingLeads) if (l.email) leadByEmail.set((l.email as string).toLowerCase(), l);

    let lUpdated = 0, lCreated = 0, lSkipped = 0;
    const lUpdates: any[] = [];

    for (const zl of zohoLeads) {
      const email = zl.Email;
      const last_name = zl.Last_Name;
      if (!email && !last_name) { lSkipped++; continue; }

      const mapped = {
        first_name: zl.First_Name || '',
        last_name: last_name || '',
        email: email || '',
        phone: zl.Phone || '',
        company: zl.Company || '',
        aircraft_interest: zl.Description || '',
        lead_source: zl.Lead_Source || 'Other',
      };

      const existing = email ? leadByEmail.get((email as string).toLowerCase()) : undefined;
      if (existing) {
        const fieldMap = { first_name: 'first_name', last_name: 'last_name', phone: 'phone', company: 'company', aircraft_interest: 'aircraft_interest', lead_source: 'lead_source' };
        const changes: Record<string, string> = {};
        let hasChanges = false;
        for (const [zk, ck] of Object.entries(fieldMap)) {
          const val = (mapped as any)[zk];
          if (val && val !== (existing as any)[ck]) { changes[ck] = val; hasChanges = true; }
        }
        if (hasChanges) {
          await svc.entities.Lead.update(existing.id, changes);
          lUpdated++; lUpdates.push({ email, action: 'updated', changes });
        } else { lSkipped++; }
      } else {
        await svc.entities.Lead.create({
          ...mapped,
          lead_type: 'Buyer',
          status: 'New',
          notes: 'Synced from Zoho CRM (Leads)',
        });
        lCreated++; lUpdates.push({ email, action: 'created' });
      }
    }
    summary.leads = { zohoLeads: zohoLeads.length, updated: lUpdated, created: lCreated, skipped: lSkipped, updates: lUpdates };
  }

  if (mode === 'contacts' || mode === 'both') {
    const zohoContacts = await fetchAllZoho(apiBase, accessToken, 'Contacts', ZOHO_CONTACT_FIELDS);
    const existingClients = await svc.entities.Client.list('-created_date', 500);
    const clientByEmail = new Map<string, any>();
    for (const c of existingClients) if (c.email) clientByEmail.set((c.email as string).toLowerCase(), c);

    let cUpdated = 0, cCreated = 0, cSkipped = 0;
    const cUpdates: any[] = [];

    for (const zc of zohoContacts) {
      const email = zc.Email;
      const last_name = zc.Last_Name;
      if (!email && !last_name) { cSkipped++; continue; }

      const mapped = {
        first_name: zc.First_Name || '',
        last_name: last_name || '',
        email: email || '',
        phone: zc.Phone || '',
        company: zc.Title || '',
        address: zc.Mailing_Street || '',
        city: zc.Mailing_City || '',
        state: zc.Mailing_State || '',
        zip: zc.Mailing_Zip || '',
        aircraft_interests: zc.Description || '',
      };

      const existing = email ? clientByEmail.get((email as string).toLowerCase()) : undefined;
      if (existing) {
        const fieldMap = { first_name: 'first_name', last_name: 'last_name', phone: 'phone', company: 'company', address: 'address', city: 'city', state: 'state', zip: 'zip', aircraft_interests: 'aircraft_interests' };
        const changes: Record<string, string> = {};
        let hasChanges = false;
        for (const [zk, ck] of Object.entries(fieldMap)) {
          const val = (mapped as any)[zk];
          if (val && val !== (existing as any)[ck]) { changes[ck] = val; hasChanges = true; }
        }
        if (hasChanges) {
          await svc.entities.Client.update(existing.id, changes);
          cUpdated++; cUpdates.push({ email, action: 'updated', changes });
        } else { cSkipped++; }
      } else {
        await svc.entities.Client.create({
          ...mapped,
          client_type: 'Buyer',
          lead_source: 'Other',
          status: 'Prospect',
          notes: 'Synced from Zoho CRM (Contacts)',
        });
        cCreated++; cUpdates.push({ email, action: 'created' });
      }
    }
    summary.contacts = { zohoContacts: zohoContacts.length, updated: cUpdated, created: cCreated, skipped: cSkipped, updates: cUpdates };
  }

  return { success: true, ...summary };
}