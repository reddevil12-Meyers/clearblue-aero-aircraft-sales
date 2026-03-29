import { jsPDF } from 'jspdf';

const fmt = (v) => (v != null && v !== '') ? String(v) : '—';
const fmtMoney = (v) => v ? `$${Number(v).toLocaleString()}` : '—';
const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const NAVY = [26, 54, 103];
const BLACK = [30, 30, 30];
const GRAY = [100, 100, 100];
const WHITE = [255, 255, 255];
const TABLE_ROW_ALT = [245, 247, 252];

let doc, y, pageH, pageW, margin, contentW;

function checkPage(needed = 12) {
  if (y + needed > pageH - 20) {
    doc.addPage();
    y = margin;
  }
}

function addFooters() {
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text('Confidential — Not for distribution without written consent', margin, pageH - 7);
    doc.text(`Page ${i} of ${total}`, pageW - margin, pageH - 7, { align: 'right' });
  }
}

function sectionHeading(num, title) {
  checkPage(16);
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.text(`${num}. ${title}`, margin, y);
  y += 5;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentW, y);
  y += 5;
}

function paragraph(text) {
  if (!text) return;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...BLACK);
  const lines = doc.splitTextToSize(text, contentW);
  lines.forEach(line => {
    checkPage(5.5);
    doc.text(line, margin, y);
    y += 5.2;
  });
  y += 2;
}

function fieldLabel(text) {
  checkPage(5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text(text, margin, y);
  y += 4.5;
}

function kvGrid(pairs, cols = 2) {
  const colW = contentW / cols;
  let col = 0;
  pairs.forEach(([k, v]) => {
    const x = margin + col * colW;
    if (col === 0) checkPage(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(k, x, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...BLACK);
    doc.text(fmt(v), x, y + 4.5);
    col++;
    if (col >= cols) { col = 0; y += 13; }
  });
  if (col !== 0) y += 13;
  y += 2;
}

function drawTable(headers, rows, colWidths) {
  const rowH = 8;
  checkPage(rowH + 4);

  // Header
  let x = margin;
  doc.setFillColor(...NAVY);
  doc.rect(x, y - 5.5, contentW, rowH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  headers.forEach((h, i) => { doc.text(h, x + 3, y); x += colWidths[i]; });
  y += rowH - 2;

  // Rows
  rows.forEach((row, ri) => {
    checkPage(rowH);
    if (ri % 2 === 0) {
      doc.setFillColor(...TABLE_ROW_ALT);
      doc.rect(margin, y - 5.5, contentW, rowH, 'F');
    }
    let rx = margin;
    const isBold = row._bold;
    const cells = isBold ? row.cells : row;
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...BLACK);
    cells.forEach((cell, ci) => {
      const isLast = ci === cells.length - 1;
      const tx = isLast ? rx + colWidths[ci] - 3 : rx + 3;
      doc.text(String(cell), tx, y, { align: isLast ? 'right' : 'left' });
      rx += colWidths[ci];
    });
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 2.5, margin + contentW, y + 2.5);
    y += rowH;
  });
  y += 4;
}

function valuationBox(label, value) {
  checkPage(22);
  doc.setFillColor(...NAVY);
  doc.roundedRect(margin, y, contentW, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text(label, margin + 8, y + 7);
  doc.setFontSize(16);
  doc.setTextColor(255, 210, 60);
  doc.text(value, pageW - margin - 8, y + 10, { align: 'right' });
  y += 22;
}

async function loadImageAsBase64(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateAppraisalPDF(appraisal, aircraft, client, run, adjustments) {
  const logoBase64 = await loadImageAsBase64('https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1c49af472_logo-01.png');

  doc = new jsPDF({ unit: 'mm', format: 'a4' });
  pageW = 210;
  pageH = 297;
  margin = 18;
  contentW = pageW - margin * 2;
  y = margin;

  const acTitle = aircraft
    ? `${aircraft.year} ${aircraft.make} ${aircraft.model}, ${aircraft.registration}`
    : (appraisal.aircraft_summary || 'Subject Aircraft');

  // ── COVER PAGE ───────────────────────────────────────────────────────────
  // Logo
  if (logoBase64) {
    const logoW = 70;
    const logoH = 22;
    doc.addImage(logoBase64, 'PNG', (pageW - logoW) / 2, 15, logoW, logoH);
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Aircraft Appraisal Report', pageW / 2, 45, { align: 'center' });

  doc.setFontSize(13);
  doc.text(acTitle, pageW / 2, 62, { align: 'center' });

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.8);
  doc.line(margin, 68, pageW - margin, 68);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...GRAY);
  let metaY = 76;
  if (client) {
    doc.text(`Prepared For: ${client.first_name} ${client.last_name}${client.company ? ', ' + client.company : ''}`, margin, metaY);
    metaY += 6;
  }
  if (appraisal.appraisal_number) { doc.text(`Appraisal No: ${appraisal.appraisal_number}`, margin, metaY); metaY += 6; }
  if (appraisal.appraisal_date) { doc.text(`Appraisal Date: ${fmtDate(appraisal.appraisal_date)}`, margin, metaY); metaY += 6; }
  if (appraisal.effective_date) { doc.text(`Effective Date of Value: ${fmtDate(appraisal.effective_date)}`, margin, metaY); metaY += 6; }
  doc.text(`Type: ${fmt(appraisal.appraisal_type)}  ·  Purpose: ${fmt(appraisal.purpose)}  ·  Methodology: ${fmt(appraisal.methodology)}`, margin, metaY);

  y = metaY + 14;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y - 4, pageW - margin, y - 4);

  const intro = `This appraisal has been prepared to provide a clear, supportable opinion of value for the subject aircraft. The analysis reflects current market behavior, with specific attention given to equipment, condition, and documented history. The intent is to present not only a value conclusion, but also the reasoning and methodology behind that conclusion in a manner that can be relied upon in real transaction scenarios.`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...BLACK);
  const introLines = doc.splitTextToSize(intro, contentW);
  introLines.forEach(line => { doc.text(line, margin, y); y += 5.5; });

  // ── PAGE 2+ — REPORT BODY ────────────────────────────────────────────────
  doc.addPage();
  y = margin;

  let sn = 1;

  // 1. Purpose and Scope
  sectionHeading(sn++, 'Purpose and Scope');
  paragraph(appraisal.purpose_scope || `This report provides a market-based opinion of value for use in ${appraisal.purpose || 'buyer and seller decision-making'}, brokerage positioning, negotiation support, and financing or advisory discussions. The analysis is intended to explain not only the final value conclusion, but also how the market interprets the aircraft's configuration, condition, and history.`);

  // 2. Aircraft Overview and Market Position
  sectionHeading(sn++, 'Aircraft Overview and Market Position');
  paragraph(appraisal.market_position || (aircraft ? `The ${aircraft.year} ${aircraft.make} ${aircraft.model} occupies a defined position within its segment of the general aviation market. Buyers in this category evaluate value through a balance of capability, avionics configuration, engine condition, and documented history. The subject aircraft's configuration, hours, and condition have been analyzed relative to current comparable listings and recent sales in the active market.` : ''));

  // 3. Subject Aircraft Summary
  sectionHeading(sn++, 'Subject Aircraft Summary');
  if (aircraft) {
    const summary = [
      aircraft.total_time ? `Airframe: ${aircraft.total_time} hours total time.` : null,
      aircraft.engine_time_smoh ? `Engine: ${aircraft.engine_time_smoh} hours SMOH.` : null,
      aircraft.propeller_time ? `Propeller: ${aircraft.propeller_time} hours.` : null,
      aircraft.avionics_suite ? `Avionics: ${aircraft.avionics_suite}${aircraft.avionics_details ? ' — ' + aircraft.avionics_details : ''}.` : null,
      aircraft.interior_condition ? `Interior: ${aircraft.interior_condition}.` : null,
      aircraft.exterior_condition ? `Exterior: ${aircraft.exterior_condition}.` : null,
      aircraft.damage_history && aircraft.damage_history !== 'None' ? `Damage History: ${aircraft.damage_history}${aircraft.damage_details ? ' — ' + aircraft.damage_details : ''}.` : null,
    ].filter(Boolean).join(' ');
    paragraph(summary);
  }
  if (appraisal.aircraft_summary) paragraph(appraisal.aircraft_summary);

  // 4. Aircraft Identification (data table)
  sectionHeading(sn++, 'Aircraft Identification');
  if (aircraft) {
    kvGrid([
      ['Year of Manufacture', aircraft.year],
      ['Make / Manufacturer', aircraft.make],
      ['Model', aircraft.model],
      ['Registration (N-Number)', aircraft.registration],
      ['Serial Number', aircraft.serial_number],
      ['Engine Type', aircraft.engine_type],
      ['Number of Engines', aircraft.num_engines],
      ['Location', aircraft.location],
    ]);
    kvGrid([
      ['Total Airframe Time (hrs)', aircraft.total_time],
      ['Engine Time SMOH (hrs)', aircraft.engine_time_smoh],
      ['Propeller Time (hrs)', aircraft.propeller_time],
      ['ADS-B Compliant', aircraft.adsb_compliant ? 'Yes' : 'No'],
      ['Interior Condition', aircraft.interior_condition],
      ['Exterior Condition', aircraft.exterior_condition],
      ['Paint Year', aircraft.paint_year],
      ['Interior Year', aircraft.interior_year],
    ]);
    if (aircraft.avionics_suite) kvGrid([['Avionics Suite', aircraft.avionics_suite], ['Damage History', aircraft.damage_history]], 2);
  } else {
    paragraph(appraisal.aircraft_summary);
  }

  // Component narrative sections
  if (appraisal.airframe_assessment) { sectionHeading(sn++, 'Airframe'); paragraph(appraisal.airframe_assessment); }
  if (appraisal.engine_assessment) { sectionHeading(sn++, 'Engine'); paragraph(appraisal.engine_assessment); }
  if (aircraft && aircraft.propeller_time != null) {
    sectionHeading(sn++, 'Propeller');
    paragraph(appraisal.propeller_assessment || `Propeller time: ${aircraft.propeller_time} hours.`);
  }
  if (appraisal.avionics_assessment) { sectionHeading(sn++, 'Avionics'); paragraph(appraisal.avionics_assessment); }
  if (appraisal.interior_assessment) { sectionHeading(sn++, 'Interior'); paragraph(appraisal.interior_assessment); }
  if (appraisal.exterior_assessment) { sectionHeading(sn++, 'Exterior'); paragraph(appraisal.exterior_assessment); }

  if (aircraft && aircraft.damage_history && aircraft.damage_history !== 'None') {
    sectionHeading(sn++, 'Damage History');
    paragraph(appraisal.damage_assessment || (aircraft.damage_details || `Damage history noted as ${aircraft.damage_history}. Market perception includes permanent stigma, reduced buyer pool, and increased scrutiny. Professional repairs and proper documentation will materially reduce, but not eliminate, the value discount.`));
  }

  if (appraisal.ad_compliance || appraisal.logbook_status) {
    sectionHeading(sn++, 'AD Compliance & Logbooks');
    if (appraisal.logbook_status) kvGrid([['Logbook Status', appraisal.logbook_status]], 1);
    if (appraisal.ad_compliance) paragraph(appraisal.ad_compliance);
  }

  // Baseline Market Value
  if (run) {
    sectionHeading(sn++, 'Baseline Market Value');
    paragraph(`Using the sales comparison approach across ${run.comp_count || 0} comparable aircraft, the baseline market value for a ${aircraft ? aircraft.year + ' ' + aircraft.make + ' ' + aircraft.model : 'subject aircraft'} in average condition is established at ${fmtMoney(run.base_value)}. This assumes average cosmetics, no major negative history, and standard equipment for the fleet.`);
    if (appraisal.comparable_sales) paragraph(appraisal.comparable_sales);
  }

  // Value Adjustments with table
  if (adjustments && adjustments.length > 0) {
    sectionHeading(sn++, 'Value Adjustments');
    paragraph('The following adjustments reflect contributory market values — not replacement costs. Each item represents how the market interprets the aircraft relative to the baseline comparable set.');
    const adjRows = [
      ...(run ? [['Baseline Market Value', fmtMoney(run.base_value)]] : []),
      ...adjustments.map(a => [
        a.category,
        `${a.direction === 'Negative' ? '−' : '+'} ${fmtMoney(Math.abs(a.amount))}`,
      ]),
    ];
    if (run) {
      adjRows.push({ _bold: true, cells: ['Adjusted Market Value', fmtMoney(run.adjusted_value)] });
    }
    drawTable(['Component', 'Adjustment'], adjRows, [contentW * 0.65, contentW * 0.35]);
    if (appraisal.value_adjustments) paragraph(appraisal.value_adjustments);
  }

  // Valuation Summary
  sectionHeading(sn++, 'Final Opinion of Value');
  if (run) {
    paragraph(`Fair Market Value Range: ${fmtMoney(run.value_low)} – ${fmtMoney(run.value_high)}. Most Probable Value: ${fmtMoney(run.adjusted_value)} USD.`);
    valuationBox('Fair Market Value (Most Probable)', fmtMoney(run.adjusted_value));
    const valRows = [
      ['Wholesale Value', fmtMoney(run.wholesale_value)],
      ['Fair Market Value', fmtMoney(run.adjusted_value)],
      ['Retail Value', fmtMoney(run.retail_value)],
    ];
    drawTable(['Value Type', 'Amount'], valRows, [contentW * 0.6, contentW * 0.4]);
  } else if (appraisal.market_value) {
    valuationBox('Fair Market Value (Most Probable)', fmtMoney(appraisal.market_value));
  }
  if (appraisal.condition_rating) paragraph(`Overall Condition Rating: ${appraisal.condition_rating}/10`);

  // Marketability Analysis
  if (appraisal.marketability_analysis) {
    sectionHeading(sn++, 'Marketability Analysis');
    paragraph(appraisal.marketability_analysis);
  }

  // Pricing Strategy
  if (appraisal.pricing_strategy) {
    sectionHeading(sn++, 'Pricing Strategy');
    paragraph(appraisal.pricing_strategy);
  }

  // Assumptions & Limitations
  if (appraisal.appraiser_notes) {
    sectionHeading(sn++, 'Assumptions & Limitations');
    paragraph(appraisal.appraiser_notes);
  }

  if (appraisal.fee || appraisal.payment_status) {
    sectionHeading(sn++, 'Billing');
    kvGrid([['Appraisal Fee', fmtMoney(appraisal.fee)], ['Payment Status', appraisal.payment_status]]);
  }

  addFooters();

  const filename = `Appraisal_${appraisal.appraisal_number || 'Report'}_${acTitle.replace(/[\s,]+/g, '_')}.pdf`;
  doc.save(filename);
}