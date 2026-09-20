import { jsPDF } from 'npm:jspdf@4.0.0';

export const SITE_URL = 'https://clearblueaero.com';

export const generateAgreementToken = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const usd = (n) =>
  n == null || isNaN(Number(n)) ? null : '$' + Number(n).toLocaleString('en-US');

export const formatEffectiveDate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

export const formatSignedDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }) : '';

// Required acknowledgment checkboxes shown to the signer.
export const AGREEMENT_ACKNOWLEDGMENTS = [
  {
    id: 'authority',
    text: 'I confirm that I am the legal owner of the aircraft (or an authorized representative of the owner), and that I have the authority to list it for sale and enter into this agreement.',
  },
  {
    id: 'accuracy',
    text: 'I confirm that the aircraft and ownership information described in this agreement is accurate to the best of my knowledge.',
  },
  {
    id: 'terms',
    text: 'I have read, understand, and agree to all of the terms of this Listing Agreement, including the commission and term provisions.',
  },
  {
    id: 'electronic',
    text: 'I consent to sign this agreement electronically, and I understand that my drawn or typed signature has the same legal effect as a handwritten signature.',
  },
];

// Agreement clause sections, generated from the agreement record's data.
export const buildAgreementSections = (a) => {
  const price = usd(a.asking_price) || 'the listing price established from time to time during the Term';
  const rate = a.commission_rate != null && Number(a.commission_rate) > 0 ? `${Number(a.commission_rate)}%` : null;
  const termMonths = a.term_months != null && Number(a.term_months) > 0 ? Math.round(Number(a.term_months)) : 6;
  const term = `${termMonths} month${termMonths === 1 ? '' : 's'}`;
  const effective = formatEffectiveDate(a.effective_date) || 'the Effective Date';

  return [
    {
      heading: '1. Appointment of Broker',
      body: [
        `Owner hereby appoints ClearBlue Aero as the exclusive agent for the sale of the aircraft described below, and agrees to offer the aircraft for sale exclusively through ClearBlue Aero during the Term of this Agreement. ClearBlue Aero accepts this appointment.`,
      ],
    },
    {
      heading: '2. Aircraft',
      body: [
        `The aircraft subject to this Agreement (the "Aircraft") is: ${a.aircraft_summary || 'the aircraft described in the parties\u2019 records'}, together with all installed avionics, equipment, logs, and records.`,
      ],
    },
    {
      heading: '3. Listing Price',
      body: [
        `The initial listing price of the Aircraft shall be ${price}. Owner may adjust the listing price during the Term upon written notice to ClearBlue Aero.`,
      ],
    },
    {
      heading: '4. Commission',
      body: [
        rate
          ? `Owner agrees to pay ClearBlue Aero a commission equal to ${rate} of the gross sales price of the Aircraft, earned and payable at closing through the designated escrow agent.`
          : `Owner agrees to pay ClearBlue Aero a commission as agreed in writing between the parties, earned and payable at closing through the designated escrow agent.`,
        `If the Aircraft is sold or otherwise transferred during the Term, or within ninety (90) days after the Term ends, to a buyer who was procured or introduced by ClearBlue Aero during the Term, the commission remains due and payable.`,
      ],
    },
    {
      heading: '5. Term',
      body: [
        `This Agreement begins on ${effective} and continues for a period of ${term} (the "Term"). The Term automatically renews for successive thirty (30) day periods unless either party gives the other at least ten (10) days written notice of non-renewal before the end of the then-current period.`,
      ],
    },
    {
      heading: '6. Broker Services',
      body: [
        `ClearBlue Aero will use its reasonable efforts to market the Aircraft, including listing the Aircraft for sale on industry marketplaces and its websites, preparing marketing materials, showing the Aircraft to prospective buyers, qualifying prospective buyers, assisting in negotiations, and coordinating with escrow and title services through closing.`,
      ],
    },
    {
      heading: '7. Owner Representations and Obligations',
      body: [
        `Owner represents that Owner is the sole owner of the Aircraft, that the Aircraft is free of all liens and encumbrances except as disclosed in writing, and that Owner has the right to sell the Aircraft.`,
        `Owner agrees to make the Aircraft and all logbooks and records reasonably available for showings, demonstrations, and pre-purchase inspections, and to maintain the Aircraft in an airworthy condition and properly insured during the Term.`,
      ],
    },
    {
      heading: '8. Signature and Electronic Consent',
      body: [
        `This Agreement may be executed electronically. By checking the acknowledgment boxes and applying a drawn or typed signature, Owner intends to sign and be bound by this Agreement, and consents to the use of electronic records and signatures.`,
      ],
    },
    {
      heading: '9. Governing Law',
      body: [
        `This Agreement is a contract executed under, and to be construed under, the laws of the State of Florida.`,
      ],
    },
  ];
};

