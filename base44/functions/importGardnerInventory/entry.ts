import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    // Optional limit parameter for batch processing
    let limit = 0;
    try {
      const body = await req.json();
      limit = body.limit || 0;
    } catch (_) {}

    // 1. Fetch listing page
    const listingRes = await fetch('https://www.gardneraircraft.com/planesforsale.php?engine=0', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const listingHtml = await listingRes.text();

    // 2. Parse listings
    const listings = [];
    const chunks = listingHtml.split('aicraftlistitem card card');
    for (let i = 1; i < chunks.length; i++) {
      const chunk = chunks[i];
      const idMatch = chunk.match(/planeviewspec\.php\?id=(\d+)/);
      const regMatch = chunk.match(/Registration:<\/div>\s*<div class=["']value["']>([^<]+)<\/div>/);
      const priceMatch = chunk.match(/Price:<\/div>\s*<div class=["']value["']>([^<]+)<\/div>/);
      const isSold = chunk.includes('cardsold');

      if (idMatch && regMatch) {
        listings.push({
          id: idMatch[1],
          registration: regMatch[1].trim(),
          price: priceMatch?.[1] || null,
          isSold
        });
      }
    }

    // 3. Process each listing
    const results = [];
    let processed = 0;

    for (const listing of listings) {
      if (limit > 0 && processed >= limit) break;

      try {
        // Check if already exists by registration
        const existing = await base44.asServiceRole.entities.Aircraft.filter({ registration: listing.registration });
        if (existing.length > 0) {
          results.push({ registration: listing.registration, status: 'skipped' });
          continue;
        }

        // Fetch detail page
        const detailRes = await fetch(`https://www.gardneraircraft.com/planeviewspec.php?id=${listing.id}`);
        const detailHtml = await detailRes.text();

        // Parse specs
        const specs = parseSpecs(detailHtml);

        // Download and upload images
        const imageUrls = [];
        for (const imgUrl of specs.imageUrls) {
          try {
            const imgRes = await fetch(imgUrl);
            const blob = await imgRes.blob();
            const fileName = (imgUrl.split('/').pop() || 'image').split('?')[0];
            const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
            const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });
            if (uploadResult.file_url) imageUrls.push(uploadResult.file_url);
          } catch (_) {}
        }

        // Map to Aircraft entity
        const aircraftData = mapToAircraftData(listing, specs, imageUrls);

        // Create record
        const record = await base44.asServiceRole.entities.Aircraft.create(aircraftData);
        results.push({ registration: listing.registration, status: 'created', id: record.id, images: imageUrls.length });
        processed++;
      } catch (e) {
        results.push({ registration: listing.registration, status: 'error', error: e.message });
      }
    }

    return Response.json({
      results,
      totalFound: listings.length,
      processed,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
      created: results.filter(r => r.status === 'created').length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function decodeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseSpecs(html) {
  const specs = {};

  // Single-line specs
  const singleFields = {
    specyear: 'year',
    specmake: 'make',
    specmodel: 'model',
    specprice: 'price',
    specregistration: 'registration',
    specserialnumber: 'serialNumber',
    spectotaltime: 'totalTime',
    specseating: 'seats',
    specannualduedate: 'annualDue'
  };

  for (const [divId, key] of Object.entries(singleFields)) {
    const regex = new RegExp(`id=["']?${divId}["']?[^>]*>[\\s\\S]*?specvalue[^>]*>([^<]*)<`, 's');
    const match = html.match(regex);
    specs[key] = match ? decodeHtml(match[1]) : '';
  }

  // Multi-line specs
  const multiFields = {
    specenginedesc: 'engine',
    specpropellerdesc: 'propeller',
    specautopilotdesc: 'autopilot',
    specavionicdesc: 'avionics',
    specotherequipdesc: 'otherEquip',
    specexteriordesc: 'exterior',
    specinteriordesc: 'interior',
    specseatingdesc: 'seatingDesc',
    specremarks: 'remarks'
  };

  for (const [divId, key] of Object.entries(multiFields)) {
    const regex = new RegExp(`id=["']?${divId}["']?[^>]*>[\\s\\S]*?specvalue[^>]*>([\\s\\S]*?)</span>`, 's');
    const match = html.match(regex);
    if (match) {
      let value = match[1]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      specs[key] = value;
    } else {
      specs[key] = '';
    }
  }

  // Extract image URLs (from img src inside div class="pic" or 'pic')
  const imgRegex = /<div class=["']?pic["']?><a[^>]*><img[^>]*src=["']([^"']+)["']/g;
  specs.imageUrls = [];
  let imgMatch;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    let url = imgMatch[1];
    // Make relative URLs absolute
    if (url.startsWith('template/') || url.startsWith('/template/')) {
      url = 'https://www.gardneraircraft.com/' + url.replace(/^\//, '');
    }
    specs.imageUrls.push(url);
  }

  // Extract Google Drive links from remarks for logbooks
  const driveMatch = specs.remarks?.match(/https?:\/\/drive\.google\.com\/[^\s<"]+/);
  specs.logbookUrl = driveMatch ? driveMatch[0] : null;

  return specs;
}

function mapToAircraftData(listing, specs, imageUrls) {
  // Map make
  const MAKE_MAP = {
    'BEECHCRAFT': 'Beechcraft',
    'PIPER': 'Piper',
    'CESSNA': 'Cessna',
    'MOONEY': 'Mooney',
    'VANS AIRCRAFT': 'Vans Aircraft',
    'CIRRU': 'Cirrus',
    'DIAMOND': 'Diamond',
    'SOCATA': 'Socata',
    'GRUMMAN': 'Grumman',
    'COMMANDER': 'Commander',
    'PILATUS': 'Pilatus',
    'TBM': 'TBM',
    'DAHER': 'Daher',
    'EPIC': 'Epic',
    'QUEST': 'Quest',
    'TEXTRON': 'Textron',
    'HAWKER': 'Hawker',
    'EMBRAER': 'Embraer',
    'BOMBARDIER': 'Bombardier',
    'GULFSTREAM': 'Gulfstream',
    'DASSAULT': 'Dassault'
  };
  const makeRaw = (specs.make || '').toUpperCase().trim();
  const make = MAKE_MAP[makeRaw] || 'Other';

  // Parse year
  const year = parseInt(specs.year) || null;

  // Parse price
  let askingPrice = null;
  const priceStr = specs.price || listing.price || '';
  const priceMatch = priceStr.match(/\$([\d,]+)/);
  if (priceMatch) {
    askingPrice = parseInt(priceMatch[1].replace(/,/g, ''));
  }

  // Parse total time
  let totalTime = null;
  const ttMatch = (specs.totalTime || '').match(/([\d,]+)/);
  if (ttMatch) {
    totalTime = parseInt(ttMatch[1].replace(/,/g, ''));
  }

  // Parse engine time (first SMOH value)
  let engineTimeSmoh = null;
  const smohMatch = (specs.engine || '').match(/(\d[\d,]*)\s*SMOH/);
  if (smohMatch) {
    engineTimeSmoh = parseInt(smohMatch[1].replace(/,/g, ''));
  }

  // Parse propeller time (first SPOH value)
  let propellerTime = null;
  const spohMatch = (specs.propeller || '').match(/(\d[\d,]*)\s*SPOH/);
  if (spohMatch) {
    propellerTime = parseInt(spohMatch[1].replace(/,/g, ''));
  }

  // Determine number of engines
  let numEngines = 1;
  if (specs.engine && specs.engine.includes('LEFT') && specs.engine.includes('RIGHT')) {
    numEngines = 2;
  }

  // Infer engine type from model/make
  const modelUpper = (specs.model || '').toUpperCase();
  const makeUpper = (specs.make || '').toUpperCase();
  let engineType = 'Piston';
  if (makeUpper === 'LEARJET' || modelUpper.includes('CITATION') || modelUpper.includes('LEARJET')) {
    engineType = 'Turbofan';
  } else if (modelUpper.includes('KING AIR') || modelUpper.includes('MERIDIAN') || modelUpper.includes('JET PROP') || modelUpper.includes('TURBANZA') || modelUpper.includes('TBM') || modelUpper.includes('CHEYENNE')) {
    engineType = 'Turboprop';
  }

  // Map avionics suite
  let avionicsSuite = null;
  const avText = (specs.avionics || '').toUpperCase();
  if (avText.includes('G1000')) avionicsSuite = 'Garmin G1000';
  else if (avText.includes('G3X')) avionicsSuite = 'Garmin G3X';
  else if (avText.includes('GTN 650') || avText.includes('GTN 750')) avionicsSuite = 'Garmin GTN 750/650';
  else if (avText.includes('AVIDYNE')) avionicsSuite = 'Avidyne IFD';
  else if (avText.includes('ASPEN')) avionicsSuite = 'Aspen EFD';
  else if (avText.includes('KING')) avionicsSuite = 'King Digital';
  else if (avText.includes('COLLINS')) avionicsSuite = 'Collins Pro Line';
  else if (avText.includes('HONEYWELL') || avText.includes('PRIMUS')) avionicsSuite = 'Honeywell Primus';
  else if (avText.length > 0) avionicsSuite = 'Mixed/Upgraded';

  // Build description/notes
  const notesParts = [];
  if (specs.remarks) {
    // Remove the Google Drive link from remarks for the notes
    const cleanRemarks = specs.remarks.replace(/https?:\/\/drive\.google\.com\/[^\s]+/g, '').trim();
    if (cleanRemarks) notesParts.push(cleanRemarks);
  }
  if (specs.avionics) notesParts.push(`Avionics: ${specs.avionics}`);
  if (specs.autopilot) notesParts.push(`Auto-Pilot: ${specs.autopilot}`);
  if (specs.otherEquip) notesParts.push(`Other Equipment: ${specs.otherEquip}`);
  if (specs.exterior) notesParts.push(`Exterior: ${specs.exterior}`);
  if (specs.interior) notesParts.push(`Interior: ${specs.interior}`);
  if (specs.seatingDesc) notesParts.push(`Seating: ${specs.seatingDesc}`);
  const notes = notesParts.join('\n\n');

  // Parse annual due (format: M/YY)
  let annualDue = null;
  const annualMatch = (specs.annualDue || '').match(/(\d+)\/(\d+)/);
  if (annualMatch) {
    const month = parseInt(annualMatch[1]);
    const yr = parseInt(annualMatch[2]);
    const fullYear = yr < 100 ? 2000 + yr : yr;
    const lastDay = new Date(fullYear, month, 0).getDate();
    annualDue = `${fullYear}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }

  // Clean model (remove extra spaces)
  const model = (specs.model || '').replace(/\s+/g, ' ').trim();

  const data = {
    registration: listing.registration,
    make,
    model,
    year,
    serial_number: specs.serialNumber || '',
    total_time: totalTime,
    engine_time_smoh: engineTimeSmoh,
    engine_time_type: 'SMOH',
    num_engines: numEngines,
    engine_type: engineType,
    propeller_time: propellerTime,
    avionics_suite: avionicsSuite,
    avionics_details: specs.avionics || '',
    asking_price: askingPrice,
    status: listing.isSold ? 'Sold' : 'Available',
    location: 'Spruce Creek Fly-in (7FL6)',
    listing_partner: 'Gardner Aircraft Sales',
    notes,
    images: imageUrls,
    show_on_public: true,
    published_sites: ['gardner']
  };

  if (annualDue) data.annual_due = annualDue;
  if (specs.logbookUrl) data.logbook_urls = [specs.logbookUrl];

  return data;
}