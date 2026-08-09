import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Canonical public site domain (the site being indexed by Google)
const SITE_ORIGIN = 'https://clearblueaero.com';

function xmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const base44 = createClientFromRequest(req);

    const aircraft = await base44.asServiceRole.entities.Aircraft.filter(
      { show_on_public: true, status: { $in: ["Coming Soon", "Available", "Under Contract", "Closing", "Sold"] } },
      'sort_order',
      500
    );

    // Static public pages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/inventory', priority: '0.9', changefreq: 'daily' },
      { path: '/sell', priority: '0.7', changefreq: 'weekly' },
      { path: '/about', priority: '0.6', changefreq: 'monthly' },
      { path: '/news', priority: '0.6', changefreq: 'weekly' },
      { path: '/contact', priority: '0.6', changefreq: 'monthly' },
      { path: '/insurance', priority: '0.5', changefreq: 'monthly' },
      { path: '/maintenance', priority: '0.5', changefreq: 'monthly' },
      { path: '/affiliate-program', priority: '0.4', changefreq: 'monthly' },
    ];

    const today = new Date().toISOString().split('T')[0];

    const urls = staticPages.map(p =>
      `  <url>
    <loc>${SITE_ORIGIN}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    ).join('\n');

    const aircraftUrls = aircraft.map(a => {
      const lastmod = a.updated_date ? new Date(a.updated_date).toISOString().split('T')[0] : today;
      return `  <url>
    <loc>${SITE_ORIGIN}/inventory/${a.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
${aircraftUrls}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      status: 500,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
});