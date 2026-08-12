import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getZohoAccessToken, zohoApiBase } from "../../shared/zohoAuth.ts";

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

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const accessToken = await getZohoAccessToken();
    const apiBase = zohoApiBase();

    let body: any = {};
    try { body = await req.json(); } catch (_) { /* allow empty */ }
    const mode = body.mode || 'both'; // 'leads' | 'contacts' | 'both'

    const summary: any = {};

    // Zoho Leads → Lead records
    if (mode === 'leads' || mode === 'both') {
      const zohoLeads = await fetchAllZoho(apiBase, accessToken, 'Leads', ZOHO_LEAD_FIELDS);
      const existingLeads = await base44.asServiceRole.entities.Lead.list('-created_date', 500);
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
          lead_type: 'Buyer',
          status: 'New',
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
            await base44.asServiceRole.entities.Lead.update(existing.id, changes);
            lUpdated++; lUpdates.push({ email, action: 'updated', changes });
          } else { lSkipped++; }
        } else {
          const { status, lead_type, ...rest } = mapped;
          await base44.asServiceRole.entities.Lead.create({
            ...rest,
            lead_source: mapped.lead_source,
            lead_type: 'Buyer',
            status: 'New',
            notes: 'Synced from Zoho CRM (Leads)',
          });
          lCreated++; lUpdates.push({ email, action: 'created' });
        }
      }
      summary.leads = { zohoLeads: zohoLeads.length, updated: lUpdated, created: lCreated, skipped: lSkipped, updates: lUpdates };
    }

    // Zoho Contacts → Client records
    if (mode === 'contacts' || mode === 'both') {
      const zohoContacts = await fetchAllZoho(apiBase, accessToken, 'Contacts', ZOHO_CONTACT_FIELDS);
      const existingClients = await base44.asServiceRole.entities.Client.list('-created_date', 500);
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
            await base44.asServiceRole.entities.Client.update(existing.id, changes);
            cUpdated++; cUpdates.push({ email, action: 'updated', changes });
          } else { cSkipped++; }
        } else {
          await base44.asServiceRole.entities.Client.create({
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

    return Response.json({ success: true, ...summary });
  } catch (error) {
    console.error('Zoho → App sync error:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}