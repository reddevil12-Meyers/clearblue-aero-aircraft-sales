import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react";
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
    total_time: '', engine_time_smoh: '', num_engines: '1', engine_type: '',
    propeller_time: '', avionics_suite: '', avionics_details: '',
    interior_condition: '', exterior_condition: '', paint_year: '', interior_year: '',
    damage_history: 'None', damage_details: '', annual_due: '', adsb_compliant: false,
    useful_load: '', fuel_capacity: '', asking_price: '', status: 'Available',
    location: '', notes: '', show_on_public: false
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [clients, setClients] = useState([]);

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

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    ['year', 'total_time', 'engine_time_smoh', 'num_engines', 'propeller_time', 'paint_year',
     'interior_year', 'useful_load', 'fuel_capacity', 'asking_price'].forEach(f => {
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Show on Public Inventory</p>
              <p className="text-xs text-muted-foreground mt-0.5">When enabled, this aircraft will appear on the public-facing inventory page.</p>
            </div>
            <Switch checked={form.show_on_public || false} onCheckedChange={v => update('show_on_public', v)} />
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
            <Field label="Engine Time SMOH (hrs)" value={form.engine_time_smoh || ''} onChange={e => update('engine_time_smoh', e.target.value)} type="number" />
            <SelectField label="Number of Engines" value={String(form.num_engines || '1')} onValueChange={v => update('num_engines', v)} options={[1, 2, 3, 4]} />
            <SelectField label="Engine Type" value={form.engine_type || ''} onValueChange={v => update('engine_type', v)} options={ENGINE_TYPES} />
            <Field label="Propeller Time (hrs)" value={form.propeller_time || ''} onChange={e => update('propeller_time', e.target.value)} type="number" />
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

        {/* Notes */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Notes</h2>
          <Textarea value={form.notes || ''} onChange={e => update('notes', e.target.value)} rows={4} placeholder="Additional notes about this aircraft..." />
        </section>
      </div>
    </div>
  );
}