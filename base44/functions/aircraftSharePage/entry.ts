import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PUBLIC_ORIGIN = 'https://flyclearblue.com';
const LOGO_URL = 'https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png';

function resolveImageUrl(uri) {
  if (!uri) return uri;
  const match = uri.match(/https:\/\/base44\.app\/api\/apps\/[^/]+\/files\/mp\/public\/([^/]+)\/(.+)/);
  if (match) return `https://media.base44.com/images/public/${match[1]}/${match[2]}`;
  return uri;
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    let id = url.searchParams.get('id');
    if (!id && req.method === 'POST') {
      try { id = (await req.json()).id; } catch (_) {}
    }

    if (!id) {
      return new Response('Missing id', { status: 400, headers: { 'Content-Type': 'text/plain' } });
    }

    const appUrl = `${PUBLIC_ORIGIN}/inventory/${id}`;

    let aircraft = null;
    try {
      aircraft = await base44.asServiceRole.entities.Aircraft.get(id);
    } catch (_) { /* not found */ }

    // Fallback for non-public / not-found aircraft — branded page, still redirects
    if (!aircraft || !aircraft.show_on_public) {
      const title = 'ClearBlue Aero — Aircraft Sales & Appraisals';
      const description = 'Trusted aircraft brokerage, appraisals, and sales.';
      return new Response(buildFallbackHtml(title, description, LOGO_URL, appUrl), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const images = (aircraft.images || []).map(resolveImageUrl);
    const name = `${aircraft.year || ''} ${aircraft.make || ''} ${aircraft.model || ''}`.trim() || 'Aircraft Listing';
    const title = `${name} — ClearBlue Aero`;
    const pricePart = aircraft.asking_price ? ` — $${Number(aircraft.asking_price).toLocaleString()}` : '';
    const locPart = aircraft.location ? ` | ${aircraft.location}` : '';
    const description = `${name}${pricePart}${locPart}`.trim();
    const ogImage = images[0] || LOGO_URL;

    return new Response(buildPreviewHtml({ aircraft, title, description, ogImage, appUrl }), {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    return new Response('Error: ' + error.message, { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
});

function specRow(label, value) {
  if (!value && value !== 0 && value !== false) return '';
  let display = value;
  if (typeof value === 'boolean') display = value ? 'Yes' : 'No';
  return `<div class="spec"><span class="spec-label">${escapeHtml(label)}</span><span class="spec-value">${escapeHtml(String(display))}</span></div>`;
}

function buildPreviewHtml({ aircraft, title, description, ogImage, appUrl }) {
  const cover = (aircraft.images || []).map(resolveImageUrl)[0];
  const name = `${aircraft.year || ''} ${aircraft.make || ''} ${aircraft.model || ''}`.trim();

  const specs = [
    aircraft.asking_price != null ? specRow('Asking Price', `$${Number(aircraft.asking_price).toLocaleString()}`) : '',
    aircraft.location ? specRow('Location', aircraft.location) : '',
    aircraft.total_time != null ? specRow('Total Time', `${Number(aircraft.total_time).toLocaleString()} hrs`) : '',
    aircraft.engine_manufacturer || aircraft.engine_model
      ? specRow('Engine', [aircraft.engine_manufacturer, aircraft.engine_model].filter(Boolean).join(' '))
      : '',
    aircraft.engine_time_smoh != null
      ? specRow('Engine Time', `${Number(aircraft.engine_time_smoh).toLocaleString()} hrs ${aircraft.engine_time_type || 'SMOH'}`)
      : '',
    aircraft.engine_type ? specRow('Engine Type', aircraft.engine_type) : '',
    aircraft.avionics_suite ? specRow('Avionics', aircraft.avionics_suite) : '',
    aircraft.interior_condition ? specRow('Interior', aircraft.interior_condition) : '',
    aircraft.exterior_condition ? specRow('Exterior', aircraft.exterior_condition) : '',
    aircraft.damage_history ? specRow('Damage History', aircraft.damage_history) : '',
  ].filter(Boolean).join('');

  const statusBadge = aircraft.status
    ? `<span class="badge">${escapeHtml(aircraft.status)}</span>`
    : '';

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="canonical" href="${escapeAttr(appUrl)}">
<meta property="og:site_name" content="ClearBlue Aero">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(description)}">
<meta property="og:image" content="${escapeAttr(ogImage)}">
<meta property="og:url" content="${escapeAttr(appUrl)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(title)}">
<meta name="twitter:description" content="${escapeAttr(description)}">
<meta name="twitter:image" content="${escapeAttr(ogImage)}">
<meta http-equiv="refresh" content="3;url=${escapeAttr(appUrl)}">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#0b1622;color:#0f172a;-webkit-font-smoothing:antialiased}
  .wrap{max-width:480px;margin:0 auto;background:#fff;min-height:100vh;display:flex;flex-direction:column}
  header{background:#00447f;color:#fff;padding:18px 20px;display:flex;align-items:center;justify-content:space-between}
  header .brand{font-weight:700;font-size:16px;letter-spacing:.02em}
  header .brand span{color:#9ec7eb}
  .hero{width:100%;aspect-ratio:4/3;background:#e2e8f0;overflow:hidden;position:relative}
  .hero img{width:100%;height:100%;object-fit:cover;display:block}
  .status-wrap{padding:0 20px;margin-top:-22px;position:relative;z-index:2}
  .content{padding:20px;padding-top:14px;flex:1}
  h1{font-size:22px;line-height:1.25;font-weight:700;margin-bottom:6px}
  .meta{font-size:14px;color:#475569;margin-bottom:16px}
  .specs{border-top:1px solid #e2e8f0}
  .spec{display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid #e2e8f0;font-size:14px}
  .spec-label{color:#64748b;flex-shrink:0}
  .spec-value{color:#0f172a;font-weight:600;text-align:right}
  .badge{display:inline-block;background:#16a34a;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;letter-spacing:.04em;text-transform:uppercase}
  .notes{margin-top:16px;font-size:14px;color:#334155;line-height:1.6;white-space:pre-wrap}
  .cta{padding:18px 20px 26px;background:#fff}
  .btn{display:block;text-align:center;background:#00447f;color:#fff;text-decoration:none;padding:15px 20px;border-radius:10px;font-weight:600;font-size:16px}
  .redirect-note{text-align:center;font-size:12px;color:#94a3b8;margin-top:12px}
</style>
</head><body>
<div class="wrap">
  <header><div class="brand">Clear<span>Blue</span> Aero</div></header>
  ${cover ? `<div class="hero"><img src="${escapeAttr(cover)}" alt="${escapeAttr(name)}"></div>` : ''}
  ${aircraft.status ? `<div class="status-wrap">${statusBadge}</div>` : ''}
  <div class="content">
    <h1>${escapeHtml(name)}</h1>
    <div class="meta">${escapeHtml(description)}</div>
    ${specs ? `<div class="specs">${specs}</div>` : ''}
    ${aircraft.notes ? `<div class="notes">${escapeHtml(aircraft.notes)}</div>` : ''}
  </div>
  <div class="cta">
    <a class="btn" href="${escapeAttr(appUrl)}">View Full Listing →</a>
    <div class="redirect-note">Opening full listing…</div>
  </div>
</div>
<script>setTimeout(function(){window.location.replace("${escapeAttr(appUrl)}");},800);</script>
</body></html>`;
}

function buildFallbackHtml(title, description, ogImage, appUrl) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="canonical" href="${escapeAttr(appUrl)}">
<meta property="og:site_name" content="ClearBlue Aero">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(description)}">
<meta property="og:image" content="${escapeAttr(ogImage)}">
<meta property="og:url" content="${escapeAttr(appUrl)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(title)}">
<meta name="twitter:description" content="${escapeAttr(description)}">
<meta name="twitter:image" content="${escapeAttr(ogImage)}">
<meta http-equiv="refresh" content="0;url=${escapeAttr(appUrl)}">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#0b1622;color:#e2e8f0;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px}
  .card{max-width:380px}
  img{width:220px;height:auto;margin-bottom:24px}
  h1{font-size:22px;font-weight:700;margin-bottom:10px;color:#fff}
  p{font-size:15px;color:#94a3b8;margin-bottom:28px;line-height:1.5}
  a{display:inline-block;background:#00447f;color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:600;font-size:15px}
</style>
</head><body>
<div class="card">
  <img src="${escapeAttr(LOGO_URL)}" alt="ClearBlue Aero">
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <a href="${escapeAttr(appUrl)}">Visit ClearBlue Aero →</a>
</div>
<script>window.location.replace("${escapeAttr(appUrl)}");</script>
</body></html>`;
}