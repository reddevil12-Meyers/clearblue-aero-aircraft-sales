import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { fetchListingText } from '../../shared/listingPage.ts';

const compJsonSchema = {
  type: 'object',
  properties: {
    make: { type: 'string' },
    model: { type: 'string' },
    year: { type: 'number' },
    registration: { type: 'string' },
    serial_number: { type: 'string' },
    total_time: { type: 'number' },
    engine_time_smoh: { type: 'number' },
    avionics_suite: { type: 'string' },
    interior_condition: { type: 'string' },
    exterior_condition: { type: 'string' },
    asking_price: { type: 'number' },
    sold_price: { type: 'number' },
    sale_date: { type: 'string' },
    days_on_market: { type: 'number' },
    location: { type: 'string' },
    listing_date: { type: 'string' },
    status: { type: 'string' },
    similarity_score: { type: 'number' },
    notes: { type: 'string' }
  }
};

// Detect a Comp-source value that is valid for the entity enum from the URL host.
const SOURCE_FRAGMENTS = [
  ['trade-a-plane', 'Trade-A-Plane'],
  ['controller', 'Controller'],
  ['vref', 'VREF'],
  ['aso', 'ASO'],
  ['avbuyer', 'AvBuyer'],
  ['barnstormers', 'Barnstormers'],
];

const detectSource = (url) => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    for (const [frag, label] of SOURCE_FRAGMENTS) {
      if (host.includes(frag)) return { source: label, host };
    }
    return { source: 'Other', host };
  } catch (_) {
    return { source: 'Other', host: '' };
  }
};

const toNumber = (v) => {
  if (v == null || v === '') return null;
  const n = Number(String(v).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const url = String(body.url || '').trim();
    const subject = String(body.subject || '').trim();
    if (!url) return Response.json({ error: 'Missing url' }, { status: 400 });

    // Page content, best source first: rendered text fetched by the user's
    // browser (passes anti-bot walls and is not rate-limited), then a direct
    // server fetch, then the reader proxy — so the price is read from the
    // actual listing text instead of the LLM's (error-prone) browsing render.
    const cleanText = (raw) => String(raw || '')
      .replace(/!\[Image[^\]]*\]\([^)]*\)/g, '')
      .replace(/\s{3,}/g, '  ')
      .trim();
    let pageContent = cleanText(body.pageContent).slice(0, 8000);
    if (!pageContent || /just a moment|checking your browser|captcha|challenge-platform|access denied/i.test(pageContent)) {
      pageContent = '';
    }
    if (!pageContent) pageContent = await fetchListingText(url);

    // Tail number hint from the URL path (e.g. aerista.com/showroom/n888sx/)
    const urlHint = (url.match(/n\d+[a-z]{0,2}/i) || [])[0] || 'the aircraft';

    const priceRules = [
      'PRICE ACCURACY RULES (follow exactly):',
      '- Copy the advertised price EXACTLY as printed on the page, digit for digit. Do not round, adjust, or estimate any digits.',
      '- If multiple prices or a price history appear, use the CURRENT advertised listing price.',
      '- asking_price = the current advertised/listed price. sold_price = only if the page explicitly states the aircraft is sold AND shows the sale price; otherwise leave sold_price null.',
      '- Return prices as plain numbers of US dollars (no commas, symbols, or text).'
    ].join('\n');

    const fieldRules = [
      '- status: "Sold" only if the page explicitly marks the aircraft as sold, otherwise "Active Listing".',
      '- Only return data that is actually present on the page. Use null for anything not found — never invent values.',
      subject ? `- similarity_score: 1-10, based on how similar this listing is to the subject aircraft: ${subject}.` : '- similarity_score: null.',
      '- notes: any extra observations (price changes, condition remarks, listing site name).'
    ].join('\n');

    const prompt = pageContent
      ? `You are an aircraft comparable-listing extractor. Below is the text content scraped directly from one aircraft listing page. Extract a single comparable aircraft record from it.

PAGE CONTENT:
${pageContent}

${priceRules}

${fieldRules}

Return ONLY the JSON object for this one comp record.`
      : `You are an aircraft comparable-listing extractor. Visit the following aircraft listing URL and read the page carefully, especially every digit of the price.

URL: ${url}

If the page does not load directly, use web search to locate this exact listing — search for the tail number from the URL (${urlHint}) together with the site domain — and read the listing details from the search results or a cached version of the page.

CRITICAL: If you cannot actually access or read the listing, return null for EVERY field. Never invent, guess, or estimate any value — a comp with fabricated data is worse than no comp.

${priceRules}

${fieldRules}

Return ONLY the JSON object for this one comp record.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: !pageContent, // only browse if direct fetch failed
      response_json_schema: compJsonSchema,
      model: 'gemini_3_flash'
    });

    // Strip null/empty values and sanitize
    const comp = Object.fromEntries(
      Object.entries(result || {}).filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== 'null' && v !== 'undefined')
    );
    ['asking_price', 'sold_price'].forEach(f => {
      const n = toNumber(comp[f]);
      if (n == null) delete comp[f]; else comp[f] = n;
    });
    ['year', 'total_time', 'engine_time_smoh', 'days_on_market', 'similarity_score'].forEach(f => {
      if (comp[f] != null) comp[f] = Number(comp[f]);
      if (comp[f] === 0) delete comp[f]; // junk zero from a blocked/empty page
    });

    // Nothing meaningful extracted — surface a clear error instead of a junk record
    if (!comp.make && !comp.model && !comp.asking_price && !comp.sold_price && !comp.registration) {
      return Response.json({ error: 'Could not extract listing details from this URL. The page may require a login, block scrapers, or not contain an aircraft listing.' }, { status: 422 });
    }

    const { source, host } = detectSource(url);
    comp.source = source;
    comp.source_url = url;
    if (!comp.status) comp.status = 'Active Listing';
    if (host && source === 'Other' && !/listing site:/i.test(comp.notes || '')) {
      comp.notes = (comp.notes ? comp.notes + ' ' : '') + `Listing site: ${host}`;
    }

    return Response.json({ comp, usedPageContent: !!pageContent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}