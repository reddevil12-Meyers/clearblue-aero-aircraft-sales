import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { generateAgreementToken, buildInviteEmailHtml, SITE_URL } from '../../shared/listingAgreement.ts';
import { sendResendEmail } from '../../shared/resendEmail.ts';

const STAFF_ROLES = ['admin', 'employee'];

// Staff-facing: converts a lead into a listing client. Creates/advances the deal,
// generates the listing agreement, emails the client a secure signing link.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!STAFF_ROLES.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({})) || {};
    const {
      client_id, aircraft_id, deal_id,
      asking_price, commission_rate, term_months, effective_date, signer_email,
    } = body;
    if (!client_id || !aircraft_id) {
      return Response.json({ error: 'client_id and aircraft_id are required' }, { status: 400 });
    }

    const client = await base44.entities.Client.get(client_id);
    const aircraft = await base44.entities.Aircraft.get(aircraft_id);
    if (!client) return Response.json({ error: 'Client not found' }, { status: 404 });
    if (!aircraft) return Response.json({ error: 'Aircraft not found' }, { status: 404 });

    const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
    const clientEmail = (signer_email || client.email || '').trim();
    if (!clientEmail) {
      return Response.json({ error: 'This client has no email on file. Add an email address before converting.' }, { status: 400 });
    }

    const aircraftSummary =
      `${aircraft.year || ''} ${aircraft.make || ''} ${aircraft.model || ''}`.trim() +
      (aircraft.registration ? ` (${aircraft.registration})` : '');

    const price =
      asking_price != null && asking_price !== '' ? Number(asking_price)
      : (aircraft.asking_price != null ? Number(aircraft.asking_price) : null);
    const rate = commission_rate != null && commission_rate !== '' ? Number(commission_rate) : null;
    const term = term_months != null && term_months !== '' ? Number(term_months) : 3;
    const effDate = effective_date || new Date().toISOString().slice(0, 10);

    // Create or advance the deal
    let deal;
    if (deal_id) {
      deal = await base44.entities.Deal.update(deal_id, { stage: 'Listing Agreement Being Prepared' });
    } else {
      const dealData = {
        title: `Listing \u2014 ${aircraftSummary}`,
        aircraft_id,
        aircraft_summary: aircraftSummary,
        seller_id: client_id,
        seller_name: clientName,
        stage: 'Listing Agreement Being Prepared',
        assigned_to: client.assigned_to || user.email,
      };
      if (price != null && !isNaN(price)) dealData.asking_price = price;
      if (rate != null && !isNaN(rate)) dealData.commission_rate = rate;
      deal = await base44.entities.Deal.create(dealData);
    }

    const token = generateAgreementToken();
    const agreement = await base44.entities.ListingAgreement.create({
      client_id,
      client_name: clientName,
      client_email: clientEmail,
      client_address: [client.address, client.city, client.state, client.zip].filter(Boolean).join(', '),
      client_phone: client.phone || '',
      aircraft_id,
      aircraft_summary: aircraftSummary,
      deal_id: deal.id,
      token,
      status: 'Sent',
      sent_at: new Date().toISOString(),
      asking_price: price,
      commission_rate: rate,
      term_months: term,
      effective_date: effDate,
      acknowledged_items: [],
      printed_name: '',
    });

    // Lead conversion: a prospect being onboarded as a listing client becomes Active
    if (client.status === 'Prospect') {
      await base44.entities.Client.update(client_id, { status: 'Active' });
    }

    const link = `${SITE_URL}/agreement/${token}`;
    await sendResendEmail({
      to: clientEmail,
      subject: `Your ClearBlue Aero Aircraft Brokerage Agreement \u2014 ${aircraftSummary}`,
      html: buildInviteEmailHtml({ clientName, aircraftSummary, link }),
    });

    return Response.json({ success: true, agreement_id: agreement.id, deal_id: deal.id, token, link });
  } catch (error) {
    console.error('createListingAgreement error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}