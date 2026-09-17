import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { normalizeTailNumber } from "../../shared/opensky.ts";

// Staff tool: import an OpenSky aircraft-metadata CSV subset and upsert
// IcaoLookup rows by registration + icao24. Accepts pasted CSV text or a
// previously uploaded public file URL.
function parseCsv(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const splitLine = (line) =>
    line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));

  const first = splitLine(lines[0]).map((c) => c.toLowerCase());
  let header = null;
  let start = 0;
  if (first.includes("registration") || first.includes("icao24")) {
    header = first;
    start = 1;
  }

  const rows = [];
  for (let i = start; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    if (header) {
      const obj = {};
      header.forEach((h, idx) => {
        obj[h] = cells[idx];
      });
      rows.push(obj);
    } else {
      rows.push({
        registration: cells[0],
        icao24: cells[1],
        typecode: cells[2],
        model: cells[3],
        operator: cells[4],
      });
    }
  }
  return rows;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    let csvText = body && body.csvText;

    if (!csvText && body && body.fileUrl) {
      const fileRes = await fetch(body.fileUrl);
      if (!fileRes.ok) {
        return Response.json({ error: "Could not read the uploaded file" }, { status: 400 });
      }
      csvText = await fileRes.text();
    }
    if (!csvText) {
      return Response.json({ error: "Provide csvText or fileUrl" }, { status: 400 });
    }

    // Lookup upserts run as service role
    const svc = base44.asServiceRole;

    const rows = parseCsv(csvText);
    if (!rows.length) {
      return Response.json({ error: "No data rows found in CSV" }, { status: 400 });
    }

    const existing = await svc.entities.IcaoLookup.list("-updated_date", 5000);
    const byReg = {};
    existing.forEach((r) => {
      byReg[r.registration] = r;
    });

    const now = new Date().toISOString();
    const toCreate = [];
    const toUpdate = [];
    const skipped = [];

    rows.forEach((row) => {
      const reg = normalizeTailNumber(row.registration);
      const hex = String(row.icao24 || "").trim().toLowerCase();
      if (!reg) {
        skipped.push({ registration: row.registration || "", reason: "missing registration" });
        return;
      }
      if (!/^[0-9a-f]{6}$/.test(hex)) {
        skipped.push({ registration: reg, reason: "invalid icao24" });
        return;
      }
      const payload = {
        registration: reg,
        icao24: hex,
        typecode: row.typecode || null,
        model: row.model || null,
        operator: row.operator || null,
        source: row.source || "opensky_csv",
        updated_at: now,
      };
      const rec = byReg[reg];
      if (rec) {
        toUpdate.push({ id: rec.id, ...payload });
      } else {
        toCreate.push(payload);
        byReg[reg] = true;
      }
    });

    if (toCreate.length) {
      await svc.entities.IcaoLookup.bulkCreate(toCreate);
    }
    if (toUpdate.length) {
      await svc.entities.IcaoLookup.bulkUpdate(toUpdate);
    }

    return Response.json({
      ok: true,
      rows: rows.length,
      created: toCreate.length,
      updated: toUpdate.length,
      skipped,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}