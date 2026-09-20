import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import {
  renderAgreementPdf,
  sanitizeAgreementFilename,
  buildSignedCopyEmailHtml,
  buildStaffNotifyEmailHtml,
} from '../../shared/listingAgreement.ts';
import { sendResendEmail } from '../../shared/resendEmail.ts';

// Invoked by the "Listing Agreement Signed Automation" workflow when a client signs.
// Idempotent: skips agreements that aren't signed or are already finalized.
// Generates the executed PDF, files it to the deal/client records, emails the client
// a copy and assigned staff a notification, and advances the deal to Aircraft Listed.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({})) || {};
    const agreementId = body.agreement_id || (body.data && body.data.id) || body.id;
    if (!agreementId) return Response.json({ error: 'agreement_id required' }, { status: 400 });

    const a = await base44.asServiceRole.entities.ListingAgreement.get(agreementId);
    if (!a) return Response.json({ error: 'Agreement not found' }, { status: 404 });
    if (a.status !== 'Signed') return Response.json({ skipped: true, reason: 'not signed' });
    if (a.pdf_url) return Response.json({ skipped: true, reason: 'already finalized', pdf_url: a.pdf_url });

    // 1. Generate and upload the executed PDF
    const doc = renderAgreementPdf(a);
    const pdfBytes = await doc.output('arraybuffer');
    const file = new File([pdfBytes], sanitizeAgreementFilename(a.aircraft_summary, a.signed_at), { type: 'application/pdf' });
    const upload = await base44.asServiceRole.integrations.Core.UploadPublicFile({ file });
    const pdfUrl = upload.file_url;

    await base44.asServiceRole.entities.ListingAgreement.update(a.id, { pdf_url: pdfUrl });

    // 2. Advance the deal and file the executed copy on it
    let deal = null;
    if (a.deal_id) {
      deal = await base44.asServiceRole.entities.Deal.get(a.deal_id).catch(() => null);
      if (deal) {
        const docUrls = Array.isArray(deal.document_urls) ? [...deal.document_urls] : [];
        if (!docUrls.includes(pdfUrl)) docUrls.push(pdfUrl);
        await base44.asServiceRole.entities.Deal.update(a.deal_id, {
          stage: 'Aircraft Listed',
          document_urls: docUrls,
        });
      }
    }

    // 3. File the executed copy on the client's document records
    if (a.client_id) {
      const clientDoc = {
        client_id: a.client_id,
        name: `Listing Agreement \u2014 ${a.aircraft_summary || 'Aircraft'}`,
        category: 'Listing Agreement',
        file_url: pdfUrl,
        notes: 'Executed online with digital signature.',
      };
      if (a.aircraft_id) clientDoc.aircraft_id = a.aircraft_id;
      if (a.deal_id) clientDoc.deal_id = a.deal_id;
      await base44.asServiceRole.entities.ClientDocument.create(clientDoc);
    }

    // 4. Email the client their executed copy
    if (a.client_email) {
      await sendResendEmail({
        to: a.client_email,
        subject: `Signed: Your ClearBlue Aero Listing Agreement \u2014 ${a.aircraft_summary || 'Aircraft'}`,
        html: buildSignedCopyEmailHtml({
          clientName: a.client_name,
          aircraftSummary: a.aircraft_summary,
          pdfUrl,
        }),
      });
    }

    // 5. Notify assigned staff by email and create a dashboard activity
    if (deal && deal.assigned_to) {
      await sendResendEmail({
        to: deal.assigned_to,
        subject: `Listing agreement signed \u2014 ${a.aircraft_summary || 'Aircraft'}`,
        html: buildStaffNotifyEmailHtml({
          clientName: a.client_name,
          aircraftSummary: a.aircraft_summary,
          pdfUrl,
        }),
      });
    }

    const activity = {
      type: 'Document',
      subject: `Listing agreement signed \u2014 ${a.aircraft_summary || 'Aircraft'}`,
      description:
        `${a.client_name || 'Client'} signed the listing agreement online. ` +
        `Executed copy filed to the deal, client, and aircraft records; deal advanced to Aircraft Listed.`,
      date: a.signed_at || new Date().toISOString(),
      completed: true,
      status: 'Completed',
    };
    if (a.client_id) activity.client_id = a.client_id;
    if (a.client_name) activity.client_name = a.client_name;
    if (a.aircraft_id) activity.aircraft_id = a.aircraft_id;
    if (a.deal_id) activity.deal_id = a.deal_id;
    if (deal && deal.assigned_to) {
      activity.assigned_to = deal.assigned_to;
      activity.assigned_to_name = deal.seller_name || a.client_name;
    }
    await base44.asServiceRole.entities.Activity.create(activity);

    return Response.json({ success: true, pdf_url: pdfUrl });
  } catch (error) {
    console.error('finalizeSignedListingAgreement error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}