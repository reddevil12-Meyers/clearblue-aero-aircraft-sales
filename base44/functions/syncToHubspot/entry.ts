import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let body = {};
    try { body = await req.json(); } catch (_) {}

    const { contacts } = body;
    const contactList = Array.isArray(contacts) ? contacts : [body];

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    const results = [];
    for (const c of contactList) {
      if (!c.email) { results.push({ skipped: true, reason: 'no email' }); continue; }

      const properties = {};
      if (c.email) properties.email = c.email;
      if (c.first_name) properties.firstname = c.first_name;
      if (c.last_name) properties.lastname = c.last_name;
      if (c.phone) properties.phone = c.phone;
      if (c.company) properties.company = c.company;
      if (c.city) properties.city = c.city;
      if (c.state) properties.state = c.state;
      if (c.zip) properties.zip = c.zip;

      // Search for existing contact by email
      let hubspotId = null;
      try {
        const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filterGroups: [{ filters: [{ value: c.email, propertyName: 'email', operator: 'EQ' }] }],
            properties: ['email'],
            limit: 1
          })
        });
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.results && searchData.results.length > 0) {
            hubspotId = searchData.results[0].id;
          }
        }
      } catch (searchError) {
        console.log('HubSpot search failed:', searchError.message);
      }

      let action;
      if (hubspotId) {
        // Update existing contact
        const updateRes = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${hubspotId}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties })
        });
        if (!updateRes.ok) {
          const err = await updateRes.text();
          results.push({ email: c.email, error: `Update failed: ${err}` });
          continue;
        }
        action = 'updated';
      } else {
        // Create new contact
        const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties })
        });
        if (!createRes.ok) {
          const err = await createRes.text();
          results.push({ email: c.email, error: `Create failed: ${err}` });
          continue;
        }
        const createData = await createRes.json();
        hubspotId = createData.id;
        action = 'created';
      }

      // Create a note on the contact if aircraft_summary or notes provided
      if (hubspotId && (c.aircraft_summary || c.notes)) {
        const noteBody = [c.aircraft_summary, c.notes].filter(Boolean).join('\n\n');
        try {
          const noteRes = await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              properties: {
                hs_note_body: noteBody,
                hs_timestamp: Date.now().toString()
              }
            })
          });
          if (noteRes.ok) {
            const noteData = await noteRes.json();
            if (noteData.id) {
              await fetch(`https://api.hubapi.com/crm/v3/objects/notes/${noteData.id}/associations/contacts/${hubspotId}/note_to_contact`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
              });
            }
          }
        } catch (noteError) {
          console.log('HubSpot note creation failed (non-blocking):', noteError.message);
        }
      }

      results.push({ email: c.email, hubspot_id: hubspotId, action });
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});