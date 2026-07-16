import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { url } = await req.json();
    if (!url) return Response.json({ error: 'Missing url' }, { status: 400 });

    // Facebook Marketplace requires login — cannot be scraped
    if (url.includes('facebook.com/marketplace')) {
      return Response.json({ error: 'Facebook Marketplace listings require a login to view and cannot be imported automatically. Please use a public listing site like Trade-A-Plane, Controller, Barnstormers, ASO, or Gardner Aircraft.' }, { status: 422 });
    }

    // Fetch the page HTML directly so we can pass the real content to the LLM
    let pageContent = '';
    try {
      const fetchResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      });
      const html = await fetchResponse.text();

      // Strip HTML tags and collapse whitespace to get readable text
      pageContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s{3,}/g, '  ')
        .trim()
        .slice(0, 8000); // Keep within token limits
    } catch (fetchErr) {
      // If direct fetch fails, fall back to LLM internet browsing
      pageContent = '';
    }

    const prompt = pageContent
      ? `You are an aircraft data extractor. Below is the text content scraped from an aircraft listing page. Extract all available aircraft details.

PAGE CONTENT:
${pageContent}

Extract as much data as possible and return a JSON object. Use null for missing fields.

Return ONLY a JSON object with these fields:
- registration (string, N-number)
- make (string, one of: Cessna, Piper, Beechcraft, Cirrus, Mooney, Diamond, Socata, Grumman, Commander, Meyers, Stinson, Vans Aircraft, Glasair, Pilatus, TBM, Daher, Epic, Quest, Textron, Hawker, Embraer, Bombardier, Gulfstream, Dassault, Waco, Other)
- model (string)
- year (number)
- serial_number (string)
- total_time (number, airframe hours)
- engine_time_smoh (number, engine hours since major overhaul or since new)
- engine_time_type (string, "SMOH" or "SNEW")
- engine_manufacturer (string)
- engine_model (string)
- engine_type (string, one of: Piston, Turboprop, Turbojet, Turbofan)
- num_engines (string, one of: "Single" or "Multi-Engine" — use "Single" for single-engine aircraft, "Multi-Engine" for twin/multi)
- propeller_time (number, propeller hours if listed)
- avionics_suite (string, one of: Garmin G1000, Garmin G3X, Garmin GTN 750/650, Avidyne IFD, Aspen EFD, King Digital, Collins Pro Line, Honeywell Primus, Steam Gauges, Mixed/Upgraded, Other)
- avionics_details (string, list all avionics equipment mentioned)
- interior_condition (string, one of: New/Refurbished, Excellent, Good, Fair, Poor — infer from description)
- exterior_condition (string, one of: New/Refurbished, Excellent, Good, Fair, Poor — infer from description)
- paint_year (number)
- interior_year (number)
- damage_history (string, one of: None, Minor, Major, Unknown — default None if not mentioned)
- adsb_compliant (boolean, true if ADS-B out is mentioned)
- asking_price (number, USD, no commas or symbols)
- location (string, airport identifier or city/state)
- notes (string, combine all remarks and description text from the listing)
- status (string, use "Available" by default)
- show_on_public (boolean, false by default)`
      : `You are an aircraft data extractor. Visit the following aircraft listing URL and extract all available aircraft details.

URL: ${url}

Extract as much data as possible and return a JSON object. Use null for missing fields.

Return ONLY a JSON object with these fields:
- registration (string, N-number)
- make (string, one of: Cessna, Piper, Beechcraft, Cirrus, Mooney, Diamond, Socata, Grumman, Commander, Meyers, Stinson, Vans Aircraft, Glasair, Pilatus, TBM, Daher, Epic, Quest, Textron, Hawker, Embraer, Bombardier, Gulfstream, Dassault, Waco, Other)
- model (string)
- year (number)
- serial_number (string)
- total_time (number, airframe hours)
- engine_time_smoh (number)
- engine_time_type (string, "SMOH" or "SNEW")
- engine_manufacturer (string)
- engine_model (string)
- engine_type (string, one of: Piston, Turboprop, Turbojet, Turbofan)
- num_engines (string, one of: "Single" or "Multi-Engine")
- propeller_time (number)
- avionics_suite (string, one of: Garmin G1000, Garmin G3X, Garmin GTN 750/650, Avidyne IFD, Aspen EFD, King Digital, Collins Pro Line, Honeywell Primus, Steam Gauges, Mixed/Upgraded, Other)
- avionics_details (string)
- interior_condition (string, one of: New/Refurbished, Excellent, Good, Fair, Poor)
- exterior_condition (string, one of: New/Refurbished, Excellent, Good, Fair, Poor)
- paint_year (number)
- interior_year (number)
- damage_history (string, one of: None, Minor, Major, Unknown)
- adsb_compliant (boolean)
- asking_price (number, USD, no commas)
- location (string, airport identifier or city/state)
- notes (string, full description text from the listing)
- status (string, use "Available" by default)
- show_on_public (boolean, false by default)`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: !pageContent, // only use internet if direct fetch failed
      response_json_schema: {
        type: "object",
        properties: {
          registration: { type: "string" },
          make: { type: "string" },
          model: { type: "string" },
          year: { type: "number" },
          serial_number: { type: "string" },
          total_time: { type: "number" },
          engine_time_smoh: { type: "number" },
          engine_time_type: { type: "string" },
          engine_manufacturer: { type: "string" },
          engine_model: { type: "string" },
          engine_type: { type: "string" },
          num_engines: { type: "string", enum: ["Single", "Multi-Engine"] },
          propeller_time: { type: "number" },
          avionics_suite: { type: "string" },
          avionics_details: { type: "string" },
          interior_condition: { type: "string" },
          exterior_condition: { type: "string" },
          paint_year: { type: "number" },
          interior_year: { type: "number" },
          damage_history: { type: "string" },
          adsb_compliant: { type: "boolean" },
          asking_price: { type: "number" },
          location: { type: "string" },
          notes: { type: "string" },
          status: { type: "string" },
          show_on_public: { type: "boolean" }
        }
      },
      model: "gemini_3_flash"
    });

    // Strip null/empty/zero values
    const aircraft = Object.fromEntries(
      Object.entries(result).filter(([key, v]) => {
        if (v === null || v === undefined || v === "" || v === "null" || v === "undefined") return false;
        const numericFields = ["year", "total_time", "engine_time_smoh", "asking_price", "paint_year", "interior_year", "propeller_time"];
        if (numericFields.includes(key) && v === 0) return false;
        return true;
      })
    );

    // Ensure num_engines is a valid enum string
    if (aircraft.num_engines !== undefined && aircraft.num_engines !== null) {
      const ne = String(aircraft.num_engines).toLowerCase();
      aircraft.num_engines = (ne.includes("multi") || ne === "2" || Number(ne) > 1) ? "Multi-Engine" : "Single";
    }

    // Ensure defaults
    if (!aircraft.status) aircraft.status = "Available";
    if (aircraft.show_on_public === undefined) aircraft.show_on_public = false;
    if (!aircraft.damage_history) aircraft.damage_history = "None";

    // If we couldn't extract meaningful data, surface an error
    const meaningfulFields = ["make", "model", "year", "registration", "asking_price"];
    const hasMeaningfulData = meaningfulFields.some(f => aircraft[f]);
    if (!hasMeaningfulData) {
      return Response.json({ error: 'Could not extract aircraft details from this URL. The page may require a login, block scrapers, or not contain a specific aircraft listing.' }, { status: 422 });
    }

    return Response.json({ aircraft });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});