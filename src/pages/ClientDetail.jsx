import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

const CLIENT_TYPES = ["Buyer", "Seller", "Both", "Appraiser Client"];
const STATUSES = ["Active", "Prospect", "Inactive", "Closed"];
const LEAD_SOURCES = ["Referral", "Website", "Trade-A-Plane", "Controller", "AirMart", "Cold Call", "Trade Show", "Social Media", "Other"];

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', company: '',
    client_type: 'Buyer', lead_source: '', status: 'Prospect',
    aircraft_interests: '', budget_min: '', budget_max: '',
    address: '', city: '', state: '', zip: '', notes: '', last_contacted: ''
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      base44.entities.Client.list().then(data => {
        const found = data.find(c => c.id === id);
        if (found) setForm(prev => ({ ...prev, ...found }));
        setLoading(false);
      });
    }
  }, [id, isNew]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    ['budget_min', 'budget_max'].forEach(f => {
      if (data[f] !== '' && data[f] != null) data[f] = Number(data[f]);
      else delete data[f];
    });
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;

    if (isNew) {
      await base44.entities.Client.create(data);
    } else {
      await base44.entities.Client.update(id, data);
    }
    setSaving(false);
    navigate('/clients');
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this client?')) {
      await base44.entities.Client.delete(id);
      navigate('/clients');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;
  }

  const Field = ({ label, field, type = "text", placeholder }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input type={type} value={form[field] || ''} onChange={e => update(field, e.target.value)} placeholder={placeholder} />
    </div>
  );

  const SelectField = ({ label, field, options }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Select value={form[field] || ''} onValueChange={v => update(field, v)}>
        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
        <SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-display font-semibold">
            {isNew ? 'New Client' : `${form.first_name} ${form.last_name}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Contact Information</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="First Name" field="first_name" />
            <Field label="Last Name" field="last_name" />
            <Field label="Email" field="email" type="email" />
            <Field label="Phone" field="phone" type="tel" />
            <Field label="Company" field="company" />
            <SelectField label="Lead Source" field="lead_source" options={LEAD_SOURCES} />
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Classification</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SelectField label="Client Type" field="client_type" options={CLIENT_TYPES} />
            <SelectField label="Status" field="status" options={STATUSES} />
            <Field label="Budget Min" field="budget_min" type="number" />
            <Field label="Budget Max" field="budget_max" type="number" />
          </div>
          <div className="mt-4">
            <Label className="text-xs font-medium text-muted-foreground">Aircraft Interests</Label>
            <Textarea value={form.aircraft_interests || ''} onChange={e => update('aircraft_interests', e.target.value)} className="mt-1.5" rows={2} placeholder="e.g., Single-engine piston, IFR capable, under $250k..." />
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Address</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-2">
              <Field label="Address" field="address" />
            </div>
            <Field label="City" field="city" />
            <Field label="State" field="state" />
            <Field label="Zip" field="zip" />
            <Field label="Last Contacted" field="last_contacted" type="date" />
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Notes</h2>
          <Textarea value={form.notes || ''} onChange={e => update('notes', e.target.value)} rows={4} placeholder="Notes about this client..." />
        </section>
      </div>
    </div>
  );
}