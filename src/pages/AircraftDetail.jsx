import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Trash2, Plus, Upload, X, GripVertical, Sparkles, Copy, Check as CheckIcon } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import StatusBadge from "../components/StatusBadge";

const MAKES = ["Cessna", "Piper", "Beechcraft", "Cirrus", "Mooney", "Diamond", "Socata", "Grumman", "Commander", "Pilatus", "TBM", "Daher", "Epic", "Quest", "Textron", "Hawker", "Embraer", "Bombardier", "Gulfstream", "Dassault", "Other"];
const ENGINE_TYPES = ["Piston", "Turboprop", "Turbojet", "Turbofan"];
const CONDITIONS = ["New/Refurbished", "Excellent", "Good", "Fair", "Poor"];
const STATUSES = ["Available", "Under Contract", "Sold", "Off Market", "Appraisal Only"];
const AVIONICS = ["Garmin G1000", "Garmin G3X", "Garmin GTN 750/650", "Avidyne IFD", "Aspen EFD", "King Digital", "Collins Pro Line", "Honeywell Primus", "Steam Gauges", "Mixed/Upgraded", "Other"];
const DAMAGE = ["None", "Minor", "Major", "Unknown"];

// Defined OUTSIDE the component to prevent remounting on every render
const Field = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    <Input type={type} value={value} onChange={onChange} placeholder={placeholder} />
  </div>
);

const SelectField = ({ label, value, onValueChange, options }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
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
    engine2_model: '',
    propeller_manufacturer: '', propeller_model: '', propeller_time: '',
    engine2_time_smoh: '', engine2_time_type: 'SMOH', engine2_manufacturer: '',
    propeller2_manufacturer: '', propeller2_model: '', propeller2_time: '',
    avionics_suite: '', avionics_details: '',
    interior_condition: '', exterior_condition: '', paint_year: '', interior_year: '',
    damage_history: 'None', damage_details: '', annual_due: '', adsb_compliant: false,
    useful_load: '', fuel_capacity: '', asking_price: '', status: 'Available',
    location: '', notes: '', show_on_public: false
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [clients, setClients] = useState([]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiResult, setAiResult] = useState(null);
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImage(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({ ...prev, images: [...(prev.images || []), file_url] }));
    }
    setUploadingImage(false);
  };

  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== idx) }));
  };

  const handleImageDragEnd = (result) => {
    if (!result.destination) return;
    const imgs = Array.from(form.images || []);
    const [moved] = imgs.splice(result.source.index, 1);
    imgs.splice(result.destination.index, 0, moved);
    setForm(prev => ({ ...prev, images: imgs }));
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    ['year', 'total_time', 'engine_time_smoh', 'num_engines', 'propeller_time', 'paint_year',
     'interior_year', 'useful_load', 'fuel_capacity', 'asking_price',
     'engine2_time_smoh', 'propeller2_time'].forEach(f => {
      if (data[f] !== '' && data[f] != null) data[f] = Number(data[f]);
      else delete data[f];
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

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional aircraft sales copywriter for ClearBlue Aero, a reputable aviation brokerage.

Using the aircraft specifications below, write TWO pieces of copy:

1. A compelling SALES DESCRIPTION (3-5 paragraphs) for the listing page. It should be engaging, highlight the aircraft's best features, speak to serious buyers, and be suitable for a professional aviation brokerage website.

2. A SOCIAL MEDIA POST (suitable for Facebook/Instagram) that is punchy, exciting, uses 3-5 relevant aviation emojis, and ends with relevant hashtags like #aviation #aircraftforsale #generalaviation #ClearBlueAero.

Aircraft Specs:
${specs}

Return JSON with keys: "description" and "social_post".`,
      response_json_schema: {
        type: "object",
        properties: {
          description: { type: "string" },
          social_post: { type: "string" }
        }
      }
    });
    setAiResult(result);
    setGeneratingAI(false);
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
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
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

      <div className="space-y-8">
        {/* Public Visibility */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Public Visibility</h2>
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
          </div>
        </section>

        {/* Basic Info */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Aircraft Details</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Registration (N-Number)" value={form.registration || ''} onChange={e => update('registration', e.target.value)} placeholder="N12345" />
            <SelectField label="Make" value={form.make || ''} onValueChange={v => update('make', v)} options={MAKES} />
            <Field label="Model" value={form.model || ''} onChange={e => update('model', e.target.value)} placeholder="172S" />
            <Field label="Year" value={form.year || ''} onChange={e => update('year', e.target.value)} type="number" placeholder="2005" />
            <Field label="Serial Number" value={form.serial_number || ''} onChange={e => update('serial_number', e.target.value)} placeholder="S/N" />
            <SelectField label="Status" value={form.status || ''} onValueChange={v => update('status', v)} options={STATUSES} />
            <Field label="Location (Airport)" value={form.location || ''} onChange={e => update('location', e.target.value)} placeholder="KJFK" />
            <Field label="Asking Price" value={form.asking_price || ''} onChange={e => update('asking_price', e.target.value)} type="number" />
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Seller (Client)</Label>
              <Select value={form.seller_id || ''} onValueChange={v => update('seller_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select seller..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>— None —</SelectItem>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Engine & Airframe */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Engine & Airframe</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Total Time (hrs)" value={form.total_time || ''} onChange={e => update('total_time', e.target.value)} type="number" />
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Engine Time (hrs)</Label>
              <div className="flex gap-2">
                <Input type="number" value={form.engine_time_smoh || ''} onChange={e => update('engine_time_smoh', e.target.value)} className="flex-1" />
                <Select value={form.engine_time_type || 'SMOH'} onValueChange={v => update('engine_time_type', v)}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMOH">SMOH</SelectItem>
                    <SelectItem value="SNEW">SNEW</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Field label="Engine Manufacturer" value={form.engine_manufacturer || ''} onChange={e => update('engine_manufacturer', e.target.value)} placeholder="e.g. Lycoming, Continental" />
            <Field label="Engine Model" value={form.engine_model || ''} onChange={e => update('engine_model', e.target.value)} placeholder="e.g. IO-360, TSIO-520" />
            <SelectField label="Number of Engines" value={String(form.num_engines || '1')} onValueChange={v => update('num_engines', v)} options={[1, 2, 3, 4]} />
            <SelectField label="Engine Type" value={form.engine_type || ''} onValueChange={v => update('engine_type', v)} options={ENGINE_TYPES} />
            <Field label="Propeller Manufacturer" value={form.propeller_manufacturer || ''} onChange={e => update('propeller_manufacturer', e.target.value)} placeholder="e.g. Hartzell, McCauley" />
            <Field label="Propeller Model" value={form.propeller_model || ''} onChange={e => update('propeller_model', e.target.value)} placeholder="e.g. HC-C2YK-1BF" />
            <Field label="Propeller Total Time (hrs)" value={form.propeller_time || ''} onChange={e => update('propeller_time', e.target.value)} type="number" />
            {Number(form.num_engines) >= 2 && (
              <>
                <div className="col-span-2 lg:col-span-4 border-t border-border pt-4 mt-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Engine 2</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Field label="Engine 2 Manufacturer" value={form.engine2_manufacturer || ''} onChange={e => update('engine2_manufacturer', e.target.value)} placeholder="e.g. Lycoming, Continental" />
                    <Field label="Engine 2 Model" value={form.engine2_model || ''} onChange={e => update('engine2_model', e.target.value)} placeholder="e.g. IO-360, TSIO-520" />
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Engine 2 Time (hrs)</Label>
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
                    <Field label="Propeller 2 Manufacturer" value={form.propeller2_manufacturer || ''} onChange={e => update('propeller2_manufacturer', e.target.value)} placeholder="e.g. Hartzell, McCauley" />
                    <Field label="Propeller 2 Model" value={form.propeller2_model || ''} onChange={e => update('propeller2_model', e.target.value)} placeholder="e.g. HC-C2YK-1BF" />
                    <Field label="Propeller 2 Total Time (hrs)" value={form.propeller2_time || ''} onChange={e => update('propeller2_time', e.target.value)} type="number" />
                  </div>
                </div>
              </>
            )}
            <Field label="Useful Load (lbs)" value={form.useful_load || ''} onChange={e => update('useful_load', e.target.value)} type="number" />
            <Field label="Fuel Capacity (gal)" value={form.fuel_capacity || ''} onChange={e => update('fuel_capacity', e.target.value)} type="number" />
            <Field label="Annual Due" value={form.annual_due || ''} onChange={e => update('annual_due', e.target.value)} type="date" />
          </div>
        </section>

        {/* Avionics & Instruments */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Avionics & Instruments</h2>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Avionics Suite" value={form.avionics_suite || ''} onValueChange={v => update('avionics_suite', v)} options={AVIONICS} />
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={form.adsb_compliant || false} onCheckedChange={v => update('adsb_compliant', v)} />
              <Label>ADS-B Out Compliant</Label>
            </div>
          </div>
          <div className="mt-4">
            <Label className="text-xs font-medium text-muted-foreground">Avionics Details</Label>
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
                    <SelectField label="Condition" value={inst.condition || ''} onValueChange={v => updateInstrument(idx, 'condition', v)} options={['Excellent','Good','Fair','Poor','Inoperative']} />
                    <Field label="Last Calibration / Check" value={inst.last_calibration || ''} onChange={e => updateInstrument(idx, 'last_calibration', e.target.value)} type="date" />
                    <div className="lg:col-span-3">
                      <Field label="Notes" value={inst.notes || ''} onChange={e => updateInstrument(idx, 'notes', e.target.value)} placeholder="Optional notes..." />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Condition */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Condition</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SelectField label="Interior Condition" value={form.interior_condition || ''} onValueChange={v => update('interior_condition', v)} options={CONDITIONS} />
            <SelectField label="Exterior Condition" value={form.exterior_condition || ''} onValueChange={v => update('exterior_condition', v)} options={CONDITIONS} />
            <Field label="Paint Year" value={form.paint_year || ''} onChange={e => update('paint_year', e.target.value)} type="number" />
            <Field label="Interior Year" value={form.interior_year || ''} onChange={e => update('interior_year', e.target.value)} type="number" />
            <SelectField label="Damage History" value={form.damage_history || ''} onValueChange={v => update('damage_history', v)} options={DAMAGE} />
          </div>
          {form.damage_history !== 'None' && (
            <div className="mt-4">
              <Label className="text-xs font-medium text-muted-foreground">Damage Details</Label>
              <Textarea value={form.damage_details || ''} onChange={e => update('damage_details', e.target.value)} className="mt-1.5" rows={3} />
            </div>
          )}
        </section>

        {/* Photos */}
        <section className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Aircraft Photos</h2>
            <label className="cursor-pointer">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors">
                {uploadingImage ? 'Uploading...' : <><Upload className="w-4 h-4" /> Upload Photos</>}
              </span>
            </label>
          </div>
          {(!form.images || form.images.length === 0) ? (
            <p className="text-sm text-muted-foreground">No photos uploaded yet. Photos will appear on the public inventory listing.</p>
          ) : (
            <DragDropContext onDragEnd={handleImageDragEnd}>
              <Droppable droppableId="photos" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                  >
                    {(form.images || []).map((url, idx) => (
                      <Draggable key={url + idx} draggableId={url + idx} index={idx}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`relative group rounded-lg overflow-hidden border border-border aspect-video ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-accent opacity-90' : ''
                            }`}
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
        </section>

        {/* Description */}
        <section className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Description</h2>
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
          </div>
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
        </section>

        {/* Other */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Other</h2>
          <Textarea value={form.other || ''} onChange={e => update('other', e.target.value)} rows={4} placeholder="Any other relevant information..." />
        </section>
      </div>
    </div>
  );
}