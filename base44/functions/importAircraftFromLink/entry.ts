import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { url } = await req.json();
    if (!url) return Response.json({ error: 'Missing url' }, { status: 400 });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an aircraft data extractor. Visit the following aircraft listing URL and extract all available aircraft details.

URL: ${url}

Extract as much data as possible and return a JSON object matching this schema. Use null for missing fields.

Return ONLY a JSON object with these fields:
- registration (string, N-number)
- make (string, one of: Cessna, Piper, Beechcraft, Cirrus, Mooney, Diamond, Socata, Grumman, Commander, Pilatus, TBM, Daher, Epic, Quest, Textron, Hawker, Embraer, Bombardier, Gulfstream, Dassault, Other)
- model (string)
- year (number)
- serial_number (string)
- total_time (number, airframe hours)
- engine_time_smoh (number)
- engine_time_type (string, "SMOH" or "SNEW")
- engine_manufacturer (string)
- engine_model (string)
- engine_type (string, one of: Piston, Turboprop, Turbojet, Turbofan)
- num_engines (number)
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
- show_on_public (boolean, false by default)`,
      add_context_from_internet: true,
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
          num_engines: { type: "number" },
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
      model: "gemini_3_1_pro"
    });

    // Strip null values
    const aircraft = Object.fromEntries(
      Object.entries(result).filter(([, v]) => v !== null && v !== undefined && v !== "")
    );

    // Ensure defaults
    if (!aircraft.status) aircraft.status = "Available";
    if (aircraft.show_on_public === undefined) aircraft.show_on_public = false;

    return Response.json({ aircraft });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});