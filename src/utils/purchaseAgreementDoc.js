import { Document, Packer, Paragraph, TextRun, AlignmentType, TabStopType, TabStopPosition } from "docx";

function numberToWords(num) {
  if (!num || isNaN(num)) return 'N/A';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convert(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '') + ' ';
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + convert(n % 100);
    if (n < 1000000) return convert(Math.floor(n / 1000)) + 'Thousand ' + convert(n % 1000);
    return convert(Math.floor(n / 1000000)) + 'Million ' + convert(n % 1000000);
  }

  const cents = Math.round((num % 1) * 100);
  const dollars = Math.floor(num);
  let result = convert(dollars).trim() + ' Dollars';
  if (cents > 0) result += ' and ' + convert(cents).trim() + ' Cents';
  return result;
}

function formatCurrency(num) {
  if (!num || isNaN(num)) return 'N/A';
  return '$' + Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const BOLD = { bold: true, size: 22 };
const NORMAL = { size: 22 };

function heading(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 28 })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 300, after: 200 },
  });
}

function subHeading(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24 })],
    spacing: { before: 240, after: 100 },
  });
}

function body(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: 140 },
  });
}

function signatureLine() {
  return new Paragraph({
    children: [new TextRun({ text: '______________________________         Date: ____________          ______________________________         Date: ____________', size: 22 })],
    spacing: { before: 200, after: 200 },
  });
}

export function getAgreementFilename(deal, aircraft) {
  const yrMakeModel = aircraft
    ? `${aircraft.year}_${aircraft.make}_${aircraft.model}`.replace(/\s+/g, '_')
    : (deal.aircraft_summary || 'Aircraft').replace(/\s+/g, '_');
  const date = new Date().toISOString().split('T')[0];
  return `Purchase_Agreement_${yrMakeModel}_${date}.docx`;
}

