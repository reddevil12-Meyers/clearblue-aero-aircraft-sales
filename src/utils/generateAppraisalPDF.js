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
    const isPng = (blob.type || '').includes('png');
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    // Load into an <img> — the browser applies any EXIF orientation for display,
    // so naturalWidth/Height reflect the visually-correct (oriented) dimensions.
    const dims = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 1, h: 1 });
      img.src = dataUrl;
    });
    if (dims.w <= 1) return { dataUrl, aspectRatio: 1 };
    // Re-draw to a canvas to flatten the orientation into the pixel data.
    // jsPDF ignores EXIF tags, so without this step a photo taken in portrait or
    // upside-down orientation would render rotated/flipped in the PDF.
    const flattened = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = dims.w;
          canvas.height = dims.h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, dims.w, dims.h);
          resolve(isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.92));
        } catch (_) { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
    const out = flattened || dataUrl;
    return { dataUrl: out, aspectRatio: dims.w / dims.h };
  } catch {
    return null;
  }
}

function drawImpairmentSection(run, adjustments) {
  if (!run || !run.base_value) return;

  // Separate positive and negative adjustments (exclude neutral/zero)
  const positiveAdjs = (adjustments || []).filter(a => a.direction === 'Positive' && Math.abs(Number(a.amount)) > 0);
  const negativeAdjs = (adjustments || []).filter(a => a.direction === 'Negative' && Math.abs(Number(a.amount)) > 0);

  if (negativeAdjs.length === 0) {
    paragraph('No negative adjustments were identified for this aircraft. The adjusted value reflects positive factors only and no impairment discount has been applied.');
    return;
  }

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
    .map(c => {
      const detailLines = [
        [
          c.total_time ? `TT: ${Number(c.total_time).toLocaleString()} hrs` : null,
          c.engine_time_smoh ? `SMOH: ${Number(c.engine_time_smoh).toLocaleString()} hrs` : null,
        ].filter(Boolean).join('   '),
        [
          c.avionics_suite ? `Avionics: ${c.avionics_suite}` : null,
        ].filter(Boolean).join('   '),
        [
          c.interior_condition ? `Int: ${c.interior_condition}` : null,
          c.exterior_condition ? `Ext: ${c.exterior_condition}` : null,
        ].filter(Boolean).join('   '),
        [
          c.location ? c.location : null,
          c.source ? `Source: ${c.source}` : null,
        ].filter(Boolean).join('   '),
      ].filter(s => s.length > 0);
      return {
        label: `${c.year || ''} ${c.make || ''} ${c.model || ''}`.trim().slice(0, 30),
        detailLines,
        value: c.sold_price || c.asking_price || 0,
        sold: !!c.sold_price,
        subject: false,
      };
    })
    .filter(b => b.value > 0)
    .slice(0, 10);

  if (subjectValue) {
    bars.push({ label: 'Subject (Appraised Value)', detailLines: [], value: subjectValue, subject: true, sold: false });
  }

  if (bars.length === 0) return;

  const maxVal = Math.max(...bars.map(b => b.value));
  const barH = 7;
  const detailLineH = 3.8;
  const gap = 4;
  const labelW = 80;
  const barAreaW = contentW - labelW - 20;

  // Pre-compute row heights based on number of detail lines
  const rowHeights = bars.map(b => barH + b.detailLines.length * detailLineH + gap);
  const totalH = rowHeights.reduce((a, b) => a + b, 0) + 14;

  checkPage(totalH + 10);

  let currentY = y;
  bars.forEach((bar, i) => {
    const rowH = rowHeights[i];
    const barW = (bar.value / maxVal) * barAreaW;
    const barX = margin + labelW;

    // Main label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...(bar.subject ? NAVY : BLACK));
    doc.text(bar.label, margin, currentY + barH - 2, { maxWidth: labelW - 3 });

    // Detail lines below label
    bar.detailLines.forEach((line, li) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...GRAY);
      doc.text(line, margin, currentY + barH + (li + 1) * detailLineH - 0.5, { maxWidth: labelW - 3 });
    });

    // Bar
    if (bar.subject) {
      doc.setFillColor(255, 200, 40);
    } else if (bar.sold) {
      doc.setFillColor(60, 140, 80);
    } else {
      doc.setFillColor(26, 54, 103);
    }
    doc.roundedRect(barX, currentY, Math.max(barW, 2), barH, 1, 1, 'F');

    // Value label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text(fmtMoney(bar.value), barX + barW + 2, currentY + barH - 2);

    // Separator line
    if (i < bars.length - 1) {
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.15);
      doc.line(margin, currentY + rowH - 1, margin + contentW, currentY + rowH - 1);
    }

    currentY += rowH;
  });

  y = currentY + 4;

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
  const logoResult = await loadImageAsBase64('https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/5929755dc_CB-Logo-320x79-white.png');

  // Load first aircraft image if available
  const aircraftImageResult = (aircraft?.images?.[0]) ? await loadImageAsBase64(aircraft.images[0]) : null;

  doc = new jsPDF({ unit: 'mm', format: 'a4' });
  pageW = 210;
  pageH = 297;
  margin = 18;
  contentW = pageW - margin * 2;
  y = margin;

  const acTitle = aircraft
    ? `${aircraft.year} ${aircraft.make} ${aircraft.model}, ${aircraft.registration}`
    : (appraisal.aircraft_summary || 'Subject Aircraft');

  const isMulti = !!(aircraft && (aircraft.num_engines === 'Multi-Engine' || Number(aircraft.num_engines) >= 2 || aircraft.engine2_manufacturer || aircraft.engine2_model || aircraft.engine2_time_smoh != null || aircraft.propeller2_manufacturer || aircraft.propeller2_model || aircraft.propeller2_time != null));

  const GOLD = [201, 168, 76];

  // ── COVER PAGE — styled like the sales sheet ─────────────────────────────

  // Blue header bar
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 40, 'F');

  // Gold accent stripe
  doc.setFillColor(...GOLD);
  doc.rect(0, 40, pageW, 3, 'F');

  // Logo on left in header — preserve aspect ratio within a fixed height of 18mm
  if (logoResult) {
    const logoH = 18;
    const logoW = logoH * logoResult.aspectRatio;
    doc.addImage(logoResult.dataUrl, 'PNG', margin, 8, logoW, logoH);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...GOLD);
    doc.text('ClearBlue', margin, 22);
    doc.setTextColor(255, 255, 255);
    doc.text('Aero', margin + 32, 22);
  }

  // Right side contact in header
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('386 227-6840', pageW - margin, 11, { align: 'right' });
  doc.text('sales@flyclearblue.com', pageW - margin, 17, { align: 'right' });
  doc.text('www.flyclearblue.com', pageW - margin, 23, { align: 'right' });

  // "AIRCRAFT APPRAISAL REPORT" label — centered in the full header width
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.setCharSpace(2);
  doc.text('AIRCRAFT APPRAISAL REPORT', pageW * 0.35, 34, { align: 'center' });
  doc.setCharSpace(0);

  // Aircraft title
  y = 58;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...NAVY);
  doc.text(acTitle, pageW / 2, y, { align: 'center' });

  // Thin separator
  y += 5;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageW - margin, y);

  // Aircraft image on cover (if available) — preserve aspect ratio, max height 60mm
  if (aircraftImageResult) {
    y += 6;
    const maxImgW = contentW * 0.75;
    const maxImgH = 60;
    let imgW = maxImgW;
    let imgH = imgW / aircraftImageResult.aspectRatio;
    if (imgH > maxImgH) { imgH = maxImgH; imgW = imgH * aircraftImageResult.aspectRatio; }
    doc.addImage(aircraftImageResult.dataUrl, 'JPEG', (pageW - imgW) / 2, y, imgW, imgH);
    y += imgH + 8;
  } else {
    y += 10;
  }

  // Meta info box
  doc.setFillColor(245, 247, 252);
  doc.roundedRect(margin, y, contentW, 52, 2, 2, 'F');

  const col1X = margin + 8;
  const col2X = pageW / 2 + 4;
  let rowY = y + 10;
  const rowStep = 8;

  const metaLeft = [
    client ? ['Prepared For', `${client.first_name} ${client.last_name}${client.company ? ', ' + client.company : ''}`] : null,
    appraisal.appraisal_number ? ['Appraisal No', appraisal.appraisal_number] : null,
    appraisal.appraisal_type ? ['Type', appraisal.appraisal_type] : null,
  ].filter(Boolean);

  const metaRight = [
    appraisal.appraisal_date ? ['Appraisal Date', fmtDate(appraisal.appraisal_date)] : null,
    appraisal.effective_date ? ['Effective Date', fmtDate(appraisal.effective_date)] : null,
    appraisal.purpose ? ['Purpose', appraisal.purpose] : null,
  ].filter(Boolean);

  const maxRows = Math.max(metaLeft.length, metaRight.length);
  for (let i = 0; i < maxRows; i++) {
    if (metaLeft[i]) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...GRAY);
      doc.text(metaLeft[i][0].toUpperCase(), col1X, rowY);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...BLACK);
      doc.text(fmt(metaLeft[i][1]), col1X, rowY + 3.5);
    }
    if (metaRight[i]) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...GRAY);
      doc.text(metaRight[i][0].toUpperCase(), col2X, rowY);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...BLACK);
      doc.text(fmt(metaRight[i][1]), col2X, rowY + 3.5);
    }
    rowY += rowStep;
  }

  y += 58;

  // Intro paragraph
  y += 4;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  const intro = `This appraisal has been prepared to provide a clear, supportable opinion of value for the subject aircraft. The analysis reflects current market behavior, with specific attention given to equipment, condition, and documented history. The intent is to present not only a value conclusion, but also the reasoning and methodology behind that conclusion in a manner that can be relied upon in real transaction scenarios.`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...BLACK);
  const introLines = doc.splitTextToSize(intro, contentW);
  introLines.forEach(line => { doc.text(line, margin, y); y += 5.5; });

  // ── PAGE 2 — AIRCRAFT DETAILS (mirrors sales sheet layout) ───────────────
  doc.addPage();
  y = 0;

  // Blue header — taller to fit title
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 30, 'F');

  // Logo — preserve aspect ratio within a fixed height of 14mm
  if (logoResult) {
    const logoH2 = 14;
    const logoW2 = logoH2 * logoResult.aspectRatio;
    doc.addImage(logoResult.dataUrl, 'PNG', margin, 5, logoW2, logoH2);
  }

  // "Aircraft Details" label + acTitle on right, vertically centered
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  const adText = 'AIRCRAFT DETAILS';
  doc.setCharSpace(1.5);
  // jsPDF's align:'right' ignores charSpace, so offset x left by the extra spacing to keep it within the margin.
  doc.text(adText, pageW - margin - 1.5 * adText.length, 12, { align: 'right' });
  doc.setCharSpace(0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const acTitleLines = doc.splitTextToSize(acTitle, contentW * 0.55);
  acTitleLines.forEach((line, i) => {
    doc.text(line, pageW - margin, 20 + i * 5.5, { align: 'right' });
  });

  // Gold accent stripe
  doc.setFillColor(...GOLD);
  doc.rect(0, 30, pageW, 2.5, 'F');

  y = 38;

  // Aircraft image + key specs side by side — preserve aspect ratio, max height 52mm
  const maxDetailImgW = contentW * 0.50;
  const maxDetailImgH = 52;
  let detailImgW = 0;
  const detailImgH = maxDetailImgH;

  if (aircraftImageResult) {
    detailImgW = Math.min(maxDetailImgW, maxDetailImgH * aircraftImageResult.aspectRatio);
    const actualH = detailImgW / aircraftImageResult.aspectRatio;
    doc.addImage(aircraftImageResult.dataUrl, 'JPEG', margin, y, detailImgW, actualH);
  }

  // Key specs box to the right of image
  const specsX = margin + (aircraftImageResult ? detailImgW + 5 : 0);
  const specsW = contentW - (aircraftImageResult ? detailImgW + 5 : 0);

  doc.setFillColor(245, 247, 252);
  doc.roundedRect(specsX, y, specsW, detailImgH, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...NAVY);
  doc.setCharSpace(1);
  doc.text('KEY SPECIFICATIONS', specsX + 4, y + 7);
  doc.setCharSpace(0);

  const keySpecs = [
    ['Total Time', aircraft?.total_time ? `${aircraft.total_time.toLocaleString()} hrs` : null],
    ['Engine', aircraft ? [aircraft.engine_manufacturer, aircraft.engine_model].filter(Boolean).join(' ') || aircraft.engine_type : null],
    ['Engine Type', aircraft?.engine_type || null],
    ['Engine 1 Time', aircraft?.engine_time_smoh ? `${aircraft.engine_time_smoh.toLocaleString()} hrs ${aircraft?.engine_time_type || 'SMOH'}` : null],
    ['Engine 2 Time', isMulti ? (aircraft?.engine2_time_smoh ? `${aircraft.engine2_time_smoh.toLocaleString()} hrs ${aircraft.engine2_time_type || 'SMOH'}` : 'Not recorded') : null],
    ['Avionics', aircraft?.avionics_suite || aircraft?.avionics_details || null],
    ['Interior', aircraft?.interior_condition || null],
    ['Exterior', aircraft?.exterior_condition || null],
    ['ADS-B', aircraft?.adsb_compliant === true ? 'Compliant' : aircraft?.adsb_compliant === false ? 'Not Compliant' : null],
  ].filter(([, v]) => v);

  let ky = y + 13;
  keySpecs.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...GRAY);
    doc.text(label, specsX + 4, ky);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...BLACK);
    doc.text(String(value), specsX + specsW - 4, ky, { align: 'right', maxWidth: specsW * 0.55 });
    ky += 6;
  });

  y += detailImgH + 6;

  // Price / status bar
  doc.setFillColor(...NAVY);
  doc.rect(margin, y, contentW, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  if (aircraft?.asking_price) {
    doc.text(`Asking Price: $${aircraft.asking_price.toLocaleString()}`, margin + 6, y + 8);
  }
  if (aircraft?.status) {
    doc.setTextColor(255, 255, 255);
    doc.text(`Status: ${aircraft.status}`, pageW - margin - 6, y + 8, { align: 'right' });
  }
  y += 18;

  // Full specs two-column table
  if (aircraft) {
    const fullSpecPairs = [
      ['Year of Manufacture', aircraft.year],
      ['Make', aircraft.make],
      ['Model', aircraft.model],
      ['Registration (N-Number)', aircraft.registration],
      ['Serial Number', aircraft.serial_number],
      ['Location', aircraft.location],
      ['Airframe Total Time', aircraft.total_time ? `${aircraft.total_time.toLocaleString()} hrs` : null],
      ['Engine Type', aircraft.engine_type],
      ['Engine Manufacturer', aircraft.engine_manufacturer],
      ['Engine Model', aircraft.engine_model],
      [`Engine 1 Time (${aircraft.engine_time_type || 'SMOH'})`, aircraft.engine_time_smoh ? `${aircraft.engine_time_smoh.toLocaleString()} hrs` : null],
      [`Engine 2 Time (${aircraft.engine2_time_type || 'SMOH'})`, isMulti ? (aircraft.engine2_time_smoh ? `${aircraft.engine2_time_smoh.toLocaleString()} hrs` : 'Not recorded') : null],
      ['Propeller Manufacturer', aircraft.propeller_manufacturer],
      ['Propeller Model', aircraft.propeller_model],
      ['Propeller 1 Time', aircraft.propeller_time ? `${aircraft.propeller_time.toLocaleString()} hrs` : null],
      ['Propeller 2 Time', isMulti ? (aircraft.propeller2_time ? `${aircraft.propeller2_time.toLocaleString()} hrs` : 'Not recorded') : null],
      ['ADS-B Compliant', aircraft.adsb_compliant === true ? 'Yes' : aircraft.adsb_compliant === false ? 'No' : null],
      ['Interior Condition', aircraft.interior_condition],
      ['Exterior Condition', aircraft.exterior_condition],
      ['Paint Year', aircraft.paint_year],
      ['Interior Year', aircraft.interior_year],
      ['Useful Load', aircraft.useful_load ? `${aircraft.useful_load.toLocaleString()} lbs` : null],
      ['Fuel Capacity', aircraft.fuel_capacity ? `${aircraft.fuel_capacity} gal` : null],
      ['Damage History', aircraft.damage_history && aircraft.damage_history !== 'None' ? aircraft.damage_history : null],
    ].filter(([, v]) => v != null && v !== '');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...NAVY);
    doc.setCharSpace(1);
    doc.text('FULL SPECIFICATIONS', margin, y);
    doc.setCharSpace(0);
    y += 3;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 5;

    const half2 = Math.ceil(fullSpecPairs.length / 2);
    const leftCol = fullSpecPairs.slice(0, half2);
    const rightCol = fullSpecPairs.slice(half2);
    const colW2 = contentW / 2 - 4;
    const maxRows2 = Math.max(leftCol.length, rightCol.length);

    for (let i = 0; i < maxRows2; i++) {
      checkPage(6);
      if (i % 2 === 0) {
        doc.setFillColor(245, 247, 252);
        doc.rect(margin, y - 3.5, contentW / 2 - 2, 6, 'F');
        doc.rect(pageW / 2 + 2, y - 3.5, contentW / 2 - 2, 6, 'F');
      }
      if (leftCol[i]) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...GRAY);
        doc.text(leftCol[i][0], margin + 2, y);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...BLACK);
        doc.text(String(leftCol[i][1]), margin + colW2, y, { align: 'right' });
      }
      if (rightCol[i]) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...GRAY);
        doc.text(rightCol[i][0], pageW / 2 + 4, y);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...BLACK);
        doc.text(String(rightCol[i][1]), pageW - margin - 2, y, { align: 'right' });
      }
      y += 6.2;
    }
    y += 4;

    // Avionics & Equipment
    const instruments = aircraft.instruments || [];
    if (aircraft.avionics_suite || aircraft.avionics_details || instruments.length > 0) {
      checkPage(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...NAVY);
      doc.setCharSpace(1);
      doc.text('AVIONICS & EQUIPMENT', margin, y);
      doc.setCharSpace(0);
      y += 3;
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageW - margin, y);
      y += 5;

      // Avionics suite + details
      const avionicsText = [aircraft.avionics_suite, aircraft.avionics_details].filter(Boolean).join(' — ');
      if (avionicsText) {
        const aLines = doc.splitTextToSize(avionicsText, contentW);
        aLines.forEach(line => { doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...BLACK); doc.text(line, margin, y); y += 5; });
        if (instruments.length > 0) y += 2;
      }

      // Individual instruments
      if (instruments.length > 0) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...GRAY);
        doc.text('INSTALLED INSTRUMENTS', margin, y);
        y += 4.5;
        instruments.forEach(inst => {
          checkPage(6);
          const desc = [
            inst.name,
            [inst.make, inst.model].filter(Boolean).join(' '),
            inst.serial_number ? `S/N ${inst.serial_number}` : null,
            inst.condition ? `(${inst.condition})` : null,
          ].filter(Boolean).join(' — ');
          const iLines = doc.splitTextToSize(desc || 'Instrument', contentW);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...BLACK);
          iLines.forEach(line => { doc.text(line, margin, y); y += 5; });
        });
      }
      y += 3;
    }

    // Factory Air Conditioning
    if (aircraft.factory_air_conditioning === true) {
      checkPage(8);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...GRAY);
      doc.text('Factory Air Conditioning:', margin, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...BLACK);
      doc.text('Yes', margin + 52, y);
      y += 6;
    }


  }

  // ── PAGE 3+ — REPORT BODY ─────────────────────────────────────────────────
  doc.addPage();
  y = margin;

  let sn = 1;

  // 1. Purpose and Scope
  sectionHeading(sn++, 'Purpose and Scope');
  paragraph(appraisal.purpose_scope || `This report provides a market-based opinion of value for use in ${appraisal.purpose || 'buyer and seller decision-making'}, brokerage positioning, negotiation support, and financing or advisory discussions. The analysis is intended to explain not only the final value conclusion, but also how the market interprets the aircraft's configuration, condition, and history.`);

  // 2. Appraiser Market Analysis
  if (appraisal.market_position) {
    sectionHeading(sn++, 'Appraiser Market Analysis');
    paragraph(appraisal.market_position);
  }

  // 3. Subject Aircraft Summary
  sectionHeading(sn++, 'Subject Aircraft Summary');
  if (aircraft) {
    const summary = [
      aircraft.total_time ? `Airframe: ${aircraft.total_time} hours total time.` : null,
      aircraft.engine_time_smoh ? `Engine: ${aircraft.engine_time_smoh} hours ${aircraft.engine_time_type || 'SMOH'}.` : null,
      isMulti ? `Engine 2: ${[aircraft.engine2_manufacturer, aircraft.engine2_model].filter(Boolean).join(' ') || 'Not recorded'}${aircraft.engine2_time_smoh ? `, ${aircraft.engine2_time_smoh} hours ${aircraft.engine2_time_type || 'SMOH'}` : ', time not recorded'}.` : null,
      isMulti && aircraft.propeller2_time != null ? `Propeller 2: ${aircraft.propeller2_time} hours.` : null,
      aircraft.propeller_time ? `Propeller: ${aircraft.propeller_time} hours.` : null,
      (aircraft.avionics_suite || aircraft.avionics_details) ? `Avionics: ${[aircraft.avionics_suite, aircraft.avionics_details].filter(Boolean).join(' — ')}.` : null,
      aircraft.interior_condition ? `Interior: ${aircraft.interior_condition}.` : null,
      aircraft.exterior_condition ? `Exterior: ${aircraft.exterior_condition}.` : null,
      aircraft.damage_history && aircraft.damage_history !== 'None' ? `Damage History: ${aircraft.damage_history}${aircraft.damage_details ? ' — ' + aircraft.damage_details : ''}.` : null,
    ].filter(Boolean).join(' ');
    paragraph(summary);
  }
  if (appraisal.aircraft_summary) paragraph(appraisal.aircraft_summary);

  // Component narrative sections
  if (appraisal.airframe_assessment) { sectionHeading(sn++, 'Airframe'); paragraph(appraisal.airframe_assessment); }

  // Engine section — always render if we have engine data
  {
    sectionHeading(sn++, 'Engine');
    if (aircraft) {
      // Engine manufacturer/model/type — shown once (same make & model for both engines)
      const engineCommonPairs = [
        ['Engine Type', aircraft.engine_type],
        ['Number of Engines', aircraft.num_engines],
        ['Engine Manufacturer', aircraft.engine_manufacturer],
        ['Engine Model', aircraft.engine_model],
      ].filter(([, v]) => v != null && v !== '');
      if (engineCommonPairs.length > 0) kvGrid(engineCommonPairs, 2);

      // Per-engine times
      const engineTimePairs = [
        [`Engine 1 Time ${aircraft.engine_time_type || 'SMOH'} (hrs)`, aircraft.engine_time_smoh],
      ].filter(([, v]) => v != null && v !== '');
      if (isMulti) {
        engineTimePairs.push([`Engine 2 Time ${aircraft.engine2_time_type || 'SMOH'} (hrs)`, aircraft.engine2_time_smoh != null ? aircraft.engine2_time_smoh : 'Not recorded']);
      }
      if (engineTimePairs.length > 0) kvGrid(engineTimePairs, 2);

      // Propeller manufacturer/model — shown once, then per-propeller times
      const propCommonPairs = [
        ['Propeller Manufacturer', aircraft.propeller_manufacturer],
        ['Propeller Model', aircraft.propeller_model],
      ].filter(([, v]) => v != null && v !== '');
      if (propCommonPairs.length > 0) { fieldLabel('Propeller'); kvGrid(propCommonPairs, 2); }

      const propTimePairs = [
        ['Propeller 1 Time (hrs)', aircraft.propeller_time],
      ].filter(([, v]) => v != null && v !== '');
      if (isMulti) {
        propTimePairs.push(['Propeller 2 Time (hrs)', aircraft.propeller2_time != null ? aircraft.propeller2_time : 'Not recorded']);
      }
      if (propTimePairs.length > 0) kvGrid(propTimePairs, 2);
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

  // Use the authoritative adjusted_value stored on the run (computed by the valuation engine,
  // which correctly accounts for Neutral items like engine/propeller placeholder adjustments).
  // Only fall back to recomputing if no run exists.
  const livePosAdjs = (adjustments || []).filter(a => a.direction === 'Positive' && Math.abs(Number(a.amount)) > 0);
  const liveNegAdjs = (adjustments || []).filter(a => a.direction === 'Negative' && Math.abs(Number(a.amount)) > 0);
  const liveAdjustedValue = run ? Math.round(run.adjusted_value || 0) : 0;
  const rangePct = run?.appraisal_mode === 'Full Appraisal' ? 0.03 : run?.appraisal_mode === 'Extended Desktop' ? 0.04 : 0.06;
  const liveValueLow = Math.round(liveAdjustedValue * (1 - rangePct) / 100) * 100;
  const liveValueHigh = Math.round(liveAdjustedValue * (1 + rangePct) / 100) * 100;
  const liveWholesale = Math.round(liveAdjustedValue * 0.88 / 100) * 100;
  const liveRetail = Math.round(liveAdjustedValue * 1.06 / 100) * 100;

  // Baseline Market Value
  if (run) {
    sectionHeading(sn++, 'Baseline Market Value');
    paragraph(`Using the sales comparison approach across ${run.comp_count || 0} comparable aircraft, the baseline market value for a ${aircraft ? aircraft.year + ' ' + aircraft.make + ' ' + aircraft.model : 'subject aircraft'} in average condition is established at ${fmtMoney(run.base_value)}. This assumes average cosmetics, no major negative history, and standard equipment for the fleet.`);
    if (appraisal.comparable_sales) paragraph(appraisal.comparable_sales);

    // Comps detail table + bar chart
    if (comps && comps.length > 0) {
      sectionHeading(sn++, 'Comparable Sales — Price Comparison');
      paragraph('The following chart compares the appraised value of the subject aircraft against comparable listings and sales used in this analysis.');
      drawCompsBarChart(comps, liveAdjustedValue);

      // Comps detail table
      sectionHeading(sn++, 'Comparable Aircraft — Detail');
      comps.forEach((c, idx) => {
        checkPage(40);
        // Aircraft title row
        doc.setFillColor(...NAVY);
        doc.rect(margin, y, contentW, 9, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...WHITE);
        const compTitle = `${c.year || ''} ${c.make || ''} ${c.model || ''}${c.registration ? ' (' + c.registration + ')' : ''}`.trim();
        doc.text(compTitle, margin + 4, y + 6);
        const priceLabel = c.sold_price ? `Sold: ${fmtMoney(c.sold_price)}` : c.asking_price ? `Asking: ${fmtMoney(c.asking_price)}` : '';
        if (priceLabel) doc.text(priceLabel, margin + contentW - 4, y + 6, { align: 'right' });
        y += 12;

        // Detail fields in a 3-column grid
        const compFields = [
          c.total_time ? ['Total Time', `${Number(c.total_time).toLocaleString()} hrs`] : null,
          c.engine_time_smoh ? ['Engine SMOH', `${Number(c.engine_time_smoh).toLocaleString()} hrs`] : null,
          c.avionics_suite ? ['Avionics', c.avionics_suite] : null,
          c.interior_condition ? ['Interior', c.interior_condition] : null,
          c.exterior_condition ? ['Exterior', c.exterior_condition] : null,
          c.location ? ['Location', c.location] : null,
          c.source ? ['Source', c.source] : null,
          c.status ? ['Status', c.status] : null,
          c.days_on_market ? ['Days on Market', String(c.days_on_market)] : null,
          c.similarity_score ? ['Similarity', `${c.similarity_score}/10`] : null,
        ].filter(Boolean);

        if (compFields.length > 0) {
          const cols = 3;
          const colW = contentW / cols;
          for (let i = 0; i < compFields.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            if (col === 0) checkPage(10);
            const fx = margin + col * colW;
            const fy = y + row * 10;
            doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...GRAY);
            doc.text(compFields[i][0], fx + 2, fy);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...BLACK);
            doc.text(fmt(compFields[i][1]), fx + 2, fy + 4);
          }
          const rowCount = Math.ceil(compFields.length / cols);
          y += rowCount * 10 + 2;
        }

        if (c.notes) {
          checkPage(8);
          doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...GRAY);
          const noteLines = doc.splitTextToSize(`Notes: ${c.notes}`, contentW - 4);
          noteLines.forEach(line => { doc.text(line, margin + 2, y); y += 4; });
          y += 2;
        }

        // Separator between comps
        if (idx < comps.length - 1) {
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.2);
          doc.line(margin, y, margin + contentW, y);
          y += 4;
        }
      });
      y += 4;
    }
  }

  // Value Adjustments with table
  if (adjustments && adjustments.length > 0) {
    sectionHeading(sn++, 'Value Adjustments');
    paragraph('The following adjustments reflect contributory market values — not replacement costs. Each item represents how the market interprets the aircraft relative to the baseline comparable set.');

    // Include all non-neutral adjustments in the table; Final Adjusted Value = run.adjusted_value (authoritative)
    const livePosTotal = livePosAdjs.reduce((s, a) => s + Math.abs(Number(a.amount)), 0);
    const adjustedBaseline = (run?.base_value || 0) + livePosTotal;

    const adjRows = [
      ...(run ? [['Baseline Market Value', fmtMoney(run.base_value)]] : []),
      ...livePosAdjs.map(a => [a.category, `+ ${fmtMoney(Math.round(Math.abs(a.amount)))}`]),
      ...(livePosAdjs.length > 0 ? [{ _bold: true, cells: ['Adjusted Baseline', fmtMoney(Math.round(adjustedBaseline))] }] : []),
      ...liveNegAdjs.map(a => [a.category, `- ${fmtMoney(Math.round(Math.abs(a.amount)))}`]),
      { _bold: true, cells: ['Final Adjusted Value', fmtMoney(liveAdjustedValue)] },
    ];
    drawTable(['Component', 'Amount'], adjRows, [contentW * 0.65, contentW * 0.35]);
    if (appraisal.value_adjustments) paragraph(appraisal.value_adjustments);

  }

  // Valuation Calculation (With Impairment) — pass a run with live-computed adjusted_value
  if (run) {
    sectionHeading(sn++, 'Valuation Calculation (With Impairment)');
    paragraph(`Where negative adjustments are identified — such as high engine time, damage history, or market softness — this section illustrates the range of impairment applied to the adjusted baseline. Three discount scenarios are modeled to reflect the spectrum of how buyers may price these factors into an offer. The most probable value represents the appraiser's best judgment of where a willing buyer and willing seller would transact in the current market.`);
    drawImpairmentSection({ ...run, adjusted_value: liveAdjustedValue }, adjustments);
  }

  // Valuation Summary
  sectionHeading(sn++, 'Final Opinion of Value');
  if (run) {
    paragraph(`Fair Market Value Range: ${fmtMoney(liveValueLow)} – ${fmtMoney(liveValueHigh)}. Most Probable Value: ${fmtMoney(liveAdjustedValue)} USD.`);
    valuationBox('Fair Market Value (Most Probable)', fmtMoney(liveAdjustedValue));
    const valRows = [
      ['Wholesale Value', fmtMoney(liveWholesale)],
      ['Fair Market Value', fmtMoney(liveAdjustedValue)],
      ['Retail Value', fmtMoney(liveRetail)],
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



  // ── TERMS AND CONDITIONS PAGE ─────────────────────────────────────────────
  doc.addPage();
  y = 0;

  // Blue header bar
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 30, 'F');
  if (logoResult) {
    const lh = 14; const lw = lh * logoResult.aspectRatio;
    doc.addImage(logoResult.dataUrl, 'PNG', margin, 7, lw, lh);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  const tuText = 'TERMS OF USE & LIMITATIONS';
  doc.setCharSpace(1.5);
  // jsPDF's align:'right' ignores charSpace, so offset x left by the extra spacing to keep it within the margin.
  doc.text(tuText, pageW - margin - 1.5 * tuText.length, 17, { align: 'right' });
  doc.setCharSpace(0);
  doc.setFillColor(...GOLD);
  doc.rect(0, 30, pageW, 2.5, 'F');
  y = 40;

  // Section heading helper (local, no numbering)
  const tcHeading = (title) => {
    checkPage(14);
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(title, margin, y);
    y += 3;
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentW, y);
    y += 5;
  };

  const tcParagraph = (text) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...BLACK);
    const lines = doc.splitTextToSize(text, contentW);
    lines.forEach(line => { checkPage(5); doc.text(line, margin, y); y += 4.8; });
    y += 2;
  };

  const tcBullet = (items) => {
    items.forEach(item => {
      checkPage(6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...BLACK);
      doc.text('\u2022', margin + 2, y);
      const lines = doc.splitTextToSize(item, contentW - 8);
      lines.forEach((line, li) => { doc.text(line, margin + 7, y + li * 4.8); });
      y += lines.length * 4.8 + 1.5;
    });
    y += 2;
  };

  // Appendix title
  checkPage(16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...NAVY);
  doc.text('Appendix', margin, y);
  y += 4;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(margin, y, margin + contentW, y);
  y += 10;

  // 1. About This Report
  tcHeading('1. About This Report');
  tcParagraph('ClearBlue Aero is an aircraft brokerage and appraisal firm based in Florida, serving buyers, sellers, and aviation professionals across the United States. This Report represents the written opinion of a ClearBlue Aero aviation specialist and is based on current market knowledge, hands-on transaction experience, and direct analysis of the subject aircraft as described herein.');
  tcParagraph('This Report is delivered to the named client for the specific purpose noted on the cover page. It reflects market conditions as of the effective date and is not automatically updated as conditions change.');

  // 2. How We Arrive at Value
  tcHeading('2. How We Arrive at Value');
  tcParagraph('Our valuation process is grounded in what the market is actually doing — not formulas or automated estimates. We analyze real listings and recent sales for comparable aircraft, then apply adjustments based on how buyers in today\'s market respond to factors like engine time, avionics, cosmetic condition, and documented history.');
  tcParagraph('We draw on data from active aviation marketplaces, dealer networks, and our own transaction history. Every opinion of value reflects the judgment of an appraiser who works aircraft deals day-to-day — not a third-party algorithm.');

  // 3. Scope of Work
  tcHeading('3. Scope of Work');
  tcParagraph('Unless a physical on-site inspection is specifically noted on the cover page, this analysis was conducted on a desktop basis using information provided by the client, available public records, and market data. We do not independently verify the mechanical condition, airworthiness, or legal status of the aircraft, and our value conclusion assumes the aircraft is as described.');
  tcParagraph('If the actual aircraft condition differs materially from what was represented, the opinion of value expressed here may not apply. ClearBlue Aero is available to revisit the analysis if additional information comes to light.');

  // 4. Important Notice box
  checkPage(28);
  doc.setFillColor(255, 245, 245);
  doc.setDrawColor(180, 40, 40);
  doc.setLineWidth(0.5);
  const uspapBoxY = y;
  doc.roundedRect(margin, y, contentW, 28, 2, 2, 'FD');
  y += 7;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(160, 30, 30);
  doc.text('Please Note: Certified Appraisal Requirement', margin + 5, y);
  y += 6;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(80, 30, 30);
  const uspapText = 'Where a formally credentialed appraisal is required — such as for SBA or bank financing, IRS charitable deduction reporting, estate or probate proceedings, or court matters — this Report does not fulfill that requirement on its own. If you are unsure what standard applies to your situation, contact us and we will help you determine the right approach.';
  const uspapLines = doc.splitTextToSize(uspapText, contentW - 10);
  uspapLines.forEach(line => { doc.text(line, margin + 5, y); y += 4.5; });
  y = uspapBoxY + 32;

  // 5. Timing and Market Conditions
  tcHeading('4. Timing and Market Conditions');
  tcParagraph('Aircraft values move. The opinion expressed here reflects conditions at the time of the effective date, and values can shift meaningfully due to interest rate changes, fuel prices, seasonal demand, new model availability, airworthiness directives, or broader economic movement.');
  tcParagraph('We consider this Report current for approximately 60 days from the effective date. If a transaction is delayed beyond that window, we recommend a brief check-in to confirm the value conclusion still holds.');

  // 6. Our Responsibility
  tcHeading('5. Our Responsibility to You');
  tcParagraph('We take the quality of every report seriously. We stand behind our analysis and are happy to walk through our data, explain our comparable selection, or discuss how we weighted specific factors. That is part of what you are paying for.');
  tcParagraph('At the same time, no appraisal can guarantee what a specific buyer will pay on a specific day. Our job is to give you the clearest, most honest picture of the market so you can negotiate from a position of knowledge. What happens at the negotiating table depends on circumstances no appraiser can fully predict.');
  tcParagraph('ClearBlue Aero\'s financial responsibility in connection with this Report is limited to the fee paid for the appraisal. We are not liable for losses or decisions made based on the value conclusion herein.');

  // 7. Before You Close
  tcHeading('6. Steps We Recommend Before Closing');
  tcParagraph('Regardless of what this Report says, smart buyers and sellers take these steps before completing any aircraft transaction:');
  tcBullet([
    'Have the aircraft inspected by an independent, FAA-certificated mechanic or approved repair station — someone who knows the specific make and model',
    'Go through all logbooks and maintenance records yourself, not just a summary — look for gaps, unsigned entries, or anything unusual',
    'Run a title search through a qualified aviation title or escrow company to identify any recorded liens before money changes hands',
    'Have an aviation attorney review the purchase agreement, especially for transactions above $100,000 or involving unusual terms',
    'Confirm the aircraft is current on all required inspections and in compliance with applicable Airworthiness Directives',
  ]);

  // 8. Confidentiality
  tcHeading('7. Confidentiality');
  tcParagraph('This Report was prepared as part of a confidential client engagement and is not for general distribution. You may share it with your own advisors — attorney, accountant, lender — but it may not be published, reproduced commercially, or handed to third parties who have no involvement in your transaction without our prior written consent.');

  // 9. Receipt
  checkPage(20);
  doc.setFillColor(235, 242, 252);
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentW, 20, 2, 2, 'FD');
  y += 7;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...NAVY);
  doc.text('Receipt and Acknowledgment', margin + 5, y);
  y += 5;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(30, 50, 80);
  const acceptText = 'Receipt or use of this Report constitutes acknowledgment that the client has read and understood these terms. Any use of the contents — in whole or in part — constitutes acceptance of all conditions described on this page.';
  const acceptLines = doc.splitTextToSize(acceptText, contentW - 10);
  acceptLines.forEach(line => { doc.text(line, margin + 5, y); y += 4.5; });
  y += 10;

  // Contact
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...NAVY);
  doc.text('Questions or concerns regarding this Report:', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...BLACK);
  doc.text('ClearBlue Aero  \u00b7  386 227-6840  \u00b7  sales@flyclearblue.com  \u00b7  www.flyclearblue.com', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...GRAY);
  doc.text(`\u00a9 ${new Date().getFullYear()} ClearBlue Aero. All rights reserved.`, margin, y);
  y += 6;

  addFooters();

  const filename = `Appraisal_${appraisal.appraisal_number || 'Report'}_${acTitle.replace(/[\s,]+/g, '_')}.pdf`;
  doc.save(filename);

  // Also open in a new browser tab for review
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}