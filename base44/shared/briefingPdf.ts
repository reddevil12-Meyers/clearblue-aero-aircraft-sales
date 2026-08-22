import { jsPDF } from 'npm:jspdf@4.0.0';

const stripInline = (s) =>
  s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();

const mdToLines = (md) => {
  if (!md) return [];
  const out = [];
  for (let line of String(md).split(/\r?\n/)) {
    if (!line.trim()) {
      out.push({ type: "gap" });
      continue;
    }
    if (/^\s*\|/.test(line)) {
      if (/^\s*\|?[\s:-]+\|[\s:|-]+\s*$/.test(line)) continue;
      const cells = line.split("|").map(c => c.trim()).filter((_, i, a) => !(i === 0 && a[0] === "") && !(i === a.length - 1 && a[a.length - 1] === ""));
      out.push({ type: "text", text: cells.join("   |   ") });
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      out.push({ type: "heading", text: stripInline(h[2]) });
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      out.push({ type: "bullet", text: stripInline(line.replace(/^\s*[-*+]\s+/, "")) });
      continue;
    }
    const n = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (n) {
      out.push({ type: "bullet", text: `${n[1]}. ${stripInline(n[2])}` });
      continue;
    }
    out.push({ type: "text", text: stripInline(line) });
  }
  return out;
};

export const sanitizeFilename = (make, model) => {
  const raw = `${(make || "").trim()} ${(model || "").trim()}`
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return raw ? `${raw}.pdf` : "Aircraft Briefing.pdf";
};

// Model-generic briefing (no year, serial, times, registration — generic model line only)
export const generateBriefingText = async (base44, make, model) => {
  const prompt = `You are an Aircraft Knowledge Assistant for ClearBlue Aero, an aircraft brokerage. Write a sales briefing about the ${make} ${model} aircraft — the model line in general, NOT any specific serial number or individual aircraft.

IMPORTANT: Do NOT include any aircraft-specific data such as year of manufacture, serial number, total time, engine hours, registration, or paint/interior condition. This is a generic model-level briefing.

Use exactly this format:

## Quick Overview
(A 2-3 sentence overview of the ${make} ${model} line.)

## Key Specs
(Format as a bullet list, one spec per line, each line as '**Spec:** value' — e.g. '**Engine:** Lycoming O-360, 180 hp'. Keep specs concise and practical. Order from most important to least.)

## Strengths & Typical Buyers
(Who this aircraft suits and why.)

## Common Issues / Things to Watch
(Recurring ADs, known quirks, things to disclose honestly.)

## Sales Talking Points & Good Questions
(Talking points and good questions to ask the prospect.)

Rules:
- Be honest about uncertainty. If you are not highly confident about a specific AD, service bulletin, or exact performance number, say so and recommend verifying with official sources (FAA TCDS, manufacturer data, logbooks).
- Never invent airworthiness information or guarantee values.
- Keep it professional and ready to use on a client call.`;

  const res = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: "gemini_3_flash"
  });
  return typeof res === "string" ? res : (res?.text || JSON.stringify(res));
};

// Branded briefing PDF for a make+model. Returns a jsPDF doc.
export const renderBriefingDoc = (make, model, content) => {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;

  const subject = `${(make || "").trim()} ${(model || "").trim()}`.trim() || "Aircraft Briefing";

  doc.setFillColor(0, 68, 127);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ClearBlue Aero", margin, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Aircraft Briefing — ${subject}`, margin, 50);
  doc.setFontSize(9);
  const dateStr = new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
  doc.text(`Generated ${dateStr}`, pageW - margin, 50, { align: "right" });
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
    const fontStyle = opts.style || "normal";
    const color = opts.color || [30, 30, 30];
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentW - indent);
    for (const ln of lines) {
      ensureSpace(fontSize + 4);
      doc.text(ln, margin + indent, y);
      y += fontSize + 4;
    }
  };

  const blocks = mdToLines(content);
  for (const b of blocks) {
    if (b.type === "gap") {
      y += 4;
      continue;
    }
    if (b.type === "heading") {
      y += 4;
      writeWrapped(b.text.toUpperCase(), { style: "bold", size: 11, color: [15, 23, 42] });
      y += 2;
      continue;
    }
    if (b.type === "bullet") {
      ensureSpace(14);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 68, 127);
      doc.text("•", margin, y);
      writeWrapped(b.text, { size: 10, indent: 14 });
      continue;
    }
    writeWrapped(b.text, { size: 10 });
  }

  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    const footer = "This briefing is AI-generated and may be uncertain on exact ADs, service bulletins, or market values. Always verify airworthiness and numbers against FAA TCDS, manufacturer data, and logbooks.";
    const footerLines = doc.splitTextToSize(footer, contentW);
    let fy = pageH - 28;
    for (const ln of footerLines) {
      doc.text(ln, margin, fy);
      fy += 11;
    }
    doc.text(`Page ${p} of ${pages}`, pageW - margin, pageH - 16, { align: "right" });
  }

  return doc;
};