export async function buildPurchaseAgreementDocx(deal, aircraft) {
  const yrMakeModel = aircraft
    ? `${aircraft.year} ${aircraft.make} ${aircraft.model}`
    : (deal.aircraft_summary || 'N/A');
  const registration = aircraft?.registration || '';
  const agreedPrice = deal.agreed_price;
  const deposit = deal.deposit_amount;
  const escrowFee = deal.escrow_fee;
  const escrowCompany = deal.escrow_company || 'an escrow company';
  const prebuyLocation = deal.prebuy_facility || 'a location agreed upon by both the Seller and Buyer';
  const sellerName = deal.seller_name || 'Seller';
  const buyerName = deal.buyer_name || 'Buyer';

  const children = [
    heading('AIRCRAFT PURCHASE AGREEMENT'),
    new Paragraph({
      children: [new TextRun({ text: yrMakeModel, bold: true, size: 26 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Registration: ${registration}`, size: 22 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
    body(`PLEASE ACCEPT THIS OFFER TO PURCHASE THE AIRCRAFT SPECIFIED ABOVE SUBJECT TO THE TERMS AND CONDITIONS SET FORTH IN PAGES THREE (3) THRU FIVE (5) OF THIS ORDER.`),
    signatureLine(),

    subHeading('TERMS AND CONDITIONS'),
    body(`This Purchase Agreement constitutes the entire agreement of the parties hereto with respect to the purchase and sale of the aircraft described and referred to on page two (2) of this agreement. This agreement may not be modified or terminated orally. No claimed modification, termination or waiver of any of its provisions shall be valid unless in writing signed by the party to be bound thereby. The terms and conditions hereof supersede and cancel any terms contained in any other documents to the extent they are inconsistent herewith. This Purchase Agreement becomes a binding contract when both parties sign it. Buyer and Seller agree that this contract between them is subject to the following:`),

    subHeading('Consideration'),
    body(`It is agreed the sale price of the airplane is ${numberToWords(agreedPrice)} (${formatCurrency(agreedPrice)}) and is due on delivery. All monies paid in accordance with this Agreement will be made by cash, cashier's check, certified check, wire transfer, or equivalent.`),

    subHeading('Escrow'),
    body(`It is agreed that within three (1) business day(s) after execution of this agreement, an escrow account will be established with ${escrowCompany} agreeable to both parties. Escrow company to provide title search. All funds, including the deposit, and documents listed in Appendix A pertaining to this transaction, shall be transmitted through said escrow account. Escrow fees shall not exceed ${formatCurrency(escrowFee)} in total and shall be split evenly between Buyer and Seller.`),

    subHeading('Deposit'),
    body(`The Buyer shall pay a deposit of ${numberToWords(deposit)} (${formatCurrency(deposit)}) to the escrow account immediately upon the establishment of that account. The deposit is fully refundable to the Buyer except as otherwise stipulated herein. The deposit shall be credited to the purchase price of the Aircraft.`),

    subHeading('Pre-purchase Inspection'),
    body(`After the signing of this Agreement and the payment of the deposit into escrow, the Buyer shall have the right to perform a pre-purchase Aircraft inspection to include all available Aircraft logbooks. Such inspection shall be at the Buyer's expense and may be performed by an individual(s) of Buyer's choice, so long as he/she/they hold current Airframe and Powerplant mechanic certificates issued by the Federal Aviation Administration. The inspection shall be performed at ${prebuyLocation}. If the Aircraft is required to be ferried to a location other than that of its domicile, all expenses incurred, including but not limited to fuel cost, ferry pilot fee, and others, will be paid by the Buyer.`),
    body(`Upon completion of this inspection, Buyer shall present to the Seller any list of discrepancies compiled, which may include, but not be limited to, maintenance issues, required ADs, and/or other required repairs or safety concerns, and the like. The Seller shall have three (3) business days to review the list and to notify the Buyer of Seller's decision: (a) to pay to have the discrepancies affecting the airworthiness of the Aircraft repaired at Seller's expense and to complete the sale; or (b) to decline to pay the costs of repairs and to terminate the Agreement. If Seller declines to pay the cost of repairs, Seller shall refund, or have refunded, the Buyer's deposit within Three (3) business day(s).`),

    subHeading('Force Majeure'),
    body(`Seller shall not be liable for failure to deliver or delays in delivery due to causes beyond its control, including but not limited to strikers, lockouts or other labor difficulties, machinery breakdowns, inability to obtain shipping space or transportation, delays of carriers or suppliers, fires, floods, acts of God, war or other outbreak of hostilities, mobilization, civil commotion, riots, embargoes and domestic or foreign governmental regulations or orders. In such event, Buyer's sole remedy and Seller's sole liability for failure to deliver, or delay in delivery, will be limited to the return of that part of the purchase price which Buyer may have paid to Seller.`),

    subHeading('Title, Logbooks and Delivery'),
    body(`Title to Aircraft shall pass to Buyer when the full purchase price is paid to Seller. All risk of loss shall be on Buyer from and after receipt of possession of the aircraft.`),

    subHeading('Warranties'),
    body(`Except as stated elsewhere on the face hereof, NO WARRANTY, WHETHER OF MERCHANTABILITY, FITNESS FOR PURPOSE, OR OTHERWISE, EXPRESS OR IMPLIED IN FACT OR BY LAW, IS OR SHALL BE APPLICABLE to aircraft sold hereunder. Seller and its direct and indirect suppliers/vendors shall have no other or further liability by reason of the manufacture or sale of any aircraft products sold hereunder or of their use, whether on the basis of breach of warranty, strict liability, negligence, or otherwise. In no event shall Seller or its direct or indirect supplier/vendors be liable for general, special, consequential, or incidental damages relating to property damage or economic loss (including, without limitation, damages for loss of use or loss of profits).`),

    subHeading('Enforceability'),
    body(`In the event any provision of the Agreement is prohibited by or invalid under applicable law, such provision shall be ineffective only to the extent of such prohibition or invalidity, without affecting the remainder of such provision or the remaining provisions of this agreement, which shall continue in full force and effect.`),

    subHeading("Seller's Inability to Perform"),
    body(`(a) If the Aircraft is destroyed or, in Seller's opinion, damaged beyond repair, or is seized by the United States Government, Seller shall promptly notify Buyer. On receipt of such notification, this Agreement will be terminated, and the Seller shall return to Buyer all payments made in accordance with this Agreement, and the Seller will be relieved of any obligation to replace or repair the Aircraft.`),
    body(`(b) Seller will not be responsible or deemed to be in default for delays in performance of this Agreement due to causes beyond Seller's control and not caused by Seller's fault or negligence.`),

    subHeading("Buyer's Inability to Perform"),
    body(`Buyer agrees that if he/she wilfully fails to accept the aircraft within 7 days after receipt of notification that the same are ready for delivery, the deposit made with this order shall be retained as liquidated damages and not as a penalty. Buyer acknowledges that damages for his/her failure to fulfil this agreement would be uncertain and difficult to ascertain, and the amount agreed upon as liquidated damages is a reasonable estimate of Seller's likely actual damages.`),

    subHeading('Taxes'),
    body(`The Buyer shall pay any sales or use tax imposed by its home state or local government, which results from the sale of the Aircraft.`),

    subHeading('Assignment'),
    body(`This Agreement may not be transferred or assigned without written authorization signed by Seller and Buyer.`),

    subHeading('Notice'),
    body(`All notices and requests required or authorized under this Agreement shall be given in writing by electronic email, facsimile, or certified mail, return receipt requested. The date on which any such notice is received by the addressee shall be deemed the date of notice.`),

    subHeading('Governing Law'),
    body(`This Agreement is a contract executed under and to be construed under the laws of the State of Florida.`),

    subHeading('Attorney Fees'),
    body(`In the event any action is filed in relation to this Agreement, each party shall be responsible for his/her/its own attorney's fees.`),

    subHeading('Waiver'),
    body(`Either party's failure to enforce any provision of this Agreement against the other party shall not be construed as a waiver thereof so as to excuse the other party from future performance of that provision or any other provision.`),

    subHeading('Severability'),
    body(`The invalidity of any portion of the Agreement shall not affect the validity of the remaining portions thereof.`),

    subHeading('Paragraph Headings'),
    body(`The headings to the paragraphs of this Agreement are solely for convenience and have no substantive effect on the Agreement, nor are they to aid in the interpretation of the Agreement.`),

    subHeading('Entire Agreement'),
    body(`This Agreement, including page two (2), constitutes the entire Agreement between the parties. No statements, promises, or inducements made by any party to this Agreement, or any agent or employees of either party, which not contained in this written contract, shall be valid or binding. This Agreement may not be enlarged, modified, or altered except in writing signed by the parties.`),

    new Paragraph({ spacing: { before: 300 } }),
    new Paragraph({
      children: [
        new TextRun({ text: `${sellerName} — Seller  |  Date: ____________`, size: 22 }),
        new TextRun({ text: '\t\t' }),
        new TextRun({ text: `${buyerName} — Buyer  |  Date: ____________`, size: 22 }),
      ],
      spacing: { after: 300 },
    }),

    heading('APPENDIX A'),
    subHeading('ESCROW INFORMATION'),
    body(`It is agreed that within Three (3) business days after execution of this agreement an escrow account will be established with escrow agreeable to both parties. All funds, including the deposit, and the following documents pertaining to this transaction. The Escrow company may require additional information and will provide such upon engagement.`),
    body(`Below is a basic checklist of documents in which are typically needed. This list will update once Title Search completed. A representative from the Escrow company will prepare and manage the closing documents including the appropriate FAA required documents listed below.`),

    subHeading('From Seller:'),
    body('___ an original FAA Form 8050-2 Bill of Sale signed by the seller (will be prepared and forwarded)'),
    body('___ a copy of the Purchase Agreement signed by the seller'),
    body('___ confirmation of disbursements'),
    body('___ wire transfer instructions for disbursements'),
    body('___ authorization by email or fax from the seller to close'),
    body('___ authorization by email or fax from the broker to close'),

    subHeading('From Buyer:'),
    body('___ an original FAA Form 8050-1 Application for Registration signed by the buyer.'),
    body('___ a copy of the LLC Statement signed by the buyer, if registering under an LLC entity'),
    body('___ an original Security Agreement signed by the buyer/debtor, if financing'),
    body('___ a copy of the Purchase Agreement signed by the buyer'),
    body('___ funds'),
    body('___ authorization by email or fax from the depositors of the funds to release funds'),
  ];

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  return Packer.toBlob(doc);
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}