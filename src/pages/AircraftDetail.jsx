import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

const MAKES = ["Cessna", "Piper", "Beechcraft", "Cirrus", "Mooney", "Diamond", "Socata", "Grumman", "Commander", "Pilatus", "TBM", "Daher", "Epic", "Quest", "Textron", "Hawker", "Embraer", "Bombardier", "Gulfstream", "Dassault", "Other"];
const ENGINE_TYPES = ["Piston", "Turboprop", "Turbojet", "Turbofan"];
const CONDITIONS = ["New/Refurbished", "Excellent", "Good", "Fair", "Poor"];
const STATUSES = ["Available", "Under Contract", "Sold", "Off Market", "Appraisal Only"];
const AVIONICS = ["Garmin G1000", "Garmin G3X", "Garmin GTN 750/650", "Avidyne IFD", "Aspen EFD", "King Digital", "Collins Pro Line", "Honeywell Primus", "Steam Gauges", "Mixed/Upgraded", "Other"];
const DAMAGE = ["None", "Minor", "Major", "Unknown"];

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
    location: '', notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [clients, setClients] = useState([]);

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
    // Convert numbers
    ['year', 'total_time', 'engine_time_smoh', 'num_engines', 'propeller_time', 'paint_year', 
     'interior_year', 'useful_load', 'fuel_capacity', 'asking_price'].forEach(f => {
      if (data[f] !== '' && data[f] != null) data[f] = Number(data[f]);
      else delete data[f];
    });
    // Remove built-in fields
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

  const Field = ({ label, field, type = "text", placeholder }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input 
        type={type} 
        value={form[field] || ''} 
        onChange={e => update(field, e.target.value)} 
        placeholder={placeholder}
      />
    </div>
  );

  const SelectField = ({ label, field, options }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Select value={form[field] || ''} onValueChange={v => update(field, v)}>
        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
        <SelectContent>
          {options.map(o => <SelectItem key={o} value={String(o)}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

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
        {/* Basic Info */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Aircraft Details</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Registration (N-Number)" field="registration" placeholder="N12345" />
            <SelectField label="Make" field="make" options={MAKES} />
            <Field label="Model" field="model" placeholder="172S" />
            <Field label="Year" field="year" type="number" placeholder="2005" />
            <Field label="Serial Number" field="serial_number" placeholder="S/N" />
            <SelectField label="Status" field="status" options={STATUSES} />
            <Field label="Location (Airport)" field="location" placeholder="KJFK" />
            <Field label="Asking Price" field="asking_price" type="number" />
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
            <Field label="Total Time (hrs)" field="total_time" type="number" />
            <Field label="Engine Time SMOH (hrs)" field="engine_time_smoh" type="number" />
            <SelectField label="Number of Engines" field="num_engines" options={[1, 2, 3, 4]} />
            <SelectField label="Engine Type" field="engine_type" options={ENGINE_TYPES} />
            <Field label="Propeller Time (hrs)" field="propeller_time" type="number" />
            <Field label="Useful Load (lbs)" field="useful_load" type="number" />
            <Field label="Fuel Capacity (gal)" field="fuel_capacity" type="number" />
            <Field label="Annual Due" field="annual_due" type="date" />
          </div>
        </section>

        {/* Avionics */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Avionics</h2>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Avionics Suite" field="avionics_suite" options={AVIONICS} />
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={form.adsb_compliant || false} onCheckedChange={v => update('adsb_compliant', v)} />
              <Label>ADS-B Out Compliant</Label>
            </div>
          </div>
          <div className="mt-4">
            <Label className="text-xs font-medium text-muted-foreground">Avionics Details</Label>
            <Textarea value={form.avionics_details || ''} onChange={e => update('avionics_details', e.target.value)} className="mt-1.5" rows={3} />
          </div>
        </section>

        {/* Condition */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Condition</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SelectField label="Interior Condition" field="interior_condition" options={CONDITIONS} />
            <SelectField label="Exterior Condition" field="exterior_condition" options={CONDITIONS} />
            <Field label="Paint Year" field="paint_year" type="number" />
            <Field label="Interior Year" field="interior_year" type="number" />
            <SelectField label="Damage History" field="damage_history" options={DAMAGE} />
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