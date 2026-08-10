import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ExternalLink, Sparkles, CheckCircle2, Circle, Loader2, SlidersHorizontal, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [aircraft, setAircraft] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [aiFetching, setAiFetching] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [selectedAiComps, setSelectedAiComps] = useState(new Set());
  const [savingAi, setSavingAi] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ yearMin: '', yearMax: '', priceMin: '', priceMax: '', hoursMin: '', hoursMax: '', region: '', avionics: '' });
  const [showScrape, setShowScrape] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  const DEFAULT_SITES = [
    { id: 'trade-a-plane', label: 'Trade-A-Plane', url: 'trade-a-plane.com' },
    { id: 'controller', label: 'Controller', url: 'controller.com' },
    { id: 'hangar67', label: 'Hangar 67', url: 'hangar67.com' },
    { id: 'aircraftforsale', label: 'Aircraft For Sale', url: 'aircraftforsale.com' },
    { id: 'airmart', label: 'AirMart', url: 'airmart.com' },
    { id: 'barnstormers', label: 'Barnstormers', url: 'barnstormers.com' },
    { id: 'avbuyer', label: 'AvBuyer', url: 'avbuyer.com' },
  ];
  const [selectedSites, setSelectedSites] = useState(() => new Set(['trade-a-plane', 'controller', 'hangar67', 'aircraftforsale', 'airmart']));
  const [customUrls, setCustomUrls] = useState([]);
  const [newCustomUrl, setNewCustomUrl] = useState('');

  const toggleSite = (id) => setSelectedSites(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const addCustomUrl = () => {
    const trimmed = newCustomUrl.trim();
    if (!trimmed) return;
    setCustomUrls(prev => [...prev, trimmed]);
    setNewCustomUrl('');
  };

  const removeCustomUrl = (idx) => setCustomUrls(prev => prev.filter((_, i) => i !== idx));

  useEffect(() => {
    if (!aircraftId) return;
    base44.entities.Comp.filter({ aircraft_id: aircraftId }).then(setComps);
    base44.entities.Aircraft.filter({}).then(all => {
      const ac = all.find(a => a.id === aircraftId);
      setAircraft(ac || null);
      if (ac) {
        setFilters({
          yearMin: ac.year ? String(ac.year - 5) : '',
          yearMax: ac.year ? String(ac.year + 5) : '',
          priceMin: ac.asking_price ? String(Math.round(ac.asking_price * 0.6 / 1000) * 1000) : '',
          priceMax: ac.asking_price ? String(Math.round(ac.asking_price * 1.4 / 1000) * 1000) : '',
          hoursMin: ac.total_time ? String(Math.max(0, Math.round((ac.total_time - 2000) / 500) * 500)) : '',
          hoursMax: ac.total_time ? String(Math.round((ac.total_time + 2000) / 500) * 500) : '',
          region: '',
          avionics: ac.avionics_suite || '',
        });
      }
    });
  }, [aircraftId]);

  const updateFilter = (field, value) => setFilters(prev => ({ ...prev, [field]: value }));

  const handleAiFetchComps = async () => {
    setAiFetching(true);
    setShowFilters(false);
    const subjectReg = (aircraft.registration || '').trim().toUpperCase();
    const filterLines = [
      filters.yearMin || filters.yearMax ? `Year range: ${filters.yearMin || 'any'} – ${filters.yearMax || 'any'}` : null,
      filters.priceMin || filters.priceMax ? `Price range: $${filters.priceMin ? Number(filters.priceMin).toLocaleString() : '0'} – $${filters.priceMax ? Number(filters.priceMax).toLocaleString() : 'any'}` : null,
      filters.hoursMin || filters.hoursMax ? `Total time range: ${filters.hoursMin || '0'} – ${filters.hoursMax || 'any'} hrs` : null,
      filters.region ? `Preferred region: ${filters.region}` : null,
      filters.avionics ? `Preferred avionics: ${filters.avionics} — prioritize aircraft with similar or equivalent glass panel/avionics suite` : null,
    ].filter(Boolean).join('\n');

    const activeSites = DEFAULT_SITES.filter(s => selectedSites.has(s.id));
    const allSites = [
      ...activeSites.map(s => `${s.label} (${s.url})`),
      ...customUrls.map(u => `Custom site (${u})`),
    ];
    const siteList = allSites.length > 0 ? allSites.join(', ') : 'trade-a-plane.com, controller.com';

    const prompt = [
      `Search ${siteList} for current listings and recent sales of comparable aircraft to the following subject:`,
      ``,
      `Make: ${aircraft.make}`,
      `Model: ${aircraft.model}`,
      `Year: ${aircraft.year}`,
      `Engine Type: ${aircraft.engine_type || 'Piston'}`,
      `Avionics Suite: ${aircraft.avionics_suite || 'Unknown'}`,
      `Subject Registration: ${subjectReg}`,
      ``,
      `Search Filters (apply these constraints to narrow results):`,
      filterLines || 'No additional filters specified.',
      ``,
      `Find up to 12 real comparable aircraft listings or recent sales. For each comp, extract all available data. Focus on aircraft of the same make/model or close variants. Include both active listings and sold aircraft if available. Note the source for each comp.`,
      ``,
      `IMPORTANT: Do NOT include any listing where the registration number matches ${subjectReg} — that is the subject aircraft itself and must be excluded from comps.`,
    ].join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          comps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                make: { type: 'string' },
                model: { type: 'string' },
                year: { type: 'number' },
                registration: { type: 'string' },
                total_time: { type: 'number' },
                engine_time_smoh: { type: 'number' },
                asking_price: { type: 'number' },
                sold_price: { type: 'number' },
                location: { type: 'string' },
                source: { type: 'string' },
                source_url: { type: 'string' },
                status: { type: 'string' },
                similarity_score: { type: 'number' },
                notes: { type: 'string' }
              }
            }
          }
        }
      }
    });
    const rawComps = (result && result.comps) || [];
    const filtered = subjectReg
      ? rawComps.filter(c => !c.registration || c.registration.trim().toUpperCase() !== subjectReg)
      : rawComps;
    setAiResults(filtered);
    setSelectedAiComps(new Set(filtered.map((_, i) => i)));

    setAiFetching(false);
  };

  const handleScrapeLink = async () => {
    const url = scrapeUrl.trim();
    if (!url) return;
    setScraping(true);
    setScrapeError('');
    try {
      const prompt = [
        `Extract the aircraft listing details from this specific page URL: ${url}`,
        ``,
        `Return a single comparable aircraft record with all available fields. Determine the source site name (e.g. Trade-A-Plane, Controller, Hangar 67, Barnstormers, AvBuyer, etc.) from the URL. The source_url must be exactly the URL provided. If the listing is marked sold or no longer active, set status to "Sold", otherwise "Active Listing". Estimate similarity_score 1-10 based on how similar the listing is to a ${aircraft?.year || ''} ${aircraft?.make || ''} ${aircraft?.model || ''} (subject). Put any extra observations in notes.`,
        ``,
        `Only return data that is actually present on the page. Leave fields empty/null if not found.`,
      ].join('\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            comps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  make: { type: 'string' },
                  model: { type: 'string' },
                  year: { type: 'number' },
                  registration: { type: 'string' },
                  total_time: { type: 'number' },
                  engine_time_smoh: { type: 'number' },
                  asking_price: { type: 'number' },
                  sold_price: { type: 'number' },
                  location: { type: 'string' },
                  source: { type: 'string' },
                  source_url: { type: 'string' },
                  status: { type: 'string' },
                  similarity_score: { type: 'number' },
                  notes: { type: 'string' }
                }
              }
            }
          }
        }
      });
      const found = ((result && result.comps) || []).filter(c => c && (c.make || c.model || c.asking_price || c.sold_price));
      if (found.length === 0) {
        setScrapeError('No listing details could be extracted from that URL. Try adding manually.');
      } else {
        setAiResults(found);
        setSelectedAiComps(new Set(found.map((_, i) => i)));
        setShowScrape(false);
        setScrapeUrl('');
      }
    } catch (e) {
      setScrapeError('Failed to scrape that link. Please try again or add manually.');
    }
    setScraping(false);
  };

  const toggleAiComp = (idx) => {
    setSelectedAiComps(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const numericCompFields = ['year', 'total_time', 'engine_time_smoh', 'asking_price', 'sold_price', 'days_on_market', 'similarity_score'];

  const handleSaveAiComps = async () => {
    setSavingAi(true);
    const toSave = aiResults.filter((_, i) => selectedAiComps.has(i));
    const created = await Promise.all(toSave.map(c => {
      const data = { ...c, aircraft_id: aircraftId };
      if (valuationRunId) data.valuation_run_id = valuationRunId;
      numericCompFields.forEach(f => {
        if (data[f] !== '' && data[f] != null) data[f] = Number(data[f]);
        else delete data[f];
      });
      return base44.entities.Comp.create(data);
    }));
    setComps(prev => [...prev, ...created]);
    setAiResults(null);
    setSelectedAiComps(new Set());
    setSavingAi(false);
  };

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
    try {
      await base44.entities.Comp.delete(id);
    } catch (e) {
      // Already deleted or not found — still remove from UI
    }
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
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowFilters(v => !v)} className="gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setShowScrape(v => !v); setScrapeError(''); }} className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Scrape from Link
          </Button>
          <Button size="sm" variant="outline" onClick={handleAiFetchComps} disabled={aiFetching || !aircraft} className="gap-2">
            {aiFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {aiFetching ? 'Searching...' : 'AI Fetch Comps'}
          </Button>
          <Button size="sm" onClick={() => { setDraft(emptyComp(aircraftId)); setAdding(true); setAiResults(null); }} className="gap-2">
            <Plus className="w-4 h-4" />Add Manually
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search Filters</p>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Sites to Search</Label>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {DEFAULT_SITES.map(site => (
                <label key={site.id} className="flex items-center gap-1.5 cursor-pointer select-none text-sm">
                  <Checkbox checked={selectedSites.has(site.id)} onCheckedChange={() => toggleSite(site.id)} />
                  {site.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Add Custom Site / URL</Label>
            <div className="flex gap-2">
              <Input value={newCustomUrl} onChange={e => setNewCustomUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomUrl()} placeholder="e.g. globalair.com or https://example.com/listings" className="flex-1" />
              <Button size="sm" variant="outline" onClick={addCustomUrl}>Add</Button>
            </div>
            {customUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {customUrls.map((u, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs bg-background border border-border rounded-full px-3 py-1">
                    {u}
                    <button onClick={() => removeCustomUrl(i)} className="text-muted-foreground hover:text-destructive ml-1"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Year Min</Label>
              <Input type="number" value={filters.yearMin} onChange={e => updateFilter('yearMin', e.target.value)} placeholder="e.g. 1970" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Year Max</Label>
              <Input type="number" value={filters.yearMax} onChange={e => updateFilter('yearMax', e.target.value)} placeholder="e.g. 1985" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Price Min ($)</Label>
              <Input type="number" value={filters.priceMin} onChange={e => updateFilter('priceMin', e.target.value)} placeholder="e.g. 150000" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Price Max ($)</Label>
              <Input type="number" value={filters.priceMax} onChange={e => updateFilter('priceMax', e.target.value)} placeholder="e.g. 500000" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Total Time Min (hrs)</Label>
              <Input type="number" value={filters.hoursMin} onChange={e => updateFilter('hoursMin', e.target.value)} placeholder="e.g. 3000" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Total Time Max (hrs)</Label>
              <Input type="number" value={filters.hoursMax} onChange={e => updateFilter('hoursMax', e.target.value)} placeholder="e.g. 8000" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Region / State (optional)</Label>
              <Input value={filters.region} onChange={e => updateFilter('region', e.target.value)} placeholder="e.g. Northeast, Southeast, Texas..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Avionics (optional)</Label>
              <Input value={filters.avionics} onChange={e => updateFilter('avionics', e.target.value)} placeholder="e.g. Garmin G1000" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Adjust sites and filters, then click <strong>AI Fetch Comps</strong>.</p>
        </div>
      )}

      {showScrape && (
        <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scrape a Single Listing</p>
          <p className="text-xs text-muted-foreground">Paste a direct link to an aircraft listing (e.g. on Trade-A-Plane, Controller, etc.) and we'll extract the details into a comp.</p>
          <div className="flex gap-2">
            <Input
              value={scrapeUrl}
              onChange={e => setScrapeUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScrapeLink()}
              placeholder="https://www.trade-a-plane.com/listing/..."
              className="flex-1"
              type="url"
            />
            <Button size="sm" onClick={handleScrapeLink} disabled={scraping || !scrapeUrl.trim()} className="gap-2">
              {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              {scraping ? 'Extracting...' : 'Extract'}
            </Button>
          </div>
          {scrapeError && <p className="text-xs text-destructive">{scrapeError}</p>}
        </div>
      )}

      {aiResults && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900">AI-Found Comparables</p>
              <p className="text-xs text-blue-700 mt-0.5">Sources: Trade-A-Plane, Controller, Hangar 67, Aircraft For Sale, AirMart. Select the comps you want to save.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setAiResults(null)}>Dismiss</Button>
              <Button size="sm" onClick={handleSaveAiComps} disabled={savingAi || selectedAiComps.size === 0} className="gap-2">
                {savingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save {selectedAiComps.size} Selected
              </Button>
            </div>
          </div>
          {aiResults.length === 0 && <p className="text-sm text-blue-700">No comparables found. Try adding manually.</p>}
          <div className="space-y-2">
            {aiResults.map((comp, idx) => (
              <div
                key={idx}
                onClick={() => toggleAiComp(idx)}
                className={`flex items-start gap-3 bg-white border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedAiComps.has(idx) ? 'border-blue-400' : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {selectedAiComps.has(idx)
                    ? <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    : <Circle className="w-5 h-5 text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{comp.year} {comp.make} {comp.model} {comp.registration && `(${comp.registration})`}</p>
                    <div className="text-right shrink-0">
                      {comp.sold_price ? <p className="text-sm font-semibold text-green-700">{fmt(comp.sold_price)} sold</p> : null}
                      {comp.asking_price ? <p className="text-xs text-muted-foreground">{fmt(comp.asking_price)} asking</p> : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground mt-1">
                    {comp.source && <span>{comp.source}</span>}
                    {comp.status && <span>{comp.status}</span>}
                    {comp.total_time && <span>TT: {comp.total_time.toLocaleString()} hrs</span>}
                    {comp.engine_time_smoh && <span>SMOH: {comp.engine_time_smoh.toLocaleString()} hrs</span>}
                    {comp.location && <span>{comp.location}</span>}
                    {comp.similarity_score && <span>Similarity: {comp.similarity_score}/10</span>}
                  </div>
                  {comp.notes && <p className="text-xs text-muted-foreground italic mt-1">{comp.notes}</p>}
                </div>
                {comp.source_url && (
                  <a href={comp.source_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                    <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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