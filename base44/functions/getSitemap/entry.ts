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

    const [aircraft, news] = await Promise.all([
      base44.asServiceRole.entities.Aircraft.filter(
        { show_on_public: true, status: { $in: ["Coming Soon", "Available", "For Lease", "Under Contract", "Closing", "Sold"] } },
        'sort_order',
        500
      ),
      base44.asServiceRole.entities.Announcement.filter(
        { active: true },
        '-created_date',
        200
      ),
    ]);

    // Static public pages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/inventory', priority: '0.9', changefreq: 'daily' },
      { path: '/sell', priority: '0.7', changefreq: 'weekly' },
      { path: '/buyer', priority: '0.7', changefreq: 'monthly' },
      { path: '/about', priority: '0.6', changefreq: 'monthly' },
      { path: '/news', priority: '0.6', changefreq: 'weekly' },
      { path: '/contact', priority: '0.6', changefreq: 'monthly' },
      { path: '/sell/single-engine', priority: '0.6', changefreq: 'monthly' },
      { path: '/sell/twin-engine', priority: '0.6', changefreq: 'monthly' },
      { path: '/insurance', priority: '0.5', changefreq: 'monthly' },
      { path: '/maintenance', priority: '0.5', changefreq: 'monthly' },
      { path: '/estate-aircraft', priority: '0.6', changefreq: 'monthly' },
      { path: '/gardner', priority: '0.5', changefreq: 'monthly' },
      { path: '/affiliate-program', priority: '0.4', changefreq: 'monthly' },
    ];

    const today = new Date().toISOString().split('T')[0];

    const urlEntry = (loc, lastmod, changefreq, priority) => `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

    const staticUrls = staticPages.map(p => urlEntry(SITE_ORIGIN + p.path, today, p.changefreq, p.priority)).join('\n');

    const newsUrls = news.map(n => {
      const lastmod = n.updated_date ? new Date(n.updated_date).toISOString().split('T')[0] : today;
      return urlEntry(`${SITE_ORIGIN}/news/${n.id}`, lastmod, 'monthly', '0.5');
    }).join('\n');

    const aircraftUrls = aircraft.map(a => {
      const lastmod = a.updated_date ? new Date(a.updated_date).toISOString().split('T')[0] : today;
      return urlEntry(`${SITE_ORIGIN}/inventory/${a.id}`, lastmod, 'weekly', '0.8');
    }).join('\n');

    const allUrls = [staticUrls, newsUrls, aircraftUrls].filter(Boolean).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls}
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