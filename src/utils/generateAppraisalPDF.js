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

function drawImpairmentSection(run, adjustments) {
  if (!run || !run.adjusted_value) return;

  // Separate positive and negative adjustments
  const positiveAdjs = (adjustments || []).filter(a => a.direction === 'Positive');
  const negativeAdjs = (adjustments || []).filter(a => a.direction === 'Negative');

  if (negativeAdjs.length === 0) return; // No impairment to show

  const positiveTotal = positiveAdjs.reduce((s, a) => s + Math.abs(Number(a.amount)), 0);
  const adjustedBaseline = (run.base_value || 0) + positiveTotal;
  if (adjustedBaseline <= 0) return;

  const totalNegative = negativeAdjs.reduce((s, a) => s + Math.abs(Number(a.amount)), 0);
  const impliedImpairment = totalNegative / adjustedBaseline;
  const midPct = Math.round(impliedImpairment * 100);
  const lowPct = Math.max(midPct - 2, 1);
  const highPct = midPct + 2;

  const scenarios = [
    { pct: highPct, value: Math.round(adjustedBaseline * (1 - highPct / 100) / 100) * 100 },
    { pct: midPct,  value: Math.round(adjustedBaseline * (1 - midPct  / 100) / 100) * 100 },
    { pct: lowPct,  value: Math.round(adjustedBaseline * (1 - lowPct  / 100) / 100) * 100 },
  ];
  const mostProbable = scenarios[1].value;

  // Impairment table
  const negCategories = negativeAdjs.map(a => a.category).join(', ');
  paragraph(`Apply market impairment for: ${negCategories}.`);
  paragraph(`Impairment Range: ${lowPct}% \u2013 ${highPct}%`);

  const impairRows = scenarios.map(s => [
    `${s.pct}%`,
    `${fmtMoney(adjustedBaseline)} \xd7 ${(1 - s.pct / 100).toFixed(2)}`,
    fmtMoney(s.value),
  ]);
  drawTable(['Impairment', 'Formula', 'Value'], impairRows, [contentW * 0.18, contentW * 0.52, contentW * 0.30]);

  paragraph(`Resulting Value Range: ${fmtMoney(scenarios[0].value)} \u2013 ${fmtMoney(scenarios[2].value)}. Most Probable Value: ${fmtMoney(mostProbable)}.`);

  // Valuation Range Bar Chart
  checkPage(70);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text('Valuation Range Illustration', margin, y);
  y += 3;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentW, y);
  y += 6;

  const chartH = 45;
  const chartW = contentW * 0.6;
  const chartX = margin + contentW * 0.05;
  const minVal = Math.min(...scenarios.map(s => s.value)) * 0.96;
  const maxValC = Math.max(...scenarios.map(s => s.value)) * 1.02;
  const barWidth = chartW / (scenarios.length * 2 + 1);
  const chartBaseY = y + chartH;

  // Y axis ticks
  const tickCount = 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  for (let t = 0; t <= tickCount; t++) {
    const tv = minVal + (maxValC - minVal) * (t / tickCount);
    const ty = chartBaseY - chartH * (t / tickCount);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.15);
    doc.line(chartX, ty, chartX + chartW, ty);
    doc.text(fmtMoney(tv), chartX - 2, ty + 1, { align: 'right' });
  }

  // Bars
  scenarios.forEach((s, i) => {
    const bx = chartX + barWidth * (i * 2 + 0.5);
    const bh = ((s.value - minVal) / (maxValC - minVal)) * chartH;
    const by = chartBaseY - bh;
    doc.setFillColor(200, 30, 40);
    doc.rect(bx, by, barWidth * 1.2, bh, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...BLACK);
    doc.text(`${s.pct}% Disc.`, bx + barWidth * 0.6, chartBaseY + 5, { align: 'center' });
  });

  // Most probable value line
  const mpY = chartBaseY - ((mostProbable - minVal) / (maxValC - minVal)) * chartH;
  doc.setDrawColor(26, 54, 103);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([2, 1], 0);
  doc.line(chartX, mpY, chartX + chartW, mpY);
  doc.setLineDashPattern([], 0);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...NAVY);
  doc.text(`Most probable value: ${fmtMoney(mostProbable)}`, chartX + chartW + 3, mpY + 1);

  y = chartBaseY + 12;
}

function drawCompsBarChart(comps, subjectValue) {
  if (!comps || comps.length === 0) return;

  // Build bar data: use sold_price if available, else asking_price
  const bars = comps
    .map(c => ({
      label: `${c.year || ''} ${c.make || ''} ${c.model || ''}`.trim().slice(0, 28),
      value: c.sold_price || c.asking_price || 0,
      sold: !!c.sold_price,
    }))
    .filter(b => b.value > 0)
    .slice(0, 10);

  if (subjectValue) {
    bars.push({ label: 'Subject (Appraised Value)', value: subjectValue, subject: true });
  }

  if (bars.length === 0) return;

  const maxVal = Math.max(...bars.map(b => b.value));
  const barH = 7;
  const gap = 3;
  const labelW = 62;
  const barAreaW = contentW - labelW - 24;
  const totalH = bars.length * (barH + gap) + 14;

  checkPage(totalH + 10);

  bars.forEach((bar, i) => {
    const rowY = y + i * (barH + gap);
    const barW = (bar.value / maxVal) * barAreaW;
    const barX = margin + labelW;

    // label
    doc.setFont('helvetica', bar.subject ? 'bold' : 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...(bar.subject ? NAVY : BLACK));
    doc.text(bar.label, margin, rowY + barH - 1.5, { maxWidth: labelW - 3 });

    // bar fill
    if (bar.subject) {
      doc.setFillColor(255, 200, 40);
    } else if (bar.sold) {
      doc.setFillColor(60, 140, 80);
    } else {
      doc.setFillColor(26, 54, 103);
    }
    doc.roundedRect(barX, rowY, Math.max(barW, 2), barH, 1, 1, 'F');

    // value label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text(fmtMoney(bar.value), barX + barW + 2, rowY + barH - 1.5);
  });

  y += totalH;

  // Legend
  checkPage(8);
  const legendItems = [
    { color: [26, 54, 103], label: 'Asking Price' },
    { color: [60, 140, 80], label: 'Sold Price' },
    { color: [255, 200, 40], label: 'Subject Appraised Value' },
  ];
  let lx = margin;
  legendItems.forEach(({ color, label }) => {
    doc.setFillColor(...color);
    doc.rect(lx, y, 4, 4, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(label, lx + 6, y + 3.5);
    lx += 52;
  });
  y += 10;
}

export async function generateAppraisalPDF(appraisal, aircraft, client, run, adjustments, comps = []) {
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
      ['Engine Manufacturer', aircraft.engine_manufacturer],
      ['Engine Model', aircraft.engine_model],
      [`Engine Time ${aircraft.engine_time_type || 'SMOH'} (hrs)`, aircraft.engine_time_smoh],
      ['Propeller Manufacturer', aircraft.propeller_manufacturer],
      ['Propeller Model', aircraft.propeller_model],
      ['Propeller Time (hrs)', aircraft.propeller_time],
      ['ADS-B Compliant', aircraft.adsb_compliant ? 'Yes' : 'No'],
      ['Interior Condition', aircraft.interior_condition],
      ['Exterior Condition', aircraft.exterior_condition],
      ['Paint Year', aircraft.paint_year],
      ['Interior Year', aircraft.interior_year],
    ]);
    if (Number(aircraft.num_engines) >= 2) {
      kvGrid([
        ['Engine 2 Manufacturer', aircraft.engine2_manufacturer],
        ['Engine 2 Model', aircraft.engine2_model],
        [`Engine 2 Time ${aircraft.engine2_time_type || 'SMOH'} (hrs)`, aircraft.engine2_time_smoh],
        ['Propeller 2 Manufacturer', aircraft.propeller2_manufacturer],
        ['Propeller 2 Time (hrs)', aircraft.propeller2_time],
      ]);
    }
    if (aircraft.avionics_suite) kvGrid([['Avionics Suite', aircraft.avionics_suite], ['Damage History', aircraft.damage_history]], 2);
  } else {
    paragraph(appraisal.aircraft_summary);
  }

  // Component narrative sections
  if (appraisal.airframe_assessment) { sectionHeading(sn++, 'Airframe'); paragraph(appraisal.airframe_assessment); }

  // Engine section — always render if we have engine data
  {
    sectionHeading(sn++, 'Engine');
    if (aircraft) {
      const enginePairs = [
        ['Engine Type', aircraft.engine_type],
        ['Number of Engines', aircraft.num_engines],
        ['Engine Manufacturer', aircraft.engine_manufacturer],
        ['Engine Model', aircraft.engine_model],
        [`Engine Time ${aircraft.engine_time_type || 'SMOH'} (hrs)`, aircraft.engine_time_smoh],
        ['Propeller Manufacturer', aircraft.propeller_manufacturer],
        ['Propeller Model', aircraft.propeller_model],
        ['Propeller Time (hrs)', aircraft.propeller_time],
      ].filter(([, v]) => v != null && v !== '');
      if (enginePairs.length > 0) kvGrid(enginePairs, 2);
      if (Number(aircraft.num_engines) >= 2) {
        const eng2Pairs = [
          ['Engine 2 Manufacturer', aircraft.engine2_manufacturer],
          ['Engine 2 Model', aircraft.engine2_model],
          [`Engine 2 Time ${aircraft.engine2_time_type || 'SMOH'} (hrs)`, aircraft.engine2_time_smoh],
          ['Propeller 2 Manufacturer', aircraft.propeller2_manufacturer],
          ['Propeller 2 Model', aircraft.propeller2_model],
          ['Propeller 2 Time (hrs)', aircraft.propeller2_time],
        ].filter(([, v]) => v != null && v !== '');
        if (eng2Pairs.length > 0) { fieldLabel('Engine 2'); kvGrid(eng2Pairs, 2); }
      }
    }
    if (appraisal.engine_assessment) paragraph(appraisal.engine_assessment);
  }
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

    // Comps bar chart
    if (comps && comps.length > 0) {
      sectionHeading(sn++, 'Comparable Sales — Price Comparison');
      paragraph('The following chart compares the appraised value of the subject aircraft against comparable listings and sales used in this analysis.');
      drawCompsBarChart(comps, run.adjusted_value);
    }
  }

  // Value Adjustments with table
  if (adjustments && adjustments.length > 0) {
    sectionHeading(sn++, 'Value Adjustments');
    paragraph('The following adjustments reflect contributory market values — not replacement costs. Each item represents how the market interprets the aircraft relative to the baseline comparable set.');

    // Split into positive and negative for clarity
    const posAdjs = adjustments.filter(a => a.direction === 'Positive');
    const negAdjs = adjustments.filter(a => a.direction === 'Negative');
    const posTotal = posAdjs.reduce((s, a) => s + Math.abs(Number(a.amount)), 0);
    const adjustedBaseline = (run?.base_value || 0) + posTotal;

    const adjRows = [
      ...(run ? [['Baseline Market Value', fmtMoney(run.base_value)]] : []),
      ...posAdjs.map(a => [a.category, `+ ${fmtMoney(Math.abs(a.amount))}`]),
      ...(posAdjs.length > 0 ? [{ _bold: true, cells: ['Adjusted Baseline', fmtMoney(adjustedBaseline)] }] : []),
      ...negAdjs.map(a => [a.category, `− ${fmtMoney(Math.abs(a.amount))}`]),
      ...(run ? [{ _bold: true, cells: ['Final Adjusted Value', fmtMoney(run.adjusted_value)] }] : []),
    ];
    drawTable(['Component', 'Amount'], adjRows, [contentW * 0.65, contentW * 0.35]);
    if (appraisal.value_adjustments) paragraph(appraisal.value_adjustments);

    // Impairment section (item 13)
    if (negAdjs.length > 0) {
      sectionHeading(sn++, 'Valuation Calculation (With Impairment)');
      drawImpairmentSection(run, adjustments);
    }
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

  addFooters();

  const filename = `Appraisal_${appraisal.appraisal_number || 'Report'}_${acTitle.replace(/[\s,]+/g, '_')}.pdf`;
  doc.save(filename);
}