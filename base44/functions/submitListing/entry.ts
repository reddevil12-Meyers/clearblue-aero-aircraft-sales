import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { owner, aircraft } = body;

  // Create Client record using service role (no user auth required for public form)
  const nameParts = (owner.full_name || '').trim().split(' ');
  const first_name = nameParts[0] || 'Unknown';
  const last_name = nameParts.slice(1).join(' ') || '';

  const client = await base44.asServiceRole.entities.Client.create({
    first_name,
    last_name,
    email: owner.email || '',
    phone: owner.phone || '',
    address: owner.address || '',
    city: owner.city || '',
    state: owner.state || '',
    zip: owner.zip || '',
    company: owner.company || '',
    client_type: 'Seller',
    status: 'Prospect',
    lead_source: 'Website',
    notes: owner.remarks || '',
  });

  // Create Aircraft record linked to client
  const aircraftRecord = await base44.asServiceRole.entities.Aircraft.create({
    registration: aircraft.registration || '',
    make: aircraft.make || 'Other',
    model: aircraft.model || '',
    year: aircraft.year ? Number(aircraft.year) : null,
    serial_number: aircraft.serial_number || '',
    total_time: aircraft.total_time ? Number(aircraft.total_time) : null,
    engine_time_smoh: aircraft.engine_time ? Number(aircraft.engine_time) : null,
    engine_type: aircraft.engine_type || 'Piston',
    num_engines: aircraft.num_engines ? Number(aircraft.num_engines) : 1,
    propeller_time: aircraft.propeller_time ? Number(aircraft.propeller_time) : null,
    avionics_details: aircraft.avionics || '',
    interior_condition: aircraft.interior_condition || 'Good',
    exterior_condition: aircraft.exterior_condition || 'Good',
    paint_year: aircraft.year_painted ? Number(aircraft.year_painted) : null,
    damage_history: aircraft.damage_history ? 'Minor' : 'None',
    damage_details: aircraft.damage_details || '',
    asking_price: aircraft.asking_price ? Number(aircraft.asking_price) : null,
    location: aircraft.location || '',
    status: 'Available',
    seller_id: client.id,
    notes: `IFR Equipped: ${aircraft.ifr_equipped || 'N/A'} | IFR Current: ${aircraft.ifr_current || 'N/A'} | Annual Current: ${aircraft.annual_current || 'N/A'} | Expire: ${aircraft.expire_date || 'N/A'} | Log Books: ${aircraft.log_books || 'N/A'} | Hangared: ${aircraft.hangared || 'N/A'} | Standard Equipment: ${aircraft.standard_equipment || 'N/A'}`,
  });

  return Response.json({ success: true, client_id: client.id, aircraft_id: aircraftRecord.id });
});