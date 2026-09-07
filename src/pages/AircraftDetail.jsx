import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Accordion } from "@/components/ui/accordion";
import { ArrowLeft, Save, Trash2, Plus, Upload, X, GripVertical, Sparkles, Copy, Check as CheckIcon } from "lucide-react";
import LogbookDriveSync from "@/components/aircraft/LogbookDriveSync";
import CollapsibleSection from "@/components/aircraft/CollapsibleSection";
import EraClassification from "@/components/aircraft/EraClassification";
import OnlineListingDescription from "@/components/aircraft/OnlineListingDescription";
import { compressImage } from "@/utils/compressImage";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import StatusBadge from "../components/StatusBadge";

const MAKES = ["Cessna", "Piper", "Beechcraft", "Cirrus", "Mooney", "Diamond", "Socata", "Grumman", "Globe", "Aero Commander", "Commander", "Meyers", "Stinson", "Vans Aircraft", "Glasair", "Pilatus", "TBM", "Daher", "Epic", "Quest", "Textron", "Hawker", "Embraer", "Bombardier", "Gulfstream", "Dassault", "Waco", "Other"];
const ENGINE_TYPES = ["Piston", "Turbo", "Turboprop", "Turbojet", "Turbofan"];
const CONDITIONS = ["New/Refurbished", "Excellent", "Good", "Fair", "Poor"];
const STATUSES = ["Coming Soon", "Available", "For Lease", "Under Contract", "Closing", "Sold", "Off Market", "Appraisal Only"];
const AVIONICS = ["Garmin G1000", "Garmin G3X", "Garmin GTN 750/650", "Avidyne IFD", "Aspen EFD", "King Digital", "Collins Pro Line", "Honeywell Primus", "Steam Gauges", "Mixed/Upgraded", "Other"];
const DAMAGE = ["None", "Minor", "Major", "Unknown"];

const SECTION_VALUES = ["visibility", "details", "engine", "additional", "performance", "avionics", "condition", "photos", "description", "online_listing", "logbooks"];

// Defined OUTSIDE the component to prevent remounting on every render
const Field = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-bold text-muted-foreground">{label}</Label>
    <Input type={type} value={value} onChange={onChange} placeholder={placeholder} />
  </div>
);

const SelectField = ({ label, value, onValueChange, options }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-bold text-muted-foreground">{label}</Label>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
      <SelectContent>
        {options.map(o => <SelectItem key={o} value={String(o)}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  </div>
);

export default function AircraftDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [form, setForm] = useState({
    registration: '', make: '', model: '', year: '', serial_number: '',
    total_time: '', engine_time_smoh: '', engine_time_type: 'SMOH', engine_manufacturer: '', engine_model: '', num_engines: '1', engine_type: '',
    engine_top_overhaul: '', engine_time_since_new: '',
    engine2_model: '',
    propeller_manufacturer: '', propeller_model: '', propeller_time: '',
    engine2_time_smoh: '', engine2_time_type: 'SMOH', engine2_manufacturer: '',
    engine2_top_overhaul: '', engine2_time_since_new: '',
    propeller2_manufacturer: '', propeller2_model: '', propeller2_time: '',
    avionics_suite: '', avionics_details: '',
    interior_condition: '', exterior_condition: '', paint_year: '', interior_year: '',
    damage_history: 'None', damage_details: '', annual_due: '', adsb_compliant: false, factory_air_conditioning: false,
    useful_load: '', fuel_capacity: '', cruise_speed: '', stall_speed: '', max_speed: '', range_nm: '', service_ceiling: '', rate_of_climb: '', takeoff_distance: '', landing_distance: '', fuel_burn_gph: '', empty_weight: '', max_takeoff_weight: '', wingspan_ft: '', length_ft: '', payload_lbs: '', asking_price: '', status: 'Available',
    location: '', notes: '', show_on_public: false,
    published_sites: [], price_drop: '', num_engines: 'Single'
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [clients, setClients] = useState([]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [fetchingSpecs, setFetchingSpecs] = useState(false);
  const [copiedSocial, setCopiedSocial] = useState(false);

  const addInstrument = () => update('instruments', [...(form.instruments || []), { name: '', make: '', model: '', serial_number: '', condition: '', last_calibration: '', notes: '' }]);
  const updateInstrument = (idx, field, value) => {
  const updated = [...(form.instruments || [])];
  updated[idx] = { ...updated[idx], [field]: value };
  update('instruments', updated);
  };
  const removeInstrument = (idx) => update('instruments', (form.instruments || []).filter((_, i) => i !== idx));

  useEffect(() => {
    base44.entities.Client.list('last_name').then(setClients).catch(() => {});
    if (!isNew) {
      base44.entities.Aircraft.list().then(data => {
        const found = data.find(a => a.id === id);
        if (found) setForm(prev => ({ ...prev, ...found }));
        setLoading(false);
      });
    }
  }, [id, isNew]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleSite = (site) => {
    const current = form.published_sites || [];
    const next = current.includes(site)
      ? current.filter(s => s !== site)
      : [...current, site];
    update('published_sites', next);
  };

  const PUBLISHED_SITES = [
    { value: 'clearblue', label: 'ClearBlue Aero', desc: 'clearblueaero.com' },
    { value: 'beechcraft', label: 'Beechcraft Buyers', desc: 'beechcraftbuyers.com' },
    { value: 'gardner', label: 'Gardner Aircraft Sales', desc: 'New rebranded site' },
  ];

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImage(true);
    for (const file of files) {
      const compressed = await compressImage(file);
      const { file_url } = await base44.integrations.Core.UploadFile({ file: compressed });
      // Auto-generate SEO alt text describing the photo content
      let alt = "";
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `Write concise, SEO-friendly alt text (under 80 characters) describing what is visible in this photo of a ${form.year || ""} ${form.make || ""} ${form.model || ""} aircraft${form.registration ? ` (${form.registration})` : ""}. Describe the specific visible content (e.g., exterior on ramp, cockpit panel, engine, cabin interior, wing detail). Do NOT include the aircraft's make, model, or registration in the text.`,
          file_urls: [file_url],
          response_json_schema: { type: "object", properties: { alt: { type: "string" } } },
        });
        alt = res?.alt ? String(res.alt).trim() : "";
      } catch (_) { alt = ""; }
      setForm(prev => ({
        ...prev,
        images: [...(prev.images || []), file_url],
        image_alts: [...(prev.image_alts || []), alt],
      }));
    }
    setUploadingImage(false);
  };

  const removeImage = (idx) => {
    setForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== idx),
      image_alts: (prev.image_alts || []).filter((_, i) => i !== idx),
    }));
  };

  const handleImageDragEnd = (result) => {
    if (!result.destination) return;
    const imgs = Array.from(form.images || []);
    const [moved] = imgs.splice(result.source.index, 1);
    imgs.splice(result.destination.index, 0, moved);
    const alts = Array.from(form.image_alts || []);
    if (alts.length === imgs.length) {
      const [movedAlt] = alts.splice(result.source.index, 1);
      alts.splice(result.destination.index, 0, movedAlt);
    }
    setForm(prev => ({ ...prev, images: imgs, image_alts: alts }));
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    ['year', 'total_time', 'engine_time_smoh', 'propeller_time', 'paint_year',
     'interior_year', 'useful_load', 'fuel_capacity', 'asking_price',
     'engine2_time_smoh', 'engine_top_overhaul', 'engine_time_since_new', 'engine2_top_overhaul', 'engine2_time_since_new', 'propeller2_time', 'price_drop',
     'cruise_speed', 'stall_speed', 'max_speed', 'range_nm', 'service_ceiling', 'rate_of_climb', 'takeoff_distance', 'landing_distance', 'fuel_burn_gph', 'empty_weight', 'max_takeoff_weight', 'wingspan_ft', 'length_ft', 'payload_lbs'].forEach(f => { if (f === 'num_engines') return;
     if (data[f] !== '' && data[f] != null) data[f] = Number(data[f]);
     else data[f] = null;
    });
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;

    if (isNew) {
      await base44.entities.Aircraft.create(data);
    } else {
      await base44.entities.Aircraft.update(id, data);
    }
    setSaving(false);
    navigate('/aircraft');
  };

  const generateAIDescription = async () => {
    setGeneratingAI(true);
    setAiResult(null);
    try {
      const specs = [
        form.year && form.make && form.model ? `${form.year} ${form.make} ${form.model}` : null,
        form.registration ? `Registration: ${form.registration}` : null,
        form.total_time ? `Airframe Total Time: ${form.total_time} hrs` : null,
        form.engine_time_smoh ? `Engine Time: ${form.engine_time_smoh} hrs ${form.engine_time_type || 'SMOH'}` : null,
        form.engine_manufacturer || form.engine_model ? `Engine: ${[form.engine_manufacturer, form.engine_model].filter(Boolean).join(' ')}` : null,
        form.engine_type ? `Engine Type: ${form.engine_type}` : null,
        form.avionics_suite ? `Avionics: ${form.avionics_suite}` : null,
        form.avionics_details ? `Avionics Details: ${form.avionics_details}` : null,
        form.interior_condition ? `Interior: ${form.interior_condition}` : null,
        form.exterior_condition ? `Exterior: ${form.exterior_condition}` : null,
        form.paint_year ? `Paint Year: ${form.paint_year}` : null,
        form.interior_year ? `Interior Year: ${form.interior_year}` : null,
        form.adsb_compliant ? `ADS-B: Compliant` : null,
        form.damage_history ? `Damage History: ${form.damage_history}` : null,
        form.asking_price ? `Asking Price: $${Number(form.asking_price).toLocaleString()}` : null,
        form.location ? `Location: ${form.location}` : null,
        form.useful_load ? `Useful Load: ${form.useful_load} lbs` : null,
        form.fuel_capacity ? `Fuel Capacity: ${form.fuel_capacity} gal` : null,
      ].filter(Boolean).join('\n');

      const result = await base44.functions.invoke('generateAircraftDescription', { specs });
      setAiResult(result.data);
    } catch (error) {
      console.error('AI generation error:', error);
      alert('Failed to generate description. Please try again.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const fetchManufacturerSpecs = async () => {
    if (!form.make || !form.model) {
      alert('Please enter the Make and Model first so the AI can look up the correct aircraft.');
      return;
    }
    setFetchingSpecs(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Retrieve the manufacturer-published performance specifications for the ${form.year ? form.year + ' ' : ''}${form.make} ${form.model} aircraft. Return only numeric values using these exact units, and use null for any spec that is not published for this model: useful load (lbs), fuel capacity (gallons), cruise speed (knots), stall speed (knots), max speed (knots), range (nautical miles), service ceiling (feet), rate of climb (feet per minute), takeoff distance over a 50-foot obstacle (feet), landing distance over a 50-foot obstacle (feet), typical fuel burn (gallons per hour), empty weight (lbs), max takeoff weight (lbs), wingspan (feet), length (feet), useful payload (lbs).`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: "object",
          properties: {
            useful_load: { type: "number" },
            fuel_capacity: { type: "number" },
            cruise_speed: { type: "number" },
            stall_speed: { type: "number" },
            max_speed: { type: "number" },
            range_nm: { type: "number" },
            service_ceiling: { type: "number" },
            rate_of_climb: { type: "number" },
            takeoff_distance: { type: "number" },
            landing_distance: { type: "number" },
            fuel_burn_gph: { type: "number" },
            empty_weight: { type: "number" },
            max_takeoff_weight: { type: "number" },
            wingspan_ft: { type: "number" },
            length_ft: { type: "number" },
            payload_lbs: { type: "number" }
          }
        }
      });
      const specs = result || {};
      const num = v => (v == null || v === '') ? '' : Number(v);
      setForm(prev => ({
        ...prev,
        useful_load: specs.useful_load != null ? num(specs.useful_load) : prev.useful_load,
        fuel_capacity: specs.fuel_capacity != null ? num(specs.fuel_capacity) : prev.fuel_capacity,
        cruise_speed: specs.cruise_speed != null ? num(specs.cruise_speed) : prev.cruise_speed,
        stall_speed: specs.stall_speed != null ? num(specs.stall_speed) : prev.stall_speed,
        max_speed: specs.max_speed != null ? num(specs.max_speed) : prev.max_speed,
        range_nm: specs.range_nm != null ? num(specs.range_nm) : prev.range_nm,
        service_ceiling: specs.service_ceiling != null ? num(specs.service_ceiling) : prev.service_ceiling,
        rate_of_climb: specs.rate_of_climb != null ? num(specs.rate_of_climb) : prev.rate_of_climb,
        takeoff_distance: specs.takeoff_distance != null ? num(specs.takeoff_distance) : prev.takeoff_distance,
        landing_distance: specs.landing_distance != null ? num(specs.landing_distance) : prev.landing_distance,
        fuel_burn_gph: specs.fuel_burn_gph != null ? num(specs.fuel_burn_gph) : prev.fuel_burn_gph,
        empty_weight: specs.empty_weight != null ? num(specs.empty_weight) : prev.empty_weight,
        max_takeoff_weight: specs.max_takeoff_weight != null ? num(specs.max_takeoff_weight) : prev.max_takeoff_weight,
        wingspan_ft: specs.wingspan_ft != null ? num(specs.wingspan_ft) : prev.wingspan_ft,
        length_ft: specs.length_ft != null ? num(specs.length_ft) : prev.length_ft,
        payload_lbs: specs.payload_lbs != null ? num(specs.payload_lbs) : prev.payload_lbs,
      }));
    } catch (error) {
      console.error('Specs fetch error:', error);
      alert('Could not retrieve manufacturer specs: ' + (error.message || 'Unknown error'));
    } finally {
      setFetchingSpecs(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSocial(true);
    setTimeout(() => setCopiedSocial(false), 2000);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this aircraft?')) {
      await base44.entities.Aircraft.delete(id);
      navigate('/aircraft');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/aircraft')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-semibold">
              {isNew ? 'New Aircraft' : `${form.year} ${form.make} ${form.model}`}
            </h1>
            {!isNew && <p className="text-sm text-muted-foreground">{form.registration}</p>}
          </div>
          {!isNew && <StatusBadge status={form.status} />}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={SECTION_VALUES} className="space-y-8">
        <CollapsibleSection value="visibility" title="Public Visibility">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Show on Public Inventory</p>
                <p className="text-xs text-muted-foreground mt-0.5">When enabled, this aircraft will appear on the public-facing inventory page.</p>
              </div>
              <Switch checked={form.show_on_public || false} onCheckedChange={v => update('show_on_public', v)} />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="text-sm font-medium text-foreground">Featured Aircraft</p>
                <p className="text-xs text-muted-foreground mt-0.5">Highlight this aircraft as a featured listing on the public homepage.</p>
              </div>
              <Switch checked={form.featured || false} onCheckedChange={v => update('featured', v)} disabled={!form.show_on_public} />
            </div>

            <div className="border-t border-border pt-4">
              <Label className="text-xs font-bold text-muted-foreground">Listing in Partnership with</Label>
              <Input
                className="mt-1.5 max-w-sm"
                value={form.listing_partner || ''}
                onChange={e => update('listing_partner', e.target.value)}
                placeholder="e.g. Airpower Inc., John Smith Aviation"
              />
              <p className="text-xs text-muted-foreground mt-1">If filled in, will appear on the public listing page.</p>
            </div>
            <div className="border-t border-border pt-4">
              <Label className="text-xs font-bold text-muted-foreground">Publish to Sites</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">Select which branded websites this aircraft should appear on.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PUBLISHED_SITES.map(s => {
                  const checked = (form.published_sites || []).includes(s.value);
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => toggleSite(s.value)}
                      disabled={!form.show_on_public}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        checked ? 'border-accent bg-accent/5' : 'border-border hover:border-muted-foreground/40'
                      }`}
                    >
                      <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-accent bg-accent text-white' : 'border-muted-foreground/30'}`}>
                        {checked && <CheckIcon className="h-3 w-3" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection value="details" title="Aircraft Details">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Registration (N-Number)" value={form.registration || ''} onChange={e => update('registration', e.target.value)} placeholder="N12345" />
            <SelectField label="Make" value={form.make || ''} onValueChange={v => update('make', v)} options={MAKES} />
            <Field label="Model" value={form.model || ''} onChange={e => update('model', e.target.value)} placeholder="172S" />
            <Field label="Year" value={form.year || ''} onChange={e => update('year', e.target.value)} type="number" placeholder="2005" />
            <Field label="Serial Number" value={form.serial_number || ''} onChange={e => update('serial_number', e.target.value)} placeholder="S/N" />
            <SelectField label="Status" value={form.status || ''} onValueChange={v => update('status', v)} options={STATUSES} />
            <Field label="Initial List Price" value={form.asking_price || ''} onChange={e => update('asking_price', e.target.value)} type="number" />
            <Field label="Price Drop" value={form.price_drop || ''} onChange={e => update('price_drop', e.target.value)} type="number" />
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Owner (Client)</Label>
              <Select value={form.seller_id || ''} onValueChange={v => update('seller_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select owner..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Field label="Location (Airport)" value={form.location || ''} onChange={e => update('location', e.target.value)} placeholder="KJFK" />
            <EraClassification year={form.year} />
          </div>
        </CollapsibleSection>

        <CollapsibleSection value="engine" title="Engine & Airframe">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Total Time (hrs)" value={form.total_time || ''} onChange={e => update('total_time', e.target.value)} type="number" />
            <div className="col-span-2 lg:col-span-4">
              <SelectField label="Engines" value={form.num_engines || 'Single'} onValueChange={v => update('num_engines', v)} options={["Single", "Multi-Engine"]} />
            </div>
            <div className="col-span-2 lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Engine Manufacturer" value={form.engine_manufacturer || ''} onChange={e => update('engine_manufacturer', e.target.value)} placeholder="e.g. Lycoming, Continental" />
              <Field label="Engine Model" value={form.engine_model || ''} onChange={e => update('engine_model', e.target.value)} placeholder="e.g. IO-360, TSIO-520" />
              <SelectField label="Engine Type" value={form.engine_type || ''} onValueChange={v => update('engine_type', v)} options={ENGINE_TYPES} />
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Engine 1 (hrs)</Label>
                <div className="flex gap-2">
                  <Input type="number" value={form.engine_time_smoh || ''} onChange={e => update('engine_time_smoh', e.target.value)} className="flex-1 min-w-0" />
                  <Select value={form.engine_time_type || 'SMOH'} onValueChange={v => update('engine_time_type', v)}>
                    <SelectTrigger className="w-20 shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMOH">SMOH</SelectItem>
                      <SelectItem value="SNEW">SNEW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Field label="Engine 1 Top Overhaul (hrs)" value={form.engine_top_overhaul || ''} onChange={e => update('engine_top_overhaul', e.target.value)} type="number" />
              <Field label="Engine 1 Time Since New (hrs)" value={form.engine_time_since_new || ''} onChange={e => update('engine_time_since_new', e.target.value)} type="number" />
            </div>
            <div className="col-span-2 lg:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Propeller Manufacturer" value={form.propeller_manufacturer || ''} onChange={e => update('propeller_manufacturer', e.target.value)} placeholder="e.g. Hartzell, McCauley" />
              <Field label="Propeller Model" value={form.propeller_model || ''} onChange={e => update('propeller_model', e.target.value)} placeholder="e.g. HC-C2YK-1BF" />
              <Field label="Propeller Total Time (hrs)" value={form.propeller_time || ''} onChange={e => update('propeller_time', e.target.value)} type="number" />
            </div>
            {form.num_engines === 'Multi-Engine' && (
              <>
                <div className="col-span-2 lg:col-span-4 border-t border-border pt-4 mt-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Engine 2</p>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <SelectField label="Engine 2 Type" value={form.engine2_type || ''} onValueChange={v => update('engine2_type', v)} options={ENGINE_TYPES} />
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">Engine 2 Time (hrs)</Label>
                      <div className="flex gap-2">
                        <Input type="number" value={form.engine2_time_smoh || ''} onChange={e => update('engine2_time_smoh', e.target.value)} className="flex-1" />
                        <Select value={form.engine2_time_type || 'SMOH'} onValueChange={v => update('engine2_time_type', v)}>
                          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SMOH">SMOH</SelectItem>
                            <SelectItem value="SNEW">SNEW</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Field label="Engine 2 Top Overhaul (hrs)" value={form.engine2_top_overhaul || ''} onChange={e => update('engine2_top_overhaul', e.target.value)} type="number" />
                    <Field label="Engine 2 Time Since New (hrs)" value={form.engine2_time_since_new || ''} onChange={e => update('engine2_time_since_new', e.target.value)} type="number" />
                    <Field label="Propeller 2 Total Time (hrs)" value={form.propeller2_time || ''} onChange={e => update('propeller2_time', e.target.value)} type="number" />
                  </div>
                </div>
              </>
            )}
            <div className="col-span-2 lg:col-span-3 grid grid-cols-2 lg:grid-cols-2 gap-4 border-t border-border pt-4">
              <Field label="Annual Due" value={form.annual_due || ''} onChange={e => update('annual_due', e.target.value)} type="date" />
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Factory Air Conditioning</Label>
                <Select value={form.factory_air_conditioning === true ? 'Yes' : form.factory_air_conditioning === false ? 'No' : ''} onValueChange={v => update('factory_air_conditioning', v === 'Yes')}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection value="additional" title="Additional">
          <Textarea value={form.other || ''} onChange={e => update('other', e.target.value)} rows={4} placeholder="Any additional relevant information..." />
        </CollapsibleSection>

        <CollapsibleSection
          value="performance"
          title="Performance"
          headerAction={
            <Button size="sm" variant="outline" className="gap-2" onClick={fetchManufacturerSpecs} disabled={fetchingSpecs}>
              <Sparkles className="w-4 h-4 text-amber-500" />
              {fetchingSpecs ? 'Retrieving...' : 'Fetch Manufacturer Specs'}
            </Button>
          }
        >
          <p className="text-xs text-muted-foreground mb-4">Enter the make and model above, then click "Fetch Manufacturer Specs" to auto-fill published performance data from the manufacturer using AI.</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Useful Load (lbs)" value={form.useful_load || ''} onChange={e => update('useful_load', e.target.value)} type="number" />
            <Field label="Fuel Capacity (gal)" value={form.fuel_capacity || ''} onChange={e => update('fuel_capacity', e.target.value)} type="number" />
            <Field label="Cruise Speed (kts)" value={form.cruise_speed || ''} onChange={e => update('cruise_speed', e.target.value)} type="number" />
            <Field label="Max Speed (kts)" value={form.max_speed || ''} onChange={e => update('max_speed', e.target.value)} type="number" />
            <Field label="Stall Speed (kts)" value={form.stall_speed || ''} onChange={e => update('stall_speed', e.target.value)} type="number" />
            <Field label="Range (nm)" value={form.range_nm || ''} onChange={e => update('range_nm', e.target.value)} type="number" />
            <Field label="Service Ceiling (ft)" value={form.service_ceiling || ''} onChange={e => update('service_ceiling', e.target.value)} type="number" />
            <Field label="Rate of Climb (fpm)" value={form.rate_of_climb || ''} onChange={e => update('rate_of_climb', e.target.value)} type="number" />
            <Field label="Takeoff Distance (ft)" value={form.takeoff_distance || ''} onChange={e => update('takeoff_distance', e.target.value)} type="number" />
            <Field label="Landing Distance (ft)" value={form.landing_distance || ''} onChange={e => update('landing_distance', e.target.value)} type="number" />
            <Field label="Fuel Burn (gph)" value={form.fuel_burn_gph || ''} onChange={e => update('fuel_burn_gph', e.target.value)} type="number" />
            <Field label="Empty Weight (lbs)" value={form.empty_weight || ''} onChange={e => update('empty_weight', e.target.value)} type="number" />
            <Field label="Max Takeoff Weight (lbs)" value={form.max_takeoff_weight || ''} onChange={e => update('max_takeoff_weight', e.target.value)} type="number" />
            <Field label="Payload (lbs)" value={form.payload_lbs || ''} onChange={e => update('payload_lbs', e.target.value)} type="number" />
            <Field label="Wingspan (ft)" value={form.wingspan_ft || ''} onChange={e => update('wingspan_ft', e.target.value)} type="number" />
            <Field label="Length (ft)" value={form.length_ft || ''} onChange={e => update('length_ft', e.target.value)} type="number" />
          </div>
        </CollapsibleSection>

        <CollapsibleSection value="avionics" title="Avionics & Instruments">
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Avionics Suite" value={form.avionics_suite || ''} onValueChange={v => update('avionics_suite', v)} options={AVIONICS} />
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={form.adsb_compliant || false} onCheckedChange={v => update('adsb_compliant', v)} />
              <Label>ADS-B Out Compliant</Label>
            </div>
          </div>
          <div className="mt-4">
            <Label className="text-xs font-bold text-muted-foreground">Avionics Details</Label>
            <Textarea value={form.avionics_details || ''} onChange={e => update('avionics_details', e.target.value)} className="mt-1.5" rows={3} />
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Individual Instruments</Label>
              <Button size="sm" variant="outline" className="gap-2" onClick={addInstrument}>
                <Plus className="w-4 h-4" />Add Instrument
              </Button>
            </div>
            {(!form.instruments || form.instruments.length === 0) && (
              <p className="text-sm text-muted-foreground">No instruments added yet.</p>
            )}
            <div className="space-y-4">
              {(form.instruments || []).map((inst, idx) => (
                <div key={idx} className="border border-border rounded-lg p-4 relative">
                  <button onClick={() => removeInstrument(idx)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <Field label="Instrument Name" value={inst.name || ''} onChange={e => updateInstrument(idx, 'name', e.target.value)} placeholder="e.g. Altimeter, VOR, GPS..." />
                    <Field label="Make / Manufacturer" value={inst.make || ''} onChange={e => updateInstrument(idx, 'make', e.target.value)} />
                    <Field label="Model" value={inst.model || ''} onChange={e => updateInstrument(idx, 'model', e.target.value)} />
                    <Field label="Serial Number" value={inst.serial_number || ''} onChange={e => updateInstrument(idx, 'serial_number', e.target.value)} />
                    <SelectField label="Condition" value={inst.condition || ''} onValueChange={v => updateInstrument(idx, 'condition', v)} options={['New','Excellent','Good','Fair','Poor','Inoperative']} />
                    <Field label="Last Calibration / Check" value={inst.last_calibration || ''} onChange={e => updateInstrument(idx, 'last_calibration', e.target.value)} type="date" />
                    <div className="lg:col-span-3">
                      <Field label="Notes" value={inst.notes || ''} onChange={e => updateInstrument(idx, 'notes', e.target.value)} placeholder="Optional notes..." />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection value="condition" title="Condition">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectField label="Interior Condition" value={form.interior_condition || ''} onValueChange={v => update('interior_condition', v)} options={CONDITIONS} />
            <SelectField label="Exterior Condition" value={form.exterior_condition || ''} onValueChange={v => update('exterior_condition', v)} options={CONDITIONS} />
            <Field label="Paint Year" value={form.paint_year || ''} onChange={e => update('paint_year', e.target.value)} type="number" />
            <Field label="Interior Year" value={form.interior_year || ''} onChange={e => update('interior_year', e.target.value)} type="number" />
            <SelectField label="Damage History" value={form.damage_history || ''} onValueChange={v => update('damage_history', v)} options={DAMAGE} />
          </div>
          {form.damage_history !== 'None' && (
            <div className="mt-4">
              <Label className="text-xs font-bold text-muted-foreground">Damage Details</Label>
              <Textarea value={form.damage_details || ''} onChange={e => update('damage_details', e.target.value)} className="mt-1.5" rows={3} />
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          value="photos"
          title="Aircraft Photos"
          headerAction={
            <label className="cursor-pointer">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors">
                {uploadingImage ? 'Compressing & Uploading...' : <><Upload className="w-4 h-4" /> Upload Photos</>}
              </span>
            </label>
          }
        >
          {(!form.images || form.images.length === 0) ? (
            <p className="text-sm text-muted-foreground">No photos uploaded yet. Photos will appear on the public inventory listing.</p>
          ) : (
            <DragDropContext onDragEnd={handleImageDragEnd}>
              <Droppable droppableId="photos" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex gap-3 overflow-x-auto pb-2"
                  >
                    {(form.images || []).map((url, idx) => (
                      <Draggable key={url + idx} draggableId={url + idx} index={idx}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`relative group rounded-lg overflow-hidden border border-border shrink-0 ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-accent opacity-90' : ''
                            }`}
                            style={{ width: '160px', height: '100px', ...provided.draggableProps.style }}
                          >
                            <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                            <div
                              {...provided.dragHandleProps}
                              className="absolute top-1 left-1 bg-black/50 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="w-3 h-3" />
                            </div>
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">Cover</span>
                            )}
                            <button
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
          {(form.images || []).length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">Drag photos to reorder. First photo is the cover image.</p>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          value="description"
          title="Description"
          headerAction={
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={generateAIDescription}
              disabled={generatingAI}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              {generatingAI ? 'Generating...' : 'Generate with AI'}
            </Button>
          }
        >
          <Textarea value={form.notes || ''} onChange={e => update('notes', e.target.value)} rows={5} placeholder="Description of this aircraft..." />

          {/* AI Result Panel */}
          {aiResult && (
            <div className="mt-5 space-y-4 border-t border-border pt-5">
              {/* Sales Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Sales Description</p>
                  <Button size="sm" variant="ghost" className="gap-1 text-xs h-7"
                    onClick={() => { update('notes', aiResult.description); setAiResult(null); }}>
                    Use This
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {aiResult.description}
                </div>
              </div>

              {/* Social Media Post */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Social Media Post</p>
                  <Button size="sm" variant="ghost" className="gap-1 text-xs h-7"
                    onClick={() => copyToClipboard(aiResult.social_post)}>
                    {copiedSocial ? <><CheckIcon className="w-3.5 h-3.5 text-green-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </Button>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {aiResult.social_post}
                </div>
              </div>

              <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => setAiResult(null)}>
                Dismiss
              </Button>
            </div>
          )}
        </CollapsibleSection>

        <OnlineListingDescription form={form} update={update} />

        <CollapsibleSection value="logbooks" title="Scanned Logbooks">
          <p className="text-xs text-muted-foreground mb-4">Add URLs and sync them to your Google Drive for cloud backup.</p>
          <LogbookDriveSync
            logbook_urls={form.logbook_urls || []}
            onChange={urls => update('logbook_urls', urls)}
            aircraftTitle={form.year && form.make && form.model ? `${form.year} ${form.make} ${form.model}` : form.registration || 'Aircraft'}
          />
        </CollapsibleSection>
      </Accordion>
    </div>
  );
}