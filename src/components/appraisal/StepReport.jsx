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
    const prompt = `You are a professional aircraft appraiser. Generate narrative sections for an appraisal report based on the following data:

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

Write professional, concise, expert-level appraisal narrative for each section. Be specific to this aircraft's actual data. Sound like an experienced aviation appraiser. Keep each section 2-4 sentences.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
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
            <Label className="text-xs text-muted-foreground">Market Position / Aircraft Overview</Label>
            <Textarea value={form.market_position || ''} onChange={e => update('market_position', e.target.value)} rows={3} placeholder="Describe the aircraft's market niche, competition, and buyer profile..." />
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