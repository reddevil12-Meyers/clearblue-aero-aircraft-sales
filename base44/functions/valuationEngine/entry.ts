import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { aircraft, records, comps, appraisal_mode, appraisal_id, market_conditions } = await req.json();

  // --- BASE VALUE from comps ---
  const soldComps = comps.filter(c => c.sold_price > 0);
  const listingComps = comps.filter(c => c.asking_price > 0);
  const allPrices = [
    ...soldComps.map(c => c.sold_price),
    ...listingComps.map(c => c.asking_price * 0.94), // typical discount from ask
  ].filter(Boolean);

  let base_value = 0;
  if (allPrices.length > 0) {
    allPrices.sort((a, b) => a - b);
    const mid = Math.floor(allPrices.length / 2);
    base_value = allPrices.length % 2 !== 0
      ? allPrices[mid]
      : (allPrices[mid - 1] + allPrices[mid]) / 2;
  }

  // --- ADJUSTMENTS ---
  const adjustments = [];

  // Engine hours adjustment
  if (aircraft.engine_time_smoh != null && aircraft.total_time != null) {
    const engineFraction = aircraft.engine_time_smoh / (aircraft.total_time || 1);
    if (engineFraction < 0.3) {
      adjustments.push({ category: 'Engine Hours / Overhaul', direction: 'Positive', amount: base_value * 0.07, description: 'Engine recently overhauled — low SMOH relative to airframe time', percentage: 7 });
    } else if (engineFraction > 0.8) {
      adjustments.push({ category: 'Engine Hours / Overhaul', direction: 'Negative', amount: -(base_value * 0.08), description: 'Engine approaching TBO — high SMOH', percentage: -8 });
    }
  }

  // Airframe time vs typical for model
  if (aircraft.total_time > 5000) {
    adjustments.push({ category: 'Airframe Time', direction: 'Negative', amount: -(base_value * 0.04), description: 'Higher than average airframe time for model year', percentage: -4 });
  } else if (aircraft.total_time < 1500) {
    adjustments.push({ category: 'Airframe Time', direction: 'Positive', amount: base_value * 0.03, description: 'Low airframe time — below average for age', percentage: 3 });
  }

  // Propeller time & type
  if (aircraft.propeller_time > 1800) {
    adjustments.push({ category: 'Propeller Time', direction: 'Negative', amount: -(base_value * 0.02), description: 'Propeller near or at overhaul interval', percentage: -2 });
  }
  // Multi-engine: also consider propeller 2
  if (aircraft.propeller2_time > 1800) {
    adjustments.push({ category: 'Propeller Time', direction: 'Negative', amount: -(base_value * 0.02), description: 'Propeller 2 near or at overhaul interval', percentage: -2 });
  }
  // Premium propeller brands add value
  const premiumProps = ['Hartzell', 'MT Propeller', 'Hoffmann'];
  const prop1Brand = (aircraft.propeller_manufacturer || '').trim();
  const prop2Brand = (aircraft.propeller2_manufacturer || '').trim();
  if (premiumProps.some(p => prop1Brand.toLowerCase().includes(p.toLowerCase()))) {
    adjustments.push({ category: 'STCs / Modifications', direction: 'Positive', amount: base_value * 0.015, description: `Premium propeller: ${prop1Brand}`, percentage: 1.5 });
  }
  if (aircraft.num_engines >= 2 && premiumProps.some(p => prop2Brand.toLowerCase().includes(p.toLowerCase()))) {
    adjustments.push({ category: 'STCs / Modifications', direction: 'Positive', amount: base_value * 0.015, description: `Premium propeller 2: ${prop2Brand}`, percentage: 1.5 });
  }

  // Avionics
  const modernAvionics = ['Garmin G1000', 'Garmin G3X', 'Garmin GTN 750/650', 'Avidyne IFD'];
  if (modernAvionics.includes(aircraft.avionics_suite)) {
    adjustments.push({ category: 'Avionics Upgrades', direction: 'Positive', amount: base_value * 0.05, description: `Modern glass cockpit: ${aircraft.avionics_suite}`, percentage: 5 });
  } else if (aircraft.avionics_suite === 'Steam Gauges') {
    adjustments.push({ category: 'Avionics Upgrades', direction: 'Negative', amount: -(base_value * 0.03), description: 'Basic steam gauges — no glass panel upgrade', percentage: -3 });
  }

  // Interior condition
  const interiorMap = { 'New/Refurbished': 0.04, 'Excellent': 0.02, 'Good': 0, 'Fair': -0.02, 'Poor': -0.05 };
  if (aircraft.interior_condition && interiorMap[aircraft.interior_condition] !== 0) {
    const pct = interiorMap[aircraft.interior_condition];
    adjustments.push({ category: 'Interior Condition', direction: pct > 0 ? 'Positive' : 'Negative', amount: base_value * pct, description: `Interior rated ${aircraft.interior_condition}`, percentage: pct * 100 });
  }

  // Paint / exterior condition
  const paintMap = { 'New/Refurbished': 0.03, 'Excellent': 0.015, 'Good': 0, 'Fair': -0.02, 'Poor': -0.04 };
  if (aircraft.exterior_condition && paintMap[aircraft.exterior_condition] !== 0) {
    const pct = paintMap[aircraft.exterior_condition];
    adjustments.push({ category: 'Paint / Exterior Condition', direction: pct > 0 ? 'Positive' : 'Negative', amount: base_value * pct, description: `Exterior rated ${aircraft.exterior_condition}`, percentage: pct * 100 });
  }

  // Damage history
  if (records) {
    if (records.damage_history === 'Major') {
      adjustments.push({ category: 'Damage History', direction: 'Negative', amount: -(base_value * 0.15), description: 'Major damage history documented', percentage: -15 });
    } else if (records.damage_history === 'Minor') {
      adjustments.push({ category: 'Damage History', direction: 'Negative', amount: -(base_value * 0.05), description: 'Minor damage history noted', percentage: -5 });
    }

    // Missing records
    if (records.logbook_status === 'Missing') {
      adjustments.push({ category: 'Missing Records', direction: 'Negative', amount: -(base_value * 0.10), description: 'Logbooks missing — significant records penalty', percentage: -10 });
    } else if (records.logbook_status === 'Partial') {
      adjustments.push({ category: 'Missing Records', direction: 'Negative', amount: -(base_value * 0.05), description: 'Partial logbook records', percentage: -5 });
    }

    // AD / SB compliance
    if (records.ad_compliance_status === 'Non-Compliant') {
      adjustments.push({ category: 'AD / SB Compliance', direction: 'Negative', amount: -(base_value * 0.06), description: 'Known AD non-compliance issues', percentage: -6 });
    } else if (records.ad_compliance_status === 'Partial') {
      adjustments.push({ category: 'AD / SB Compliance', direction: 'Negative', amount: -(base_value * 0.03), description: 'Partial AD compliance', percentage: -3 });
    }

    // FAA record status
    if (records.faa_record_status === 'Lien Noted') {
      adjustments.push({ category: 'Airworthiness Concerns', direction: 'Negative', amount: -(base_value * 0.02), description: 'Lien noted on FAA records', percentage: -2 });
    }
  }

  // Market conditions
  if (market_conditions === 'Strong Seller') {
    adjustments.push({ category: 'Market Supply & Demand', direction: 'Positive', amount: base_value * 0.04, description: 'Strong seller\'s market — higher demand relative to supply', percentage: 4 });
  } else if (market_conditions === "Buyer's Market") {
    adjustments.push({ category: 'Market Supply & Demand', direction: 'Negative', amount: -(base_value * 0.04), description: 'Buyer\'s market — excess supply dampening prices', percentage: -4 });
  }

  // ADS-B compliance
  if (aircraft.adsb_compliant) {
    adjustments.push({ category: 'Avionics Upgrades', direction: 'Positive', amount: base_value * 0.01, description: 'ADS-B Out compliant — regulatory requirement met', percentage: 1 });
  }

  // Total adjustments
  const total_adjustments = adjustments.reduce((sum, a) => sum + a.amount, 0);
  const adjusted_value = base_value + total_adjustments;

  // Value range: ±6% for desktop, ±4% for extended, ±3% for full
  const rangePct = appraisal_mode === 'Full Appraisal' ? 0.03 : appraisal_mode === 'Extended Desktop' ? 0.04 : 0.06;
  const value_low = Math.round(adjusted_value * (1 - rangePct) / 100) * 100;
  const value_high = Math.round(adjusted_value * (1 + rangePct) / 100) * 100;
  const wholesale_value = Math.round(adjusted_value * 0.88 / 100) * 100;
  const retail_value = Math.round(adjusted_value * 1.06 / 100) * 100;

  // --- CONFIDENCE SCORE ---
  const confidence_breakdown = {};
  let confidence = 0;

  // Comp count (max 30 pts)
  const compScore = Math.min(comps.length * 6, 30);
  confidence_breakdown.comp_count = compScore;
  confidence += compScore;

  // Comp freshness (max 20 pts) — based on average age in days
  const now = Date.now();
  const compAges = comps
    .filter(c => c.sale_date || c.listing_date)
    .map(c => (now - new Date(c.sale_date || c.listing_date).getTime()) / (1000 * 60 * 60 * 24));
  const avgAge = compAges.length > 0 ? compAges.reduce((a, b) => a + b, 0) / compAges.length : 365;
  const freshnessScore = avgAge < 90 ? 20 : avgAge < 180 ? 15 : avgAge < 365 ? 10 : 5;
  confidence_breakdown.comp_freshness = freshnessScore;
  confidence += freshnessScore;

  // Inspection type (max 20 pts)
  const inspectionScore = appraisal_mode === 'Full Appraisal' ? 20 : appraisal_mode === 'Extended Desktop' ? 12 : 6;
  confidence_breakdown.inspection_type = inspectionScore;
  confidence += inspectionScore;

  // Records completeness (max 20 pts)
  let recordsScore = 10;
  if (records) {
    if (records.logbook_status === 'Complete') recordsScore += 5;
    if (records.ad_compliance_status === 'Fully Compliant') recordsScore += 3;
    if (records.faa_record_status === 'Clear') recordsScore += 2;
  }
  confidence_breakdown.records_completeness = recordsScore;
  confidence += recordsScore;

  // Missing data (max 10 pts)
  const coreFields = ['total_time', 'engine_time_smoh', 'propeller_time', 'avionics_suite', 'interior_condition', 'exterior_condition'];
  const missing = coreFields.filter(f => !aircraft[f]).length;
  const missingScore = Math.max(10 - missing * 2, 0);
  confidence_breakdown.data_completeness = missingScore;
  confidence += missingScore;

  const confidence_score = Math.min(Math.round(confidence), 100);

  // Save ValuationRun
  const runData = {
    appraisal_id: appraisal_id || null,
    aircraft_id: aircraft.id,
    appraisal_mode,
    run_date: new Date().toISOString(),
    run_by: user.email,
    base_value: Math.round(base_value),
    base_value_source: `Median of ${comps.length} comparable aircraft`,
    total_adjustments: Math.round(total_adjustments),
    adjusted_value: Math.round(adjusted_value),
    value_low,
    value_high,
    wholesale_value,
    retail_value,
    confidence_score,
    confidence_breakdown: JSON.stringify(confidence_breakdown),
    comp_count: comps.length,
    comp_freshness_days: Math.round(avgAge),
    missing_data_count: missing,
    inspection_type: appraisal_mode === 'Full Appraisal' ? 'Physical' : 'Desktop',
    methodology: 'Sales Comparison',
    market_conditions: market_conditions || 'Balanced',
    status: 'Draft',
  };

  const run = await base44.asServiceRole.entities.ValuationRun.create(runData);

  // Save adjustment line items
  const savedAdjustments = await Promise.all(
    adjustments.map((adj, i) =>
      base44.asServiceRole.entities.ValuationAdjustment.create({
        valuation_run_id: run.id,
        ...adj,
        amount: Math.round(adj.amount),
        appraiser_override: false,
        sort_order: i,
      })
    )
  );

  return Response.json({
    run,
    adjustments: savedAdjustments,
    confidence_breakdown,
  });
});