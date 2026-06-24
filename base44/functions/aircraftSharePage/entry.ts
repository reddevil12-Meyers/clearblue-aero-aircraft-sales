import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function resolveImageUrl(uri) {
  if (!uri) return uri;
  const match = uri.match(/https:\/\/base44\.app\/api\/apps\/[^/]+\/files\/mp\/public\/([^/]+)\/(.+)/);
  if (match) return `https://media.base44.com/images/public/${match[1]}/${match[2]}`;
  return uri;
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    let id = url.searchParams.get('id');
    if (!id && req.method === 'POST') {
      try { id = (await req.json()).id; } catch (_) {}
    }

    const origin = url.origin;
    const appUrl = `${origin}/inventory/${id}`;
    const logoUrl = 'https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png';

    if (!id) {
      return new Response('Missing id', { status: 400, headers: { 'Content-Type': 'text/plain' } });
    }

    let aircraft = null;
    try {
      aircraft = await base44.asServiceRole.entities.Aircraft.get(id);
    } catch (_) { /* not found */ }

    const buildHtml = (title, description, ogImage) => `<!DOCTYPE html><html><head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta property="og:site_name" content="ClearBlue Aero">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(ogImage)}">
<meta property="og:url" content="${escapeHtml(appUrl)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(ogImage)}">
<meta http-equiv="refresh" content="0;url=${escapeHtml(appUrl)}">
</head><body>Redirecting…<script>window.location.replace("${escapeHtml(appUrl)}");</script></body></html>`;

    if (!aircraft || !aircraft.show_on_public) {
      return new Response(
        buildHtml('ClearBlue Aero — Aircraft Sales & Appraisals', 'Trusted aircraft brokerage, appraisals, and sales.', logoUrl),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const images = (aircraft.images || []).map(resolveImageUrl);
    const name = `${aircraft.year || ''} ${aircraft.make || ''} ${aircraft.model || ''}`.trim();
    const title = `${name} — ClearBlue Aero`;
    const pricePart = aircraft.asking_price ? ` — $${aircraft.asking_price.toLocaleString()}` : '';
    const locPart = aircraft.location ? ` | ${aircraft.location}` : '';
    const description = `${name}${pricePart}${locPart}`.trim();
    const ogImage = images[0] || logoUrl;

    return new Response(buildHtml(title, description, ogImage), { headers: { 'Content-Type': 'text/html' } });
  } catch (error) {
    return new Response('Error: ' + error.message, { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
});