export const sanitizeAgreementFilename = (summary, signedAt) => {
  const raw = (summary || 'Aircraft').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_').trim();
  const date = signedAt ? new Date(signedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  return `Listing_Agreement_${raw}_${date}.pdf`;
};

// Branded executed-copy PDF of the signed agreement.
export const renderAgreementPdf = (a) => {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;

  const signedStr = formatSignedDateTime(a.signed_at);
  const signedDate = a.signed_at ? new Date(a.signed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const termMonths = a.term_months != null && Number(a.term_months) > 0 ? Math.round(Number(a.term_months)) : 6;

  doc.setFillColor(0, 68, 127);
  doc.rect(0, 0, pageW, 70, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ClearBlue Aero', margin, 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Exclusive Aircraft Listing Agreement', margin, 50);
  doc.setFontSize(9);
  if (signedStr) doc.text(`Signed ${signedStr}`, pageW - margin, 50, { align: 'right' });
  y = 92;
  doc.setTextColor(30, 30, 30);

  const ensureSpace = (needed) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeWrapped = (text, opts = {}) => {
    const indent = opts.indent || 0;
    const fontSize = opts.size || 10;
    const fontStyle = opts.style || 'normal';
    const color = opts.color || [30, 30, 30];
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, contentW - indent);
    for (const ln of lines) {
      ensureSpace(fontSize + 4);
      doc.text(ln, margin + indent, y);
      y += fontSize + 4;
    }
  };

  writeWrapped(`Aircraft: ${a.aircraft_summary || 'N/A'}`, { style: 'bold', size: 11 });
  writeWrapped(`Owner: ${a.client_name || 'N/A'}`, { size: 10 });
  writeWrapped(`Listing Price: ${usd(a.asking_price) || 'As established during the Term'}`, { size: 10 });
  writeWrapped(`Commission: ${a.commission_rate != null && Number(a.commission_rate) > 0 ? Number(a.commission_rate) + '%' : 'As agreed in writing'}`, { size: 10 });
  writeWrapped(`Term: ${termMonths} month${termMonths === 1 ? '' : 's'} beginning ${formatEffectiveDate(a.effective_date) || 'the Effective Date'}`, { size: 10 });
  y += 8;

  for (const section of buildAgreementSections(a)) {
    y += 4;
    writeWrapped(section.heading, { style: 'bold', size: 11, color: [15, 23, 42] });
    for (const p of section.body) writeWrapped(p, { size: 10 });
    y += 2;
  }

  y += 8;
  writeWrapped('ACKNOWLEDGED BY OWNER', { style: 'bold', size: 11, color: [15, 23, 42] });
  for (const ack of AGREEMENT_ACKNOWLEDGMENTS) {
    const checked = Array.isArray(a.acknowledged_items) && a.acknowledged_items.includes(ack.id);
    writeWrapped(`${checked ? '[X]' : '[ ]'}  ${ack.text}`, { size: 9 });
  }

  y += 14;
  ensureSpace(150);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text("Owner's Signature", margin, y);
  y += 6;
  if (a.signature_data_url && /^data:image\/png;base64,/.test(a.signature_data_url)) {
    doc.addImage(a.signature_data_url, 'PNG', margin, y, 220, 73);
    y += 80;
  } else {
    doc.setFont('times', 'italic');
    doc.setFontSize(28);
    doc.text(a.printed_name || '', margin + 8, y + 30);
    y += 44;
  }
  ensureSpace(40);
  doc.setDrawColor(130, 130, 130);
  doc.line(margin, y, margin + 320, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(a.printed_name || '', margin, y + 14);
  doc.text(`Date: ${signedDate}`, margin + 200, y + 14);

  y += 34;
  ensureSpace(30);
  writeWrapped(
    `This agreement was signed electronically by ${a.printed_name || a.client_name || 'the Owner'}${signedStr ? ' on ' + signedStr : ''}. Signature capture IP address: ${a.signer_ip || 'n/a'}.`,
    { size: 8, color: [120, 120, 120] }
  );

  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`Page ${p} of ${pages}`, pageW - margin, pageH - 16, { align: 'right' });
  }

  return doc;
};

// --- Email templates (navy/gold branded) ---

export const buildInviteEmailHtml = ({ clientName, aircraftSummary, link }) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f6f8;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#00447f;padding:28px 32px;">
          <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">ClearBlue Aero</p>
          <p style="margin:6px 0 0;color:#a9c4e2;font-size:13px;">Aircraft Sales &amp; Acquisitions</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:16px;color:#0f172a;">Hi ${clientName || 'there'},</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;">
            Thank you for choosing ClearBlue Aero to list your aircraft${aircraftSummary ? ' — ' + aircraftSummary : ''}.
            Your exclusive listing agreement is ready to review and sign online. It takes about two minutes from your phone or computer.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td style="background:#c9a227;border-radius:8px;">
              <a href="${link}" style="display:inline-block;padding:14px 32px;color:#1a1a1a;font-size:15px;font-weight:bold;text-decoration:none;">Review &amp; Sign Agreement</a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:12px;color:#64748b;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="margin:0;font-size:12px;color:#00447f;word-break:break-all;">${link}</p>
          <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">This link is personal to you. Please don't forward it.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const buildSignedCopyEmailHtml = ({ clientName, aircraftSummary, pdfUrl }) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f6f8;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#00447f;padding:28px 32px;">
          <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">ClearBlue Aero</p>
          <p style="margin:6px 0 0;color:#a9c4e2;font-size:13px;">Your signed listing agreement</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:16px;color:#0f172a;">Hi ${clientName || 'there'},</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;">
            Your listing agreement${aircraftSummary ? ' for ' + aircraftSummary : ''} has been signed and countersigned by ClearBlue Aero.
            A PDF copy of the fully executed agreement is attached to this transaction and available at the link below for your records.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td style="background:#00447f;border-radius:8px;">
              <a href="${pdfUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">Download Your Signed Agreement</a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">We'll be in touch shortly about next steps for listing your aircraft. Welcome aboard!</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const buildStaffNotifyEmailHtml = ({ clientName, aircraftSummary, pdfUrl }) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f6f8;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#00447f;padding:24px 32px;">
          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:bold;">Listing agreement signed</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#334155;">
            <strong>${clientName || 'Client'}</strong> signed the listing agreement${aircraftSummary ? ' for ' + aircraftSummary : ''} online.
            The deal has been advanced to <strong>Aircraft Listed</strong>, and the executed copy has been filed to the deal, client, and aircraft records.
          </p>
          ${pdfUrl ? `<p style="margin:0;font-size:12px;color:#00447f;word-break:break-all;"><a href="${pdfUrl}">View the executed agreement</a></p>` : ''}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;