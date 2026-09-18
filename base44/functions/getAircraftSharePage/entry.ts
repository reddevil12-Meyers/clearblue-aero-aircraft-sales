import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { resolveImageUrl } from '../../shared/publicAircraft.ts';

const SITE_ORIGIN = 'https://clearblueaero.com';
const FALLBACK_IMAGE = 'https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png';

const HTML_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'public, max-age=300',
};

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pageHtml({ title, desc, cover, listingUrl, priceLine, statusLine }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(listingUrl)}">
<meta property="og:site_name" content="ClearBlue Aero">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(cover)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(listingUrl)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(cover)}">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f6f8; color: #222; }
.hero { width: 100%; max-height: 52vh; object-fit: cover; display: block; }
.gold { height: 4px; background: #C9A84C; }
.card { max-width: 640px; margin: 0 auto; padding: 28px 20px 40px; text-align: center; }
h1 { color: #00447f; font-size: 26px; line-height: 1.25; margin-bottom: 10px; }
.price { color: #C9A84C; font-weight: 800; font-size: 22px; margin-bottom: 6px; }
.status { display: inline-block; font-size: 12px; font-weight: 700; text-transform: uppercase; background: #eef1f5; color: #555; border-radius: 999px; padding: 4px 12px; margin-bottom: 14px; }
.desc { color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
.btn { display: inline-block; background: #00447f; color: #fff; font-weight: 700; font-size: 15px; text-decoration: none; padding: 13px 28px; border-radius: 8px; }
.footer { color: #8a94a3; font-size: 12px; margin-top: 30px; }
.footer a { color: #00447f; text-decoration: none; }
</style>
</head>
<body>
<img class="hero" src="${esc(cover)}" alt="${esc(title)}">
<div class="gold"></div>
<div class="card">
  <h1>${esc(title)}</h1>
  ${priceLine ? `<div class="price">${esc(priceLine)}</div>` : ''}
  ${statusLine ? `<div class="status">${esc(statusLine)}</div>` : ''}
  <p class="desc">${esc(desc)}</p>
  <a class="btn" href="${esc(listingUrl)}">View Full Listing &rarr;</a>
  <p class="footer">ClearBlue Aero &middot; <a href="${esc(SITE_ORIGIN)}/inventory">Browse all aircraft</a></p>
</div>
<script>window.location.replace(${JSON.stringify(listingUrl)});</script>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Support both GET (query param, used by link-preview crawlers) and POST (JSON body)
    let id;
    if (req.method === 'GET') {
      id = new URL(req.url).searchParams.get('id');
    } else {
      const body = await req.json();
      id = body.id;
    }

    if (!id) return new Response('Missing id', { status: 400 });

    const aircraft = await base44.asServiceRole.entities.Aircraft.get(id);

    if (!aircraft || !aircraft.show_on_public || aircraft.status === 'Lead') {
      return new Response('Aircraft not found', { status: 404, headers: HTML_HEADERS });
    }

    const images = (aircraft.images || []).map(resolveImageUrl);
    const cover = images[0] || FALLBACK_IMAGE;

    const title = `${aircraft.year || ''} ${aircraft.make || ''} ${aircraft.model || ''} For Sale | ClearBlue Aero`.replace(/\s+/g, ' ').trim();
    const listingUrl = `${SITE_ORIGIN}/inventory/${id}`;

    const price = aircraft.price_drop || aircraft.asking_price;
    const descBits = [`${aircraft.year || ''} ${aircraft.make || ''} ${aircraft.model || ''} for sale`.replace(/\s+/g, ' ').trim()];
    if (price && aircraft.status !== 'Sold') descBits.push(`$${price.toLocaleString()}`);
    if (aircraft.total_time != null) descBits.push(`${aircraft.total_time.toLocaleString()} hrs TT`);
    if (aircraft.engine_time_smoh != null) descBits.push(`${aircraft.engine_time_smoh.toLocaleString()} hrs ${aircraft.engine_time_type || 'SMOH'}`);
    if (aircraft.avionics_suite) descBits.push(aircraft.avionics_suite);
    if (aircraft.location) descBits.push(aircraft.location);
    let desc = descBits.join(' · ');
    if (desc.length > 155) desc = desc.slice(0, 152) + '...';
    if (aircraft.status === 'Sold') desc = `SOLD: ${desc}`;

    const priceLine = price && aircraft.status !== 'Sold'
      ? `$${price.toLocaleString()}`
      : aircraft.status === 'Coming Soon' ? 'Call for early access' : null;

    const statusLine = aircraft.status === 'Sold' ? 'Sold'
      : aircraft.status === 'Under Contract' ? 'Under Contract'
      : aircraft.status === 'For Lease' ? 'For Lease'
      : null;

    return new Response(pageHtml({ title, desc, cover, listingUrl, priceLine, statusLine }), {
      status: 200,
      headers: HTML_HEADERS,
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});