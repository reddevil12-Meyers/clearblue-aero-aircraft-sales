import { jsPDF } from "jspdf";

const LOGO_URL = "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1c49af472_logo-01.png";

// Light markdown -> structured plain text conversion (headings, bullets, bold)
const mdToLines = (md) => {
  if (!md) return [];
  const out = [];
  const rawLines = String(md).split(/\r?\n/);

  for (let line of rawLines) {
    // Skip empty lines but mark a small gap
    if (!line.trim()) {
      out.push({ type: "gap" });
      continue;
    }
    // Table row — render as-is (pipe-delimited), skip separator rows
    if (/^\s*\|/.test(line)) {
      if (/^\s*\|?[\s:-]+\|[\s:|-]+\s*$/.test(line)) continue;
      const cells = line.split("|").map(c => c.trim()).filter((_, i, a) => !(i === 0 && a[0] === "") && !(i === a.length - 1 && a[a.length - 1] === ""));
      out.push({ type: "text", text: cells.join("   |   ") });
      continue;
    }
    // Headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      out.push({ type: "heading", text: stripInline(h[2]) });
      continue;
    }
    // Bullets
    if (/^\s*[-*+]\s+/.test(line)) {
      out.push({ type: "bullet", text: stripInline(line.replace(/^\s*[-*+]\s+/, "")) });
      continue;
    }
    // Numbered list
    const n = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (n) {
      out.push({ type: "bullet", text: `${n[1]}. ${stripInline(n[2])}` });
      continue;
    }
    out.push({ type: "text", text: stripInline(line) });
  }
  return out;
};

const stripInline = (s) =>
  s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();

export async function generateAssistantPdf(messages, title = "Aircraft Knowledge Assistant — Conversation") {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;

  // Header band
  doc.setFillColor(0, 68, 127);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ClearBlue Aero", margin, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Aircraft Knowledge Assistant — Sales Briefing", margin, 50);
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

  const writeWrapped = (text, indent = 0, opts = {}) => {
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

  const assistantMessages = messages.filter(m => m.role === "assistant" && m.content && m.content.trim());
  if (assistantMessages.length === 0) {
    writeWrapped("No assistant responses to export yet.", { color: [120, 120, 120] });
  }

  assistantMessages.forEach((msg, idx) => {
    // Find the user prompt that preceded this assistant message
    const promptMsg = messages.slice(0, messages.indexOf(msg)).reverse().find(m => m.role === "user");

    if (idx > 0) {
      ensureSpace(24);
      y += 12;
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageW - margin, y);
      y += 16;
    }

    if (promptMsg) {
      writeWrapped("Q: " + promptMsg.content, { style: "bold", color: [0, 68, 127], size: 11 });
      y += 4;
    }

    const blocks = mdToLines(msg.content);
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
        writeWrapped(b.text, 14, { size: 10 });
        continue;
      }
      writeWrapped(b.text, { size: 10 });
    }
  });

  // Footer disclaimer on every page
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

  doc.save(`aircraft-assistant-${new Date().toISOString().slice(0, 10)}.pdf`);
}