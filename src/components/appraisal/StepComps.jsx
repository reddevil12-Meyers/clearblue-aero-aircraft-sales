import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ExternalLink } from "lucide-react";

const SOURCES = ["Trade-A-Plane", "Controller", "VREF", "ASO", "AvBuyer", "Barnstormers", "Dealer", "Direct Sale", "Other"];
const CONDITIONS = ["New/Refurbished", "Excellent", "Good", "Fair", "Poor"];
const STATUSES = ["Active Listing", "Sold", "Expired", "Unknown"];

const emptyComp = (aircraftId) => ({
  aircraft_id: aircraftId,
  make: '', model: '', year: '', registration: '', total_time: '', engine_time_smoh: '',
  avionics_suite: '', interior_condition: '', exterior_condition: '',
  asking_price: '', sold_price: '', sale_date: '', days_on_market: '',
  location: '', source: '', source_url: '', listing_date: '', status: 'Active Listing',
  similarity_score: '', notes: ''
});

export default function StepComps({ aircraftId, valuationRunId }) {
  const [comps, setComps] = useState([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!aircraftId) return;
    base44.entities.Comp.filter({ aircraft_id: aircraftId }).then(setComps);
  }, [aircraftId]);

  const updateDraft = (field, value) => setDraft(prev => ({ ...prev, [field]: value }));

  const handleAdd = async () => {
    setSaving(true);
    const data = { ...draft };
    ['year', 'total_time', 'engine_time_smoh', 'asking_price', 'sold_price', 'days_on_market', 'similarity_score'].forEach(f => {
      if (data[f] !== '' && data[f] != null) data[f] = Number(data[f]);
      else delete data[f];
    });
    const created = await base44.entities.Comp.create(data);
    setComps(prev => [...prev, created]);
    setAdding(false);
    setDraft(null);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Comp.delete(id);
    setComps(prev => prev.filter(c => c.id !== id));
  };

  if (!aircraftId) return (
    <div className="text-center py-12 text-muted-foreground">
      <p>Please select an aircraft on the Aircraft tab first.</p>
    </div>
  );

  const fmt = (n) => n ? `$${Number(n).toLocaleString()}` : '—';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{comps.length} comparable{comps.length !== 1 ? 's' : ''} added</p>
        <Button size="sm" onClick={() => { setDraft(emptyComp(aircraftId)); setAdding(true); }} className="gap-2">
          <Plus className="w-4 h-4" />Add Comp
        </Button>
      </div>

      {comps.length === 0 && !adding && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl text-muted-foreground">
          <p className="font-medium">No comps added yet</p>
          <p className="text-xs mt-1">Add comparable aircraft to strengthen the valuation confidence score.</p>
        </div>
      )}

      {comps.map(comp => (
        <div key={comp.id} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{comp.year} {comp.make} {comp.model} {comp.registration && `(${comp.registration})`}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{comp.source} · {comp.status}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                {comp.sold_price ? <p className="font-semibold text-green-700">{fmt(comp.sold_price)} sold</p> : null}
                {comp.asking_price ? <p className="text-sm text-muted-foreground">{fmt(comp.asking_price)} asking</p> : null}
              </div>
              {comp.source_url && <a href={comp.source_url} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" /></a>}
              <Button variant="ghost" size="icon" onClick={() => handleDelete(comp.id)} className="text-destructive h-8 w-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            {comp.total_time && <span>TT: {comp.total_time.toLocaleString()} hrs</span>}
            {comp.engine_time_smoh && <span>SMOH: {comp.engine_time_smoh.toLocaleString()} hrs</span>}
            {comp.days_on_market && <span>DOM: {comp.days_on_market} days</span>}
            {comp.interior_condition && <span>Int: {comp.interior_condition}</span>}
            {comp.exterior_condition && <span>Ext: {comp.exterior_condition}</span>}
            {comp.similarity_score && <span>Similarity: {comp.similarity_score}/10</span>}
          </div>
          {comp.notes && <p className="text-xs text-muted-foreground mt-2 italic">{comp.notes}</p>}
        </div>
      ))}

      {adding && draft && (
        <div className="bg-card border-2 border-accent/30 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold">New Comparable Aircraft</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[['make', 'Make'], ['model', 'Model'], ['year', 'Year'], ['registration', 'N-Number']].map(([f, l]) => (
              <div key={f} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{l}</Label>
                <Input value={draft[f] || ''} onChange={e => updateDraft(f, e.target.value)} />
              </div>
            ))}
            {[['total_time', 'Total Time (hrs)'], ['engine_time_smoh', 'SMOH (hrs)'], ['asking_price', 'Asking Price ($)'], ['sold_price', 'Sold Price ($)']].map(([f, l]) => (
              <div key={f} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{l}</Label>
                <Input type="number" value={draft[f] || ''} onChange={e => updateDraft(f, e.target.value)} />
              </div>
            ))}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Sale Date</Label>
              <Input type="date" value={draft.sale_date || ''} onChange={e => updateDraft('sale_date', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Days on Market</Label>
              <Input type="number" value={draft.days_on_market || ''} onChange={e => updateDraft('days_on_market', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Similarity (1-10)</Label>
              <Input type="number" min={1} max={10} value={draft.similarity_score || ''} onChange={e => updateDraft('similarity_score', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Location</Label>
              <Input value={draft.location || ''} onChange={e => updateDraft('location', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Interior</Label>
              <Select value={draft.interior_condition || ''} onValueChange={v => updateDraft('interior_condition', v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{CONDITIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Exterior</Label>
              <Select value={draft.exterior_condition || ''} onValueChange={v => updateDraft('exterior_condition', v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{CONDITIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={draft.status || ''} onValueChange={v => updateDraft('status', v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{STATUSES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Source</Label>
              <Select value={draft.source || ''} onValueChange={v => updateDraft('source', v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{SOURCES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1 lg:col-span-2">
              <Label className="text-xs text-muted-foreground">Source URL</Label>
              <Input type="url" value={draft.source_url || ''} onChange={e => updateDraft('source_url', e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Notes / Differences from Subject</Label>
            <Textarea value={draft.notes || ''} onChange={e => updateDraft('notes', e.target.value)} rows={2} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setAdding(false); setDraft(null); }}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !draft.make || !draft.model}>{saving ? 'Saving...' : 'Add Comp'}</Button>
          </div>
        </div>
      )}
    </div>
  );
}