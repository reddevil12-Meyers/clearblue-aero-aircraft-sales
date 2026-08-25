import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Save, Sparkles } from "lucide-react";
import { generateAppraisalPDF } from "../../utils/generateAppraisalPDF";

const STATUSES = ["Draft", "In Progress", "Review", "Final", "Delivered"];
const PAYMENT = ["Pending", "Invoiced", "Paid"];

const fmt = (n) => n ? `$${Math.round(n).toLocaleString()}` : '—';

export default function StepReport({ form, update, appraisalId, onSave }) {
  const [run, setRun] = useState(null);
  const [adjustments, setAdjustments] = useState([]);
  const [comps, setComps] = useState([]);
  const [aircraft, setAircraft] = useState(null);
  const [client, setClient] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const promises = [];
    if (appraisalId) {
      promises.push(
        base44.entities.ValuationRun.filter({ appraisal_id: appraisalId }).then(runs => {
          if (runs.length > 0) {
            const latest = runs.sort((a, b) => new Date(b.run_date) - new Date(a.run_date))[0];
            setRun(latest);
            return base44.entities.ValuationAdjustment.filter({ valuation_run_id: latest.id }).then(setAdjustments);
          }
        })
      );
    }
    if (form.aircraft_id) {
      promises.push(
        base44.entities.Comp.filter({ aircraft_id: form.aircraft_id }).then(setComps)
      );
      promises.push(
        base44.entities.Aircraft.filter({}).then(all => {
          const ac = all.find(a => a.id === form.aircraft_id);
          setAircraft(ac || null);
        })
      );
    }
    if (form.client_id) {
      promises.push(
        base44.entities.Client.filter({}).then(all => {
          const cl = all.find(c => c.id === form.client_id);
          setClient(cl || null);
        })
      );
    }
    Promise.all(promises);
  }, [appraisalId, form.aircraft_id, form.client_id]);

  const handleGenerateNarratives = async () => {
    setGenerating(true);
    const prompt = `You are a professional aircraft appraiser. Generate narrative sections for an appraisal report based on the following data.

AIRCRAFT: ${aircraft ? JSON.stringify({
      year: aircraft.year, make: aircraft.make, model: aircraft.model,
      registration: aircraft.registration, total_time: aircraft.total_time,
      engine_manufacturer: aircraft.engine_manufacturer, engine_model: aircraft.engine_model,
      engine_time_smoh: aircraft.engine_time_smoh, engine_time_type: aircraft.engine_time_type,
      num_engines: aircraft.num_engines, engine_type: aircraft.engine_type,
      engine2_manufacturer: aircraft.engine2_manufacturer, engine2_model: aircraft.engine2_model,
      engine2_time_smoh: aircraft.engine2_time_smoh,
      propeller_manufacturer: aircraft.propeller_manufacturer, propeller_time: aircraft.propeller_time,
      avionics_suite: aircraft.avionics_suite, avionics_details: aircraft.avionics_details,
      interior_condition: aircraft.interior_condition, exterior_condition: aircraft.exterior_condition,
      paint_year: aircraft.paint_year, interior_year: aircraft.interior_year,
      damage_history: aircraft.damage_history, damage_details: aircraft.damage_details,
      adsb_compliant: aircraft.adsb_compliant, engine_type: aircraft.engine_type,
    }) : 'N/A'}

APPRAISAL: type=${form.appraisal_type}, purpose=${form.purpose}, mode=${form.appraisal_mode}

VALUATION RUN: ${run ? JSON.stringify({
      base_value: run.base_value, adjusted_value: run.adjusted_value,
      value_low: run.value_low, value_high: run.value_high,
      wholesale_value: run.wholesale_value, retail_value: run.retail_value,
      comp_count: run.comp_count, market_conditions: run.market_conditions,
      confidence_score: run.confidence_score,
    }) : 'Not yet run'}

ADJUSTMENTS: ${adjustments.length > 0 ? adjustments.map(a => `${a.category}: ${a.direction} $${Math.abs(a.amount)} - ${a.description}`).join('; ') : 'None'}

Write professional, expert-level appraisal narrative for each section. Be specific to this aircraft's actual data. Sound like an experienced aviation appraiser. Keep each section 2-4 sentences — EXCEPT the "Appraiser Market Analysis" (market_position) section, which must be a full multi-paragraph analysis (5 paragraphs minimum) following the detailed format and example below.

For the "Appraiser Market Analysis" (market_position) section specifically, write it as a professional top-level aircraft dealer. Follow this format and logic (use the example below only as a structural template — tailor all content, numbers, and specifics to the actual subject aircraft and today's real market data):

EXAMPLE FORMAT (do not copy verbatim; mirror its structure, tone, and depth for the subject aircraft):
"Current pricing for a 1977 Grumman AA-5A Cheetah positions it as an affordable, efficient four-seat performer in the value-oriented GA marketplace in late April 2026. These sleek, bonded-aluminum singles—known for their sliding canopy, responsive handling, good cruise speeds (around 130–140 knots), and economical Lycoming O-320 operation—appeal to owners seeking fun cross-country flying, training, or personal transport at lower ownership costs than many contemporaries. Like other late-1970s pistons, the AA-5A market has seen notable softening in the past month amid broader pressures.
Solid 1977 AA-5A examples typically ask between $85,000 and $160,000, with actual transaction prices landing 10–25% lower after pre-buy inspections. Recent listings include a well-maintained 1977 model with modern IFR upgrades (Garmin GI275/GPS 175) at $110,000, clean 1976–1977 Cheetahs in the $87,500–$91,500 range, and higher-time or basic examples dipping toward $60,000–$80,000. Days on market have stretched modestly, reflecting buyer selectivity.
A clear pricing distinction exists between basic steam-gauge or lightly upgraded aircraft and those with partial modern avionics. Pure or minimally refreshed steam-gauge examples—often with higher total time and analog panels—trade in the $70,000–$110,000 band, appealing to budget buyers or VFR enthusiasts. Partial-modern 'glass-assisted' configurations, featuring Garmin navigators, electronic flight displays (e.g., GI275 or G5), ADS-B, and autopilots, command $115,000–$160,000+ (with select low-time, nicely refurbished examples approaching $180,000–$200,000 when paired with strong engine time and fresh cosmetics). The avionics premium delivers better dispatch reliability and IFR capability while buyer hesitation has narrowed gaps in recent weeks.
Overall, median asking prices for 1977 AA-5As now center around $95,000–$135,000, with transactions clustering near $80,000–$125,000. This reflects a significant short-term drop (often 10–20% on comparable airframes) over the past month.
Economically and geopolitically, this softening stems from surging fuel and operating costs, widespread buyer caution, and oversupply in the used market. The ongoing U.S.–Israel–Iran conflict has sharply increased energy prices, with ripple effects on 100LL avgas and insurance premiums. For these efficient but still fuel-dependent 1970s airframes—where annual operating costs typically range $12,000–$18,000—the faster rise in variable expenses has made buyers more price-sensitive and aggressive in negotiations. Compounding this, the aging GA fleet dynamic has increased the number of available 45–50-year-old aircraft on the market, as owners sell rather than absorb rising maintenance, overhaul, and fuel bills amid economic volatility and elevated interest rates. The resulting oversaturation has applied downward pressure particularly on mid-1970s inventory like the AA-5A, while exceptionally well-equipped or low-time examples hold firmer."

Required structure for the subject aircraft (in this order):
1. Positioning paragraph — where the subject aircraft sits in today's GA marketplace, its defining characteristics, target buyer, and current market posture (e.g., softening/firming).
2. Asking/transaction range paragraph — typical asking bands, typical transaction-to-asking discount after pre-buy, a few representative recent listing examples with prices, and days-on-market commentary.
3. Avionics/equipment premium paragraph — the pricing distinction between basic steam-gauge and modern/partial-glass configurations, with concrete price bands and what drives the premium.
4. Median summary paragraph — current median asking and transaction clusters, and the short-term (past month) percentage drop on comparable airframes.
5. Economic & geopolitical drivers paragraph — current economic and geopolitical drivers (e.g., the U.S.–Israel–Iran conflict pushing energy/avgas/insurance costs), buyer price-sensitivity, and aging-fleet oversupply dynamics specific to this airframe's era.

Rules: Use today's real, current market data (web-search enabled). Include concrete price ranges and percentages as in the example. Be specific to the subject aircraft's make/model/year. Do NOT set or justify the appraised value itself — keep pricing directional and market-descriptive only; the detailed adjustments and final value conclusion are handled in the lower half of the appraisal.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          market_position: { type: 'string' },
          airframe_assessment: { type: 'string' },
          engine_assessment: { type: 'string' },
          propeller_assessment: { type: 'string' },
          avionics_assessment: { type: 'string' },
          interior_assessment: { type: 'string' },
          exterior_assessment: { type: 'string' },
          comparable_sales: { type: 'string' },
          marketability_analysis: { type: 'string' },
          pricing_strategy: { type: 'string' },
          appraiser_notes: { type: 'string' },
        }
      }
    });

    Object.entries(result).forEach(([key, value]) => {
      if (value) update(key, value);
    });
    setGenerating(false);
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    const enriched = { ...form };
    await generateAppraisalPDF(enriched, aircraft, client, run, adjustments, comps);
    setGenerating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave();
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {run && (
        <div className="bg-primary text-primary-foreground rounded-xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-80">Final Opinion of Value</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Fair Market Value', value: fmt(run.adjusted_value) },
              { label: 'Value Range', value: `${fmt(run.value_low)} – ${fmt(run.value_high)}` },
              { label: 'Wholesale', value: fmt(run.wholesale_value) },
              { label: 'Retail', value: fmt(run.retail_value) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs opacity-70">{label}</p>
                <p className="text-xl font-bold mt-1">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-4">
            <div>
              <p className="text-xs opacity-70">Confidence Score</p>
              <p className="text-2xl font-bold">{run.confidence_score}/100</p>
            </div>
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${run.confidence_score}%` }} />
            </div>
          </div>
        </div>
      )}

      {!run && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
          ⚠ No valuation has been run yet. Go to the Valuation tab to calculate values first.
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Report Status & Billing</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={form.status || ''} onValueChange={v => update('status', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{STATUSES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Payment Status</Label>
            <Select value={form.payment_status || ''} onValueChange={v => update('payment_status', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{PAYMENT.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Fee ($)</Label>
            <input type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={form.fee || ''} onChange={e => update('fee', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider">Narrative — Aircraft &amp; Market</h3>
          <Button size="sm" variant="outline" onClick={handleGenerateNarratives} disabled={generating} className="gap-2">
            <Sparkles className="w-3.5 h-3.5" />{generating ? 'Generating...' : 'Generate with AI'}
          </Button>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Appraiser Market Analysis</Label>
            <Textarea value={form.market_position || ''} onChange={e => update('market_position', e.target.value)} rows={5} placeholder="Enter your professional market analysis for this aircraft..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Airframe Assessment</Label>
            <Textarea value={form.airframe_assessment || ''} onChange={e => update('airframe_assessment', e.target.value)} rows={2} placeholder="Airframe condition, total time context, any structural notes..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Engine Assessment</Label>
            <Textarea value={form.engine_assessment || ''} onChange={e => update('engine_assessment', e.target.value)} rows={2} placeholder="Engine hours, overhaul status, TBO proximity, buyer perception..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Avionics Assessment</Label>
            <Textarea value={form.avionics_assessment || ''} onChange={e => update('avionics_assessment', e.target.value)} rows={2} placeholder="Avionics suite description, upgrade value contribution..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Interior Assessment</Label>
              <Textarea value={form.interior_assessment || ''} onChange={e => update('interior_assessment', e.target.value)} rows={2} placeholder="Interior condition and value impact..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Exterior Assessment</Label>
              <Textarea value={form.exterior_assessment || ''} onChange={e => update('exterior_assessment', e.target.value)} rows={2} placeholder="Paint/exterior condition and value impact..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Comparable Sales Analysis</Label>
            <Textarea value={form.comparable_sales || ''} onChange={e => update('comparable_sales', e.target.value)} rows={3} placeholder="Describe the comp set and market context..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Marketability Analysis</Label>
            <Textarea value={form.marketability_analysis || ''} onChange={e => update('marketability_analysis', e.target.value)} rows={3} placeholder="Buyer pool, time-to-sell estimate, strengths and limitations..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Pricing Strategy</Label>
            <Textarea value={form.pricing_strategy || ''} onChange={e => update('pricing_strategy', e.target.value)} rows={3} placeholder="Quick sale / balanced ask / optimistic pricing guidance..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Assumptions &amp; Limitations</Label>
            <Textarea value={form.appraiser_notes || ''} onChange={e => update('appraiser_notes', e.target.value)} rows={3} placeholder="Scope limitations, data sources, inspection notes..." />
          </div>

        </div>
      </div>

      {adjustments.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Adjustment Summary</h3>
          <div className="space-y-2">
            {adjustments.map(a => (
              <div key={a.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{a.category}</span>
                <span className={a.direction === 'Negative' ? 'text-red-600' : 'text-green-700'}>
                  {a.direction === 'Negative' ? '−' : '+'}{fmt(Math.abs(a.amount))}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold border-t border-border pt-2 mt-2">
              <span>Total Adjustments</span>
              <span>{run?.total_adjustments >= 0 ? '+' : '−'}{fmt(Math.abs(run?.total_adjustments))}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={handleGeneratePDF} disabled={generating} className="gap-2">
          <FileDown className="w-4 h-4" />{generating ? 'Generating...' : 'Generate PDF Report'}
        </Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save & Finalize'}
        </Button>
      </div>
    </div>
  );
}