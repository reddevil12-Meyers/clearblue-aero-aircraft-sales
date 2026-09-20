import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { AGREEMENT_ACKNOWLEDGMENTS } from '../../shared/listingAgreement.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public: applies the client's signature to a listing agreement (token is the secret).
// Records checkbox acknowledgments, signature, printed name, timestamp, and IP evidence.
export default async function(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: CORS_HEADERS });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({})) || {};
    const { token, acknowledged, signature_data_url, printed_name } = body;
    if (!token) return Response.json({ error: 'Missing token' }, { status: 400, headers: CORS_HEADERS });

    const matches = await base44.asServiceRole.entities.ListingAgreement.filter({ token });
    const a = matches && matches[0];
    if (!a) return Response.json({ error: 'Not found' }, { status: 404, headers: CORS_HEADERS });

    if (a.status === 'Signed') {
      return Response.json(
        { success: true, already_signed: true, printed_name: a.printed_name, signed_at: a.signed_at, pdf_url: a.pdf_url },
        { headers: CORS_HEADERS }
      );
    }

    const ackIds = AGREEMENT_ACKNOWLEDGMENTS.map((x) => x.id);
    const checked = Array.isArray(acknowledged) ? acknowledged : [];
    if (!ackIds.every((id) => checked.includes(id))) {
      return Response.json({ error: 'All acknowledgments must be checked before signing.' }, { status: 400, headers: CORS_HEADERS });
    }

    const name = (printed_name || '').trim();
    if (!name) {
      return Response.json({ error: 'Please enter your printed name.' }, { status: 400, headers: CORS_HEADERS });
    }
    if (signature_data_url) {
      if (!/^data:image\/png;base64,/.test(signature_data_url)) {
        return Response.json({ error: 'Invalid signature image.' }, { status: 400, headers: CORS_HEADERS });
      }
      if (signature_data_url.length > 400000) {
        return Response.json({ error: 'Signature image is too large.' }, { status: 400, headers: CORS_HEADERS });
      }
    }

    const ip = ((req.headers.get('x-forwarded-for') || '').split(',')[0] || '').trim() || 'unknown';
    const userAgent = (req.headers.get('user-agent') || 'unknown').slice(0, 250);

    await base44.asServiceRole.entities.ListingAgreement.update(a.id, {
      status: 'Signed',
      signed_at: new Date().toISOString(),
      acknowledged_items: ackIds,
      signature_data_url: signature_data_url || '',
      printed_name: name,
      signer_ip: ip,
      signer_user_agent: userAgent,
    });

    return Response.json({ success: true }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('signListingAgreement error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
}