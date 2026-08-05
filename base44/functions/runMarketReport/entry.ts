import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const DEFAULT_MAKES = [
  'Cessna', 'Piper', 'Beechcraft', 'Cirrus', 'Mooney',
  'Diamond', 'Columbia', 'Pilatus', 'TBM', 'Grumman'
];

const SOURCES = [
  'Trade-A-Plane (trade-a-plane.com)',
  'Controller (controller.com)',
  'Hangar 67 (hangar67.com)',
  'Aircraft For Sale (aircraftforsale.com)',
  'AirMart (airmart.com)',
  'Barnstormers (barnstormers.com)',
  'AvBuyer (avbuyer.com)'
];

const avg = (vals) => {
  const nums = vals.filter(v => typeof v === 'number' && v > 0);
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
};

const buildGroups = (listings, keyFn) => {
  const map = new Map();
  for (const l of listings) {
    const key = keyFn(l);
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(l);
  }
  return map;
};

const summarizeGroup = (items) => ({
  count: items.length,
  sold_count: items.filter(i => i.sold_price > 0).length,
  avg_asking_price: avg(items.map(i => i.asking_price)),
  avg_sold_price: avg(items.map(i => i.sold_price)),
  avg_total_time: avg(items.map(i => i.total_time)),
  avg_engine_time: avg(items.map(i => i.engine_time_smoh)),
  avg_year: avg(items.map(i => i.year))
});

const fmtMoney = (n) => (n == null ? '—' : `$${Number(n).toLocaleString()}`);
const fmtNum = (n) => (n == null ? '—' : Number(n).toLocaleString());

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Allow admin trigger or scheduled (service-role) execution
    let isAuthorized = false;
    try {
      const user = await base44.auth.me();
      if (user && user.role === 'admin') isAuthorized = true;
    } catch (_) {}
    // Scheduled automations run with a service-role context; allow if no user but service role present
    if (!isAuthorized) {
      try {
        await base44.asServiceRole.entities.MarketReport.list('-created_date', 1);
        isAuthorized = true;
      } catch (_) {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    let body = {};
    try { body = await req.json(); } catch (_) {}
    const makes = (body.makes && body.makes.length > 0) ? body.makes : DEFAULT_MAKES;
    const notifyEmail = body.notify_email || 'sales@flyclearblue.com';

    const now = new Date();
    const periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const report = await base44.asServiceRole.entities.MarketReport.create({
      run_date: now.toISOString(),
      status: 'Running',
      period_start: periodStart.toISOString().slice(0, 10),
      period_end: now.toISOString().slice(0, 10),
      sources_searched: SOURCES.map(s => s.split(' ')[0]),
      total_listings: 0,
      total_sold: 0
    });

    const allListings = [];

    for (const make of makes) {
      try {
        const prompt = `Search ${SOURCES.join(', ')} for current active listings AND recent sales of ${make} aircraft from the past 12 months.

Return up to 20 real aircraft records. For each, extract all available data. Include both piston single-engine and any twin/turboprop variants for the make. Focus on real, currently listed or recently sold aircraft only.

Return ONLY a JSON object: { "listings": [ { make, model, year, engine_type (Piston|Turboprop|Turbojet|Turbofan), asking_price (USD number), sold_price (USD number, 0 if not sold), total_time (airframe hours), engine_time_smoh (engine hours), status ("Active Listing"|"Sold"), location, source (site name) } ] }`;

        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: 'object',
            properties: {
              listings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    make: { type: 'string' },
                    model: { type: 'string' },
                    year: { type: 'number' },
                    engine_type: { type: 'string' },
                    asking_price: { type: 'number' },
                    sold_price: { type: 'number' },
                    total_time: { type: 'number' },
                    engine_time_smoh: { type: 'number' },
                    status: { type: 'string' },
                    location: { type: 'string' },
                    source: { type: 'string' }
                  }
                }
              }
            }
          }
        });

        const listings = (result && result.listings) || [];
        for (const l of listings) {
          allListings.push({
            make: (l.make || make).trim(),
            model: (l.model || '').trim(),
            year: l.year || null,
            engine_type: l.engine_type || 'Piston',
            asking_price: l.asking_price || 0,
            sold_price: l.sold_price || 0,
            total_time: l.total_time || null,
            engine_time_smoh: l.engine_time_smoh || null,
            status: l.status || 'Active Listing',
            location: l.location || '',
            source: l.source || ''
          });
        }
      } catch (makeErr) {
        console.log(`Gather failed for ${make}:`, makeErr.message);
      }
    }

    // Aggregate
    const byMakeMap = buildGroups(allListings, l => l.make);
    const by_make = Array.from(byMakeMap.entries())
      .map(([make, items]) => ({ make, ...summarizeGroup(items) }))
      .sort((a, b) => b.count - a.count);

    const byModelMap = buildGroups(allListings, l => (l.make && l.model) ? `${l.make}|${l.model}` : null);
    const by_model = Array.from(byModelMap.entries())
      .map(([key, items]) => {
        const [make, model] = key.split('|');
        const g = summarizeGroup(items);
        delete g.avg_engine_time;
        return { make, model, ...g };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 40);

    const byEngineMap = buildGroups(allListings, l => l.engine_type);
    const by_engine_type = Array.from(byEngineMap.entries())
      .map(([engine_type, items]) => ({
        engine_type,
        count: items.length,
        avg_asking_price: avg(items.map(i => i.asking_price)),
        avg_sold_price: avg(items.map(i => i.sold_price)),
        avg_total_time: avg(items.map(i => i.total_time))
      }))
      .sort((a, b) => b.count - a.count);

    const overall = {
      total_listings: allListings.length,
      total_sold: allListings.filter(l => l.sold_price > 0).length,
      avg_asking_price: avg(allListings.map(l => l.asking_price)),
      avg_sold_price: avg(allListings.filter(l => l.sold_price > 0).map(l => l.sold_price)),
      avg_total_time: avg(allListings.map(l => l.total_time)),
      avg_engine_time: avg(allListings.map(l => l.engine_time_smoh)),
      avg_year: avg(allListings.map(l => l.year))
    };

    // Narrative summary via LLM
    let summary = '';
    try {
      const summaryPrompt = `You are an aircraft market analyst. Based on the following aggregated market data, write a concise (4-6 sentence) narrative summary of current aircraft market conditions, highlighting notable pricing trends, which manufacturers/models are strongest, and any observations about inventory levels or selling prices. Keep it professional and factual.

Aggregated data (JSON):
${JSON.stringify({ overall, by_make: by_make.slice(0, 8), by_engine_type })}`;
      const summaryRes = await base44.integrations.Core.InvokeLLM({
        prompt: summaryPrompt,
        model: 'gemini_3_flash'
      });
      summary = typeof summaryRes === 'string' ? summaryRes : (summaryRes?.text || JSON.stringify(summaryRes));
    } catch (sumErr) {
      console.log('Summary generation failed:', sumErr.message);
    }

    await base44.asServiceRole.entities.MarketReport.update(report.id, {
      status: 'Completed',
      total_listings: overall.total_listings,
      total_sold: overall.total_sold,
      avg_asking_price: overall.avg_asking_price,
      avg_sold_price: overall.avg_sold_price,
      avg_total_time: overall.avg_total_time,
      avg_engine_time: overall.avg_engine_time,
      avg_year: overall.avg_year,
      by_make,
      by_model,
      by_engine_type,
      summary
    });

    // Send email report
    try {
      const makeRows = by_make.map(row => `<tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600;">${row.make}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${row.count}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${row.sold_count}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${fmtMoney(row.avg_asking_price)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${fmtMoney(row.avg_sold_price)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${fmtNum(row.avg_total_time)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${row.avg_year || '—'}</td>
      </tr>`).join('');

      const html = `<div style="font-family:'Open Sans',Arial,sans-serif;max-width:700px;margin:0 auto;padding:24px;color:#1a1a1a;">
<div style="text-align:center;margin-bottom:24px;"><img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1c49af472_logo-01.png" alt="ClearBlue Aero" style="max-width:240px;height:auto;" /></div>
<p style="font-size:24px;font-weight:700;color:#00447f;text-align:center;margin-bottom:4px;">Weekly Aircraft Market Report</p>
<p style="font-size:13px;color:#64748b;text-align:center;margin-bottom:24px;">${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

<div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
  <div style="flex:1;min-width:140px;background:#f1f5f9;border-radius:8px;padding:14px;text-align:center;">
    <p style="font-size:12px;color:#64748b;margin:0;">Listings Sampled</p>
    <p style="font-size:22px;font-weight:700;color:#00447f;margin:4px 0 0;">${overall.total_listings}</p>
  </div>
  <div style="flex:1;min-width:140px;background:#f1f5f9;border-radius:8px;padding:14px;text-align:center;">
    <p style="font-size:12px;color:#64748b;margin:0;">Avg Asking Price</p>
    <p style="font-size:22px;font-weight:700;color:#00447f;margin:4px 0 0;">${fmtMoney(overall.avg_asking_price)}</p>
  </div>
  <div style="flex:1;min-width:140px;background:#f1f5f9;border-radius:8px;padding:14px;text-align:center;">
    <p style="font-size:12px;color:#64748b;margin:0;">Avg Sold Price</p>
    <p style="font-size:22px;font-weight:700;color:#00447f;margin:4px 0 0;">${fmtMoney(overall.avg_sold_price)}</p>
  </div>
  <div style="flex:1;min-width:140px;background:#f1f5f9;border-radius:8px;padding:14px;text-align:center;">
    <p style="font-size:12px;color:#64748b;margin:0;">Avg Total Time</p>
    <p style="font-size:22px;font-weight:700;color:#00447f;margin:4px 0 0;">${fmtNum(overall.avg_total_time)}h</p>
  </div>
</div>

${summary ? `<p style="font-size:15px;line-height:1.6;background:#f8fafc;border-left:4px solid #00447f;padding:14px 18px;border-radius:0 6px 6px 0;margin-bottom:24px;">${summary}</p>` : ''}

<p style="font-size:16px;font-weight:700;color:#00447f;margin-bottom:10px;">Breakdown by Manufacturer</p>
<table style="width:100%;border-collapse:collapse;font-size:14px;">
<thead><tr style="background:#00447f;color:#fff;">
  <th style="padding:8px;text-align:left;">Make</th>
  <th style="padding:8px;">Listings</th>
  <th style="padding:8px;">Sold</th>
  <th style="padding:8px;text-align:right;">Avg Asking</th>
  <th style="padding:8px;text-align:right;">Avg Sold</th>
  <th style="padding:8px;text-align:right;">Avg TT (hrs)</th>
  <th style="padding:8px;">Avg Year</th>
</tr></thead>
<tbody>${makeRows}</tbody>
</table>

<p style="font-size:13px;color:#64748b;margin-top:24px;">Sources scanned: ${SOURCES.join(', ')}. Data gathered via automated web search and aggregated by the ClearBlue Aero market intelligence engine. Full breakdown by model and engine type is available in the Market Reports dashboard.</p>
</div>`;

      await base44.functions.invoke('sendExternalEmail', {
        to: notifyEmail,
        subject: `Weekly Aircraft Market Report — ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        html
      });
    } catch (emailErr) {
      console.log('Report email failed (non-blocking):', emailErr.message);
    }

    return Response.json({
      success: true,
      report_id: report.id,
      total_listings: overall.total_listings,
      by_make_count: by_make.length
    });
  } catch (error) {
    console.error('Market report error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}