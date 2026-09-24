import { useState, useEffect } from "react";
import { supabase } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, TrendingUp, TrendingDown, Minus, Save } from "lucide-react";

const MARKET_CONDITIONS = ["Strong Seller", "Balanced", "Buyer's Market", "Distressed"];

const fmt = (n) => n ? `$${Math.round(n).toLocaleString()}` : '-';

function ConfidenceGauge({ score }) {
  const color = score >= 70 ? 'bg-green-500' : score >= 45 ? 'bg-amber-500' : 'bg-red-500';
  const label = score >= 70 ? 'High Confidence' : score >= 45 ? 'Moderate Confidence' : 'Low Confidence';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{score}/100</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function StepValuation({ form, appraisalId, aircraftId }) {
  const [run, setRun] = useState(null);
  const [adjustments, setAdjustments] = useState([]);
  const [marketConditions, setMarketConditions] = useState('Balanced');
  const [storageType, setStorageType] = useState('Hangar');
  const [coastalLocation, setCoastalLocation] = useState('Inland');
  const [running, setRunning] = useState(false);
  const [savingAdj, setSavingAdj] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!appraisalId) return;
    supabase.from('valuation_runs').select('*').eq('appraisal_id', appraisalId).then(({ data }) => {
      const runs = data || [];
      if (runs.length > 0) {
        const latest = runs.sort((a, b) => new Date(b.run_date) - new Date(a.run_date))[0];
        setRun(latest);
        supabase.from('valuation_adjustments').select('*').eq('valuation_run_id', latest.id).then(({ data: adj }) => setAdjustments(adj || []));
      }
    });
  }, [appraisalId]);

  const handleRunEngine = async () => {
    if (!aircraftId) return alert('Select an aircraft first.');
    setRunning(true);
    toast({ title: "Coming soon", description: "The valuation engine will be available shortly." });
    setRunning(false);
  };

  const updateAdj = (id, field, value) => {
    setAdjustments(prev => prev.map(a => a.id === id ? { ...a, [field]: value, appraiser_override: true } : a));
  };

  const handleSaveAdjustments = async () => {
    setSavingAdj(true);
    await Promise.all(
      adjustments.map(a => supabase.from('valuation_adjustments').update({
        amount: Number(a.amount),
        description: a.description,
        appraiser_override: a.appraiser_override,
      }).eq('id', a.id))
    );
    // Recalculate totals
    const total = adjustments.reduce((s, a) => s + (a.direction === 'Negative' ? -Math.abs(Number(a.amount)) : Math.abs(Number(a.amount))), 0);
    const adjusted = (run.base_value || 0) + total;
    const rangePct = run.appraisal_mode === 'Full Appraisal' ? 0.03 : run.appraisal_mode === 'Extended Desktop' ? 0.04 : 0.06;
    const updatedRun = {
      total_adjustments: Math.round(total),
      adjusted_value: Math.round(adjusted),
      value_low: Math.round(adjusted * (1 - rangePct) / 100) * 100,
      value_high: Math.round(adjusted * (1 + rangePct) / 100) * 100,
      wholesale_value: Math.round(adjusted * 0.88 / 100) * 100,
      retail_value: Math.round(adjusted * 1.06 / 100) * 100,
      status: 'Final',
    };
    await supabase.from('valuation_runs').update(updatedRun).eq('id', run.id);
    setRun(prev => ({ ...prev, ...updatedRun }));
    setSavingAdj(false);
  };

  if (!aircraftId) return (
    <div className="text-center py-12 text-muted-foreground"><p>Please select an aircraft on the Aircraft tab first.</p></div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Run Valuation Engine</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Market Conditions</Label>
            <Select value={marketConditions} onValueChange={setMarketConditions}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>{MARKET_CONDITIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Storage Location</Label>
            <Select value={storageType} onValueChange={setStorageType}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Hangar">Hangar</SelectItem>
                <SelectItem value="Outside">Outside / Tiedown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Geographic Environment</Label>
            <Select value={coastalLocation} onValueChange={setCoastalLocation}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Inland">Inland</SelectItem>
                <SelectItem value="Coastal">Coastal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleRunEngine} disabled={running} className="gap-2 bg-primary">
            <Zap className="w-4 h-4" />{running ? 'Calculating...' : run ? 'Re-Run Engine' : 'Run Valuation Engine'}
          </Button>
        </div>
        {run && <p className="text-xs text-muted-foreground mt-3">Last run: {new Date(run.run_date).toLocaleString()} · Mode: {run.appraisal_mode}</p>}
      </div>

      {run && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Base Value', value: fmt(run.base_value), sub: `${run.comp_count} comps` },
              { label: 'Adjusted Value', value: fmt(run.adjusted_value), sub: `${run.total_adjustments >= 0 ? '+' : ''}${fmt(run.total_adjustments)} adjustments` },
              { label: 'Value Range', value: `${fmt(run.value_low)} – ${fmt(run.value_high)}`, sub: 'Fair market range' },
              { label: 'Wholesale / Retail', value: `${fmt(run.wholesale_value)} / ${fmt(run.retail_value)}`, sub: 'W/S and retail' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold mt-1">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Confidence Score</h3>
            <ConfidenceGauge score={run.confidence_score} />
            {run.confidence_breakdown && (() => {
              const bd = JSON.parse(run.confidence_breakdown);
              return (
                <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-2">
                  {Object.entries(bd).map(([k, v]) => (
                    <div key={k} className="text-center bg-muted/50 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</p>
                      <p className="font-semibold">{v} pts</p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider">Adjustment Line Items</h3>
              <Button size="sm" variant="outline" onClick={handleSaveAdjustments} disabled={savingAdj} className="gap-2">
                <Save className="w-3.5 h-3.5" />{savingAdj ? 'Saving...' : 'Save Overrides'}
              </Button>
            </div>
            <div className="space-y-3">
              {adjustments.map(adj => (
                <div key={adj.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="mt-0.5">
                    {adj.direction === 'Positive' ? <TrendingUp className="w-4 h-4 text-green-600" /> :
                     adj.direction === 'Negative' ? <TrendingDown className="w-4 h-4 text-red-500" /> :
                     <Minus className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs font-medium">{adj.category}</p>
                      {adj.appraiser_override && <span className="text-xs bg-amber-100 text-amber-700 px-1 rounded">overridden</span>}
                    </div>
                    <Textarea
                      value={adj.description || ''}
                      onChange={e => updateAdj(adj.id, 'description', e.target.value)}
                      rows={1}
                      className="text-xs"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">{adj.direction === 'Negative' ? '−' : '+'} $</span>
                      <Input
                        type="number"
                        value={Math.abs(adj.amount)}
                        onChange={e => updateAdj(adj.id, 'amount', adj.direction === 'Negative' ? -Math.abs(Number(e.target.value)) : Math.abs(Number(e.target.value)))}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {adjustments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Run the engine to generate adjustments.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}