import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getZohoAccessToken, zohoApiBase } from "../../shared/zohoAuth.ts";

const ZOHO_LEAD_FIELDS = ['First_Name', 'Last_Name', 'Email', 'Phone', 'Company', 'Street', 'City', 'State', 'Zip_Code', 'Description'];

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const accessToken = await getZohoAccessToken();
    const apiBase = zohoApiBase();

    // 1. Fetch all Leads from Zoho (paginated)
    const zohoLeads: any[] = [];
    let page = 1;
    let hasMore = true;
    do {
      const params = new URLSearchParams({
        page: String(page),
        per_page: '200',
        fields: ZOHO_LEAD_FIELDS.join(','),
      });
      const res = await fetch(`${apiBase}/Leads?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `Zoho API error: ${err}` }, { status: 502 });
      }
      const data = await res.json();
      if (data.data) zohoLeads.push(...data.data);
      hasMore = data.info && data.info.more_records === true;
      page++;
      if (!data.data || data.data.length === 0) hasMore = false;
    } while (hasMore && page <= 20);

    // 2. Load all clients from our DB
    const clients = await base44.asServiceRole.entities.Client.list('-created_date', 500);
    const clientByEmail = new Map<string, any>();
    for (const c of clients) {
      if (c.email) clientByEmail.set(c.email.toLowerCase(), c);
    }

    let updated = 0;
    let created = 0;
    let skipped = 0;
    const updates: any[] = [];

    // 3. Process each Zoho Lead
    for (const lead of zohoLeads) {
      const props = lead || {};
      const email = props.Email;
      const last_name = props.Last_Name;
      if (!email && !last_name) { skipped++; continue; }

      const zohoData = {
        first_name: props.First_Name || '',
        last_name: last_name || '',
        email: email || '',
        phone: props.Phone || '',
        company: props.Company || '',
        address: props.Street || '',
        city: props.City || '',
        state: props.State || '',
        zip: props.Zip_Code || '',
        aircraft_interests: props.Description || '',
      };

      const existing = email ? clientByEmail.get(email.toLowerCase()) : undefined;
      if (existing) {
        const fieldMap = {
          first_name: 'first_name',
          last_name: 'last_name',
          phone: 'phone',
          company: 'company',
          address: 'address',
          city: 'city',
          state: 'state',
          zip: 'zip',
          aircraft_interests: 'aircraft_interests',
        };
        const changes: Record<string, string> = {};
        let hasChanges = false;
        for (const [zk, ck] of Object.entries(fieldMap)) {
          const val = (zohoData as any)[zk];
          if (val && val !== (existing as any)[ck]) {
            changes[ck] = val;
            hasChanges = true;
          }
        }
        if (hasChanges) {
          await base44.asServiceRole.entities.Client.update(existing.id, changes);
          updated++;
          updates.push({ email, action: 'updated', changes });
        } else {
          skipped++;
        }
      } else {
        await base44.asServiceRole.entities.Client.create({
          first_name: zohoData.first_name,
          last_name: zohoData.last_name,
          email: zohoData.email,
          phone: zohoData.phone,
          company: zohoData.company,
          address: zohoData.address,
          city: zohoData.city,
          state: zohoData.state,
          zip: zohoData.zip,
          aircraft_interests: zohoData.aircraft_interests,
          client_type: 'Buyer',
          lead_source: 'Other',
          status: 'Prospect',
          notes: 'Synced from Zoho CRM',
        });
        created++;
        updates.push({ email, action: 'created' });
      }
    }

    return Response.json({
      success: true,
      zohoLeads: zohoLeads.length,
      updated,
      created,
      skipped,
      updates,
    });
  } catch (error) {
    console.error('Zoho → App sync error:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}