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

export function generateAppraisalPDF(appraisal, aircraft, client) {
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
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...NAVY);
  doc.text('Aircraft Appraisal Report', pageW / 2, 45, { align: 'center' });

  doc.setFontSize(13);
  doc.text(acTitle, pageW / 2, 58, { align: 'center' });

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.8);
  doc.line(margin, 63, pageW - margin, 63);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...GRAY);
  let metaY = 71;
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

  const intro = `This appraisal has been prepared to provide a clear, supportable opinion of value for the subject aircraft. The analysis reflects current market conditions, with specific attention given to equipment, condition, and documented history. All values expressed are in United States Dollars (USD).`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...BLACK);
  const introLines = doc.splitTextToSize(intro, contentW);
  introLines.forEach(line => { doc.text(line, margin, y); y += 5.5; });

  // ── PAGE 2+ — REPORT BODY ────────────────────────────────────────────────
  doc.addPage();
  y = margin;

  let sn = 1;

  // Aircraft Identification
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
    if (aircraft.avionics_details) { fieldLabel('Avionics Details'); paragraph(aircraft.avionics_details); }
    if (aircraft.damage_history && aircraft.damage_history !== 'None' && aircraft.damage_details) {
      fieldLabel('Damage Details'); paragraph(aircraft.damage_details);
    }
    if (aircraft.notes) { fieldLabel('Aircraft Notes'); paragraph(aircraft.notes); }
  } else {
    paragraph(appraisal.aircraft_summary);
  }

  if (appraisal.airframe_assessment) { sectionHeading(sn++, 'Airframe'); paragraph(appraisal.airframe_assessment); }
  if (appraisal.engine_assessment) { sectionHeading(sn++, 'Engine'); paragraph(appraisal.engine_assessment); }
  if (appraisal.avionics_assessment) { sectionHeading(sn++, 'Avionics'); paragraph(appraisal.avionics_assessment); }
  if (appraisal.interior_assessment) { sectionHeading(sn++, 'Interior'); paragraph(appraisal.interior_assessment); }
  if (appraisal.exterior_assessment) { sectionHeading(sn++, 'Exterior'); paragraph(appraisal.exterior_assessment); }

  if (appraisal.ad_compliance) {
    sectionHeading(sn++, 'AD Compliance & Logbooks');
    if (appraisal.logbook_status) kvGrid([['Logbook Status', appraisal.logbook_status]], 1);
    paragraph(appraisal.ad_compliance);
  }

  if (appraisal.comparable_sales) { sectionHeading(sn++, 'Comparable Sales Analysis'); paragraph(appraisal.comparable_sales); }
  if (appraisal.value_adjustments) { sectionHeading(sn++, 'Value Adjustments'); paragraph(appraisal.value_adjustments); }

  // Valuation Summary
  sectionHeading(sn++, 'Valuation Summary');
  if (appraisal.market_value || appraisal.wholesale_value || appraisal.retail_value) {
    const valRows = [];
    if (appraisal.wholesale_value) valRows.push(['Wholesale Value', fmtMoney(appraisal.wholesale_value)]);
    if (appraisal.retail_value) valRows.push(['Retail Value', fmtMoney(appraisal.retail_value)]);
    if (appraisal.market_value) valRows.push({ _bold: true, cells: ['Fair Market Value', fmtMoney(appraisal.market_value)] });
    if (valRows.length) drawTable(['Component', 'Value'], valRows, [contentW * 0.6, contentW * 0.4]);
    if (appraisal.market_value) valuationBox('Fair Market Value (Most Probable)', fmtMoney(appraisal.market_value));
  }
  if (appraisal.condition_rating) paragraph(`Overall Condition Rating: ${appraisal.condition_rating}/10`);

  if (appraisal.fee || appraisal.payment_status) {
    sectionHeading(sn++, 'Billing');
    kvGrid([['Appraisal Fee', fmtMoney(appraisal.fee)], ['Payment Status', appraisal.payment_status]]);
  }

  addFooters();

  const filename = `Appraisal_${appraisal.appraisal_number || 'Report'}_${acTitle.replace(/[\s,]+/g, '_')}.pdf`;
  doc.save(filename);
}