import { jsPDF } from 'jspdf';

const fmt = (v) => (v != null && v !== '') ? String(v) : '—';
const fmtMoney = (v) => v ? `$${Number(v).toLocaleString()}` : '—';
const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

function section(doc, y, title) {
  doc.setFillColor(30, 50, 100);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 18, y + 5);
  doc.setTextColor(30, 30, 30);
  return y + 12;
}

function row(doc, y, label, value, x2 = 110, pageHeight = 280) {
  if (y > pageHeight) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(label, 16, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  const lines = doc.splitTextToSize(fmt(value), 80);
  doc.text(lines, x2, y);
  return y + Math.max(lines.length * 4.5, 6);
}

function twoCol(doc, y, pairs) {
  const startY = y;
  let leftY = y;
  let rightY = y;
  pairs.forEach(([label, value], i) => {
    const isLeft = i % 2 === 0;
    const xLabel = isLeft ? 16 : 107;
    const xValue = isLeft ? 60 : 150;
    const curY = isLeft ? leftY : rightY;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(label, xLabel, curY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(fmt(value), xValue, curY);
    if (isLeft) leftY += 6;
    else rightY += 6;
  });
  return Math.max(leftY, rightY) + 2;
}

function textBlock(doc, y, label, value, pageHeight = 280) {
  if (!value) return y;
  if (y > pageHeight) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(label, 16, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  const lines = doc.splitTextToSize(value, 178);
  lines.forEach(line => {
    if (y > pageHeight) { doc.addPage(); y = 20; }
    doc.text(line, 16, y);
    y += 4.5;
  });
  return y + 3;
}

export function generateAppraisalPDF(appraisal, aircraft, client) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 280;

  // Header Banner
  doc.setFillColor(20, 40, 90);
  doc.rect(0, 0, pageW, 35, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 215, 80);
  doc.text('AIRCRAFT APPRAISAL REPORT', 14, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 215, 255);
  doc.text(`Appraisal No: ${fmt(appraisal.appraisal_number)}`, 14, 24);
  doc.text(`Prepared: ${fmtDate(new Date().toISOString())}`, 14, 30);

  // Confidential ribbon
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 35, pageW, 8, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text('CONFIDENTIAL — For authorized use only. Not to be distributed without written consent.', 14, 40);

  let y = 52;

  // Aircraft Summary
  y = section(doc, y, 'AIRCRAFT IDENTIFICATION');
  if (aircraft) {
    y = twoCol(doc, y, [
      ['Year of Manufacture', aircraft.year],
      ['Make', aircraft.make],
      ['Model', aircraft.model],
      ['Registration', aircraft.registration],
      ['Serial Number', aircraft.serial_number],
      ['Engine Type', aircraft.engine_type],
      ['Total Time (hrs)', aircraft.total_time],
      ['Engine Time SMOH (hrs)', aircraft.engine_time_smoh],
      ['Propeller Time (hrs)', aircraft.propeller_time],
      ['Number of Engines', aircraft.num_engines],
      ['Avionics Suite', aircraft.avionics_suite],
      ['ADS-B Compliant', aircraft.adsb_compliant ? 'Yes' : 'No'],
      ['Interior Condition', aircraft.interior_condition],
      ['Exterior Condition', aircraft.exterior_condition],
      ['Paint Year', aircraft.paint_year],
      ['Interior Year', aircraft.interior_year],
      ['Damage History', aircraft.damage_history],
      ['Location', aircraft.location],
    ]);
    if (aircraft.avionics_details) y = textBlock(doc, y, 'Avionics Details', aircraft.avionics_details, pageH);
    if (aircraft.damage_history !== 'None' && aircraft.damage_details) y = textBlock(doc, y, 'Damage Details', aircraft.damage_details, pageH);
  } else {
    y = row(doc, y, 'Aircraft', appraisal.aircraft_summary);
  }

  y += 4;
  // Appraisal Info
  y = section(doc, y, 'APPRAISAL INFORMATION');
  y = twoCol(doc, y, [
    ['Appraisal Type', appraisal.appraisal_type],
    ['Purpose', appraisal.purpose],
    ['Methodology', appraisal.methodology],
    ['Status', appraisal.status],
    ['Appraisal Date', fmtDate(appraisal.appraisal_date)],
    ['Effective Date of Value', fmtDate(appraisal.effective_date)],
    ['Logbook Status', appraisal.logbook_status],
    ['Condition Rating', appraisal.condition_rating ? `${appraisal.condition_rating}/10` : '—'],
  ]);

  y += 4;
  if (y > pageH - 40) { doc.addPage(); y = 20; }
  // Valuation
  y = section(doc, y, 'VALUATION SUMMARY');
  doc.setFillColor(240, 245, 255);
  doc.rect(14, y - 2, 182, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 40, 90);
  doc.text('Fair Market Value:', 18, y + 5);
  doc.setFontSize(14);
  doc.setTextColor(20, 130, 60);
  doc.text(fmtMoney(appraisal.market_value), 80, y + 5);
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`Wholesale: ${fmtMoney(appraisal.wholesale_value)}`, 18, y + 13);
  doc.text(`Retail: ${fmtMoney(appraisal.retail_value)}`, 80, y + 13);
  y += 28;

  // Assessments
  if (y > pageH - 30) { doc.addPage(); y = 20; }
  y = section(doc, y, 'DETAILED ASSESSMENT');
  y = textBlock(doc, y, 'Airframe Assessment', appraisal.airframe_assessment, pageH);
  y = textBlock(doc, y, 'Engine Assessment', appraisal.engine_assessment, pageH);
  y = textBlock(doc, y, 'Avionics Assessment', appraisal.avionics_assessment, pageH);
  y = textBlock(doc, y, 'Interior Assessment', appraisal.interior_assessment, pageH);
  y = textBlock(doc, y, 'Exterior Assessment', appraisal.exterior_assessment, pageH);
  y = textBlock(doc, y, 'AD Compliance Notes', appraisal.ad_compliance, pageH);

  // Market Analysis
  if (y > pageH - 30) { doc.addPage(); y = 20; }
  y += 4;
  y = section(doc, y, 'MARKET ANALYSIS');
  y = textBlock(doc, y, 'Comparable Sales Analysis', appraisal.comparable_sales, pageH);
  y = textBlock(doc, y, 'Value Adjustments', appraisal.value_adjustments, pageH);

  // Client / Billing
  if (client || appraisal.fee) {
    if (y > pageH - 30) { doc.addPage(); y = 20; }
    y += 4;
    y = section(doc, y, 'CLIENT & BILLING');
    const billingPairs = [
      ['Client Name', appraisal.client_name],
      ['Appraisal Fee', fmtMoney(appraisal.fee)],
      ['Payment Status', appraisal.payment_status],
    ];
    if (client) {
      billingPairs.push(['Email', client.email], ['Phone', client.phone]);
    }
    y = twoCol(doc, y, billingPairs);
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 287, 196, 287);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, 14, 292);
    doc.text(`Appraisal No: ${fmt(appraisal.appraisal_number)}`, pageW / 2, 292, { align: 'center' });
    doc.text('Confidential', 196, 292, { align: 'right' });
  }

  const filename = `Appraisal_${appraisal.appraisal_number || 'Report'}_${appraisal.aircraft_summary || ''}.pdf`.replace(/\s+/g, '_');
  doc.save(filename);
}