import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { buildAgreementSections, AGREEMENT_ACKNOWLEDGMENTS } from '../../shared/listingAgreement.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public: loads a listing agreement by its secure signing token (the token is the secret).
export default async function(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const base44 = createClientFromRequest(req);

    let token = null;
    if (req.method === 'GET') {
      token = new URL(req.url).searchParams.get('token');
    } else {
      const body = await req.json().catch(() => ({}));
      token = body.token;
    }
    if (!token) return Response.json({ error: 'Missing token' }, { status: 400, headers: CORS_HEADERS });

    const matches = await base44.asServiceRole.entities.ListingAgreement.filter({ token });
    const a = matches && matches[0];
    if (!a) return Response.json({ error: 'Not found' }, { status: 404, headers: CORS_HEADERS });

    // Track first view
    if (a.status === 'Sent') {
      await base44.asServiceRole.entities.ListingAgreement.update(a.id, {
        status: 'Viewed',
        viewed_at: new Date().toISOString(),
      });
      a.status = 'Viewed';
    }

    return Response.json(
      {
        agreement: {
          token,
          status: a.status,
          client_name: a.client_name,
          aircraft_summary: a.aircraft_summary,
          asking_price: a.asking_price,
          commission_rate: a.commission_rate,
          term_months: a.term_months,
          effective_date: a.effective_date,
          sections: buildAgreementSections(a),
          acknowledgments: AGREEMENT_ACKNOWLEDGMENTS,
          printed_name: a.printed_name,
          signed_at: a.signed_at,
          pdf_url: a.pdf_url,
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error('getListingAgreementByToken error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
}