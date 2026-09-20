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
    text: 'I have read, understand, and agree to all of the terms of this Aircraft Brokerage Agreement, including the commission and term provisions.',
  },
  {
    id: 'electronic',
    text: 'I consent to sign this agreement electronically, and I understand that my drawn or typed signature has the same legal effect as a handwritten signature.',
  },
];

// Agreement clause sections, mirroring ClearBlue Aero's manual Aircraft Brokerage
// Agreement, generated from the agreement record's data.
export const buildAgreementSections = (a) => {
  const rate = a.commission_rate != null && Number(a.commission_rate) > 0 ? `${Number(a.commission_rate)}%` : null;
  const termMonths = a.term_months != null && Number(a.term_months) > 0 ? Math.round(Number(a.term_months)) : 3;
  const termWords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'][termMonths - 1] || String(termMonths);
  const effective = formatEffectiveDate(a.effective_date) || 'the Effective Date';
  const sellerNotice = [
    a.client_name,
    a.client_address,
    a.client_phone ? `Phone: ${a.client_phone}` : null,
    a.client_email ? `Email: ${a.client_email}` : null,
  ].filter(Boolean);
  const compensation = rate
    ? `Broker's compensation will be ${rate} of the selling price per aircraft sold, excluding any applicable sales or use taxes, payable at the time of the closing of the sale by bank wire transfer or other means of remittance acceptable to Broker.`
    : `Broker's compensation will be as agreed in writing between the parties as a percentage of the selling price per aircraft sold, excluding any applicable sales or use taxes, payable at the time of the closing of the sale by bank wire transfer or other means of remittance acceptable to Broker.`;

  return [
    {
      heading: '',
      body: [
        `THIS AIRCRAFT BROKERAGE AGREEMENT ("Agreement"), dated ${effective}, is made and entered into by and between ${a.client_name || 'the undersigned Seller'} ("Seller"), and CLEARBLUE AERO, a Florida corporation ("Broker"). Seller and Broker agree as follows:`,
      ],
    },
    {
      heading: '1. Appointment of Broker',
      body: [
        `Subject to and upon the terms and conditions of this Agreement, Seller hereby employs Broker as Seller's exclusive broker, and hereby grants to Broker the exclusive worldwide right to sell, broker and market the hereinafter described Aircraft, during the term of this Agreement. Seller shall not grant to any other entity or individual any rights whatsoever in connection with the sale of the Aircraft during the term of this Agreement. As used herein, "Aircraft" means and refers to the aircraft described on attached Exhibit A.`,
      ],
    },
    {
      heading: '2. Term',
      body: [
        `The term of this Agreement shall commence on the execution date of this Agreement and shall continue for a period of ${termWords} (${termMonths}) month${termMonths === 1 ? '' : 's'} and shall thereafter automatically terminate without the giving of written notice to the other party, unless continuation of this Agreement is agreed by the parties by separate agreement. Notwithstanding the termination of the term of this Agreement, the compensation described in Section 6 shall be due and payable to Broker by Seller if, within the thirty (30) day period following the effective date of any termination of this Agreement, Seller sells or agrees to sell the Aircraft to any person or entity (including any associated company or affiliate thereof) introduced to Seller by Broker or any agent or representative of Broker during the term of this Agreement.`,
      ],
    },
    {
      heading: "3. Broker's Representations and Covenants",
      body: [
        `Broker is engaged in the business of selling corporate turbine-powered and piston aircraft and has the capabilities reasonably necessary to perform the services contemplated by this Agreement. Broker has adequate capabilities to conduct a continuous sales campaign for the sale of Aircraft and will actively pursue the representation and sale of the Aircraft.`,
      ],
    },
    {
      heading: "4. Seller's Representations and Covenants",
      body: [
        `Seller represents that it is the sole owner of the Aircraft free and clear of any claim thereto by or lien or encumbrance thereon in favor of any other person or entity, and will deliver to the purchaser good and marketable title to the Aircraft free and clear of all claims, liens and encumbrances. If Seller withdraws the Aircraft from the market prior to the termination of the term of this Agreement, Seller will reimburse Broker for all advertising and selling costs relating to the Aircraft, up to One Thousand Dollars (US$1,000.00).`,
      ],
    },
    {
      heading: '5. Marketing and Sale of Aircraft',
      body: [
        `(a) Seller agrees to sell Aircraft upon acceptance of a purchase offer, payable in cash in U.S. currency at closing, from a financially responsible party, so long as a mutually acceptable sale and purchase agreement is executed by the prospective purchaser and submitted to Seller with reasonable promptness after the offer is made. The sale and purchase agreement shall specify that the purchaser shall pay any applicable sales, use and/or other transfer taxes that relate to the Aircraft as a result of the transaction. The purchase offer must be accompanied by an earnest money deposit (cash or certified funds in U.S. currency) of at least Ten Thousand Dollars (US $10,000.00), which shall be held by the Broker in Escrow until the closing of such sale. Seller reserves the right to accept or reject any lesser offer that may be submitted.`,
        `(b) THE AIRCRAFT IS TO BE SOLD "AS IS", "WHERE IS" AND WITHOUT ANY WARRANTY, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTY OF MERCHANTABILITY OR FITNESS FOR ANY PARTICULAR USE OR PURPOSE. NEITHER SELLER NOR BROKER SHALL BE LIABLE FOR ANY CONSEQUENTIAL DAMAGES INCURRED BY ANY PURCHASER OR ANYONE CLAIMING THROUGH SUCH PURCHASER, EVEN IF IT HAS BEEN ADVISED IN ADVANCE ABOUT THE POSSIBILITY OF SUCH DAMAGES.`,
      ],
    },
    {
      heading: "6. Broker's Compensation",
      body: [
        compensation,
        `Broker's compensation as set forth herein shall be payable in respect of (a) any sale of the Aircraft consummated during the term hereof or within the 30-day period immediately following termination of the term of this Agreement as described in Section 2, or (b) any offer obtained by Broker in accordance with the terms set forth herein that is not accepted by Seller.`,
      ],
    },
    {
      heading: '7. Indemnification',
      body: [
        `Seller agrees to indemnify, hold harmless and defend Broker from and against any and all claims, demands, liabilities and/or damages resulting or arising from this Agreement, Broker's actions pursuant hereto and/or the sale of the Aircraft, including any claims, demands, liabilities and/or damages arising from any representations or warranties made by Seller in connection with said sale.`,
      ],
    },
    {
      heading: '8. Notices',
      body: [
        `Any and all notices, elections or demands permitted or required to be made under this Agreement shall be in writing and shall be delivered personally, by facsimile, emailed or sent by a nationally recognized courier service (such as Federal Express) or by certified mail to the other party at the address set forth below, or such other address as may be supplied in writing and of which receipt has been acknowledged in writing. The date of personal delivery or fax, the day after the date of delivery to such courier service, or the third (3rd) day after the date of mailing, as the case may be, shall be the date of such notice, election or demand, and rejection, refusal to accept or inability to deliver because of a changed address of which no notice was sent shall not affect the validity of any notice, election or demand given in accordance with the provisions of this Agreement. For the purposes of this Agreement:`,
        `The address of Seller is:`,
        ...sellerNotice,
        `The address of Broker is:`,
        `ClearBlue Aero`,
        `132 International Speedway Blvd, Ste. 92, Daytona Beach, FL 32114`,
        `Attention: John F Secord`,
        `Office: (386) 227-6840`,
        `Email: jsecord@flyclearblue.com`,
      ],
    },
    {
      heading: '9. Entire Agreement; Binding Effect',
      body: [
        `This Agreement contains the entire agreement of the parties with respect to the subject matter hereof and supersedes any other discussions or agreements relating to the subject of this Agreement. This Agreement shall be binding upon and shall inure to the benefit of the parties hereto and their respective heirs, successors, successors in-title and assigns, as the case may be.`,
      ],
    },
    {
      heading: '10. Amendments and Modifications',
      body: [
        `Neither this Agreement nor any provision hereof may be altered, amended, modified or changed orally, but may be so altered, amended, modified or changed only by an instrument in writing signed by the party against whom enforcement of such alteration, amendment, modification or change is sought.`,
      ],
    },
    {
      heading: '11. Governing Law, Jurisdiction and Venue',
      body: [
        `This Agreement shall be construed in accordance with and governed by the law of the State of Florida. In the event legal proceedings to enforce this Agreement shall become necessary, it is understood and agreed that the courts of Florida shall have jurisdiction and that venue shall be proper in Volusia County, Florida.`,
      ],
    },
    {
      heading: '12. Counterparts',
      body: [
        `This Agreement may be executed in multiple counterparts or copies (including facsimile copies), each of which shall be deemed an original hereof for all purposes. One or more counterparts or copies of this Agreement may be executed by one or more of the parties hereto, and different counterparts or copies may be executed by one or more of the other parties. Each counterpart or copy hereof executed by any party hereto shall be binding upon the party executing same even though other parties may execute one or more different counterparts or copies, and all counterparts or copies hereof so executed shall constitute but one and the same agreement.`,
      ],
    },
    {
      heading: 'EXHIBIT A \u2014 Aircraft',
      body: [
        `The aircraft subject to this Agreement (the "Aircraft") is: ${a.aircraft_summary || 'as described in the parties\u2019 records'}, together with all installed avionics, equipment, engines, propellers, logbooks and records.`,
      ],
    },
    {
      heading: '',
      body: [
        `IN WITNESS WHEREOF, the parties hereto have executed this Agreement or have caused this Agreement to be executed as of the date first above written.`,
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
  const termMonths = a.term_months != null && Number(a.term_months) > 0 ? Math.round(Number(a.term_months)) : 3;

  doc.setFillColor(0, 68, 127);
  doc.rect(0, 0, pageW, 70, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ClearBlue Aero', margin, 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Aircraft Brokerage Agreement', margin, 50);
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
  writeWrapped(`Seller: ${a.client_name || 'N/A'}`, { size: 10 });
  writeWrapped(`Listing Price: ${usd(a.asking_price) || 'As established during the Term'}`, { size: 10 });
  writeWrapped(`Commission: ${a.commission_rate != null && Number(a.commission_rate) > 0 ? Number(a.commission_rate) + '%' : 'As agreed in writing'}`, { size: 10 });
  writeWrapped(`Term: ${termMonths} month${termMonths === 1 ? '' : 's'} beginning ${formatEffectiveDate(a.effective_date) || 'the Effective Date'}`, { size: 10 });
  y += 8;

  for (const section of buildAgreementSections(a)) {
    y += 4;
    if (section.heading) writeWrapped(section.heading, { style: 'bold', size: 11, color: [15, 23, 42] });
    for (const p of section.body) writeWrapped(p, { size: 10 });
    y += 2;
  }

  y += 8;
  writeWrapped('ACKNOWLEDGED BY SELLER', { style: 'bold', size: 11, color: [15, 23, 42] });
  for (const ack of AGREEMENT_ACKNOWLEDGMENTS) {
    const checked = Array.isArray(a.acknowledged_items) && a.acknowledged_items.includes(ack.id);
    writeWrapped(`${checked ? '[X]' : '[ ]'}  ${ack.text}`, { size: 9 });
  }

  y += 14;
  ensureSpace(150);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text("Seller's Signature", margin, y);
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

  // Broker countersignature block
  y += 30;
  ensureSpace(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CLEARBLUE AERO', margin, y);
  y += 26;
  doc.setDrawColor(130, 130, 130);
  doc.line(margin, y, margin + 320, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('John F Secord, Sr., Principal', margin, y + 14);
  doc.text(`Date: ${signedDate}`, margin + 200, y + 14);

  y += 34;
  ensureSpace(30);
  writeWrapped(
    `This agreement was signed electronically by ${a.printed_name || a.client_name || 'the Seller'}${signedStr ? ' on ' + signedStr : ''}. Signature capture IP address: ${a.signer_ip || 'n/a'}.`,
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
            Your aircraft brokerage agreement is ready to review and sign online. It takes about two minutes from your phone or computer.
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
            Your aircraft brokerage agreement${aircraftSummary ? ' for ' + aircraftSummary : ''} has been signed and countersigned by ClearBlue Aero.
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
            The executed copy has been filed to the deal, client, and aircraft records. The aircraft is ready to be listed manually.
          </p>
          ${pdfUrl ? `<p style="margin:0;font-size:12px;color:#00447f;word-break:break-all;"><a href="${pdfUrl}">View the executed agreement</a></p>` : ''}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;