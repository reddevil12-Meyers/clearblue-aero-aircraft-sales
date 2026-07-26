import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const HUBSPOT_PROPERTIES = ['email', 'firstname', 'lastname', 'phone', 'company', 'city', 'state', 'zip'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    // 1. Fetch all contacts from HubSpot (paginated)
    const hubspotContacts = [];
    let after = undefined;
    do {
      const params = new URLSearchParams({
        limit: '100',
        properties: HUBSPOT_PROPERTIES.join(','),
      });
      if (after) params.set('after', after);

      const res = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts?${params}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `HubSpot API error: ${err}` }, { status: 502 });
      }
      const data = await res.json();
      if (data.results) hubspotContacts.push(...data.results);
      after = data.paging?.next?.after;
    } while (after);

    // 2. Load all clients from our DB
    const clients = await base44.asServiceRole.entities.Client.list('-created_date', 500);
    const clientByEmail = new Map();
    for (const c of clients) {
      if (c.email) clientByEmail.set(c.email.toLowerCase(), c);
    }

    let updated = 0;
    let created = 0;
    let skipped = 0;
    const updates = [];

    // 3. Process each HubSpot contact
    for (const hsContact of hubspotContacts) {
      const props = hsContact.properties || {};
      const email = props.email;
      if (!email) { skipped++; continue; }

      const hubspotData = {
        first_name: props.firstname || '',
        last_name: props.lastname || '',
        email: email,
        phone: props.phone || '',
        company: props.company || '',
        city: props.city || '',
        state: props.state || '',
        zip: props.zip || '',
      };

      const existing = clientByEmail.get(email.toLowerCase());

      if (existing) {
        // Check if any mapped field differs
        const changes = {};
        const fieldMap = {
          first_name: 'first_name',
          last_name: 'last_name',
          phone: 'phone',
          company: 'company',
          city: 'city',
          state: 'state',
          zip: 'zip',
        };
        let hasChanges = false;
        for (const [hsKey, clientKey] of Object.entries(fieldMap)) {
          const hsVal = hubspotData[hsKey];
          if (hsVal && hsVal !== existing[clientKey]) {
            changes[clientKey] = hsVal;
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
        // Contact exists in HubSpot but not in our DB — create a new Client
        await base44.asServiceRole.entities.Client.create({
          first_name: hubspotData.first_name,
          last_name: hubspotData.last_name,
          email: hubspotData.email,
          phone: hubspotData.phone,
          company: hubspotData.company,
          city: hubspotData.city,
          state: hubspotData.state,
          zip: hubspotData.zip,
          client_type: 'Buyer',
          lead_source: 'Other',
          status: 'Prospect',
          notes: 'Synced from HubSpot CRM',
        });
        created++;
        updates.push({ email, action: 'created' });
      }
    }

    return Response.json({
      success: true,
      hubspotContacts: hubspotContacts.length,
      updated,
      created,
      skipped,
      updates,
    });
  } catch (error) {
    console.error('HubSpot → App sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});