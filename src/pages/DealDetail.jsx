import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

const STAGES = ["Lead", "Qualification", "Showing", "Offer", "Negotiation", "Pre-Buy Inspection", "Escrow", "Closing", "Closed Won", "Closed Lost"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export default function DealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [form, setForm] = useState({
    title: '', aircraft_id: '', aircraft_summary: '', buyer_id: '', buyer_name: '',
    seller_id: '', seller_name: '', stage: 'Lead', asking_price: '', offer_price: '',
    agreed_price: '', commission_rate: '', commission_amount: '',
    expected_close_date: '', actual_close_date: '', escrow_company: '',
    prebuy_facility: '', priority: 'Medium', notes: ''
  });
  const [aircraft, setAircraft] = useState([]);
  const [clients, setClients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const promises = [
      base44.entities.Aircraft.list('-created_date', 200),
      base44.entities.Client.list('-created_date', 200),
    ];
    if (!isNew) promises.push(base44.entities.Deal.list());

    Promise.all(promises).then(([ac, cl, dl]) => {
      setAircraft(ac);
      setClients(cl);
      if (!isNew && dl) {
        const found = dl.find(d => d.id === id);
        if (found) setForm(prev => ({ ...prev, ...found }));
      }
      setLoading(false);
    });
  }, [id, isNew]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleAircraftSelect = (aircraftId) => {
    const ac = aircraft.find(a => a.id === aircraftId);
    setForm(prev => ({
      ...prev,
      aircraft_id: aircraftId,
      aircraft_summary: ac ? `${ac.year} ${ac.make} ${ac.model} (${ac.registration})` : '',
      asking_price: ac?.asking_price || prev.asking_price
    }));
  };

  const selectClient = (field, nameField, clientId) => {
    const cl = clients.find(c => c.id === clientId);
    setForm(prev => ({
      ...prev,
      [field]: clientId,
      [nameField]: cl ? `${cl.first_name} ${cl.last_name}` : ''
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    ['asking_price', 'offer_price', 'agreed_price', 'commission_rate', 'commission_amount'].forEach(f => {
      if (data[f] !== '' && data[f] != null) data[f] = Number(data[f]);
      else delete data[f];
    });
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;

    if (isNew) {
      await base44.entities.Deal.create(data);
    } else {
      await base44.entities.Deal.update(id, data);
    }
    setSaving(false);
    navigate('/deals');
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this deal?')) {
      await base44.entities.Deal.delete(id);
      navigate('/deals');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  const Field = ({ label, field, type = "text", placeholder }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input type={type} value={form[field] || ''} onChange={e => update(field, e.target.value)} placeholder={placeholder} />
    </div>
  );

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/deals')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-semibold">{isNew ? 'New Deal' : form.title}</h1>
            {!isNew && form.aircraft_summary && <p className="text-sm text-muted-foreground">{form.aircraft_summary}</p>}
          </div>
          {!isNew && <StatusBadge status={form.stage} />}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Deal Information</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Deal Title" field="title" placeholder="e.g., N12345 - Smith Acquisition" />
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Aircraft</Label>
              <Select value={form.aircraft_id || ''} onValueChange={handleAircraftSelect}>
                <SelectTrigger><SelectValue placeholder="Select aircraft..." /></SelectTrigger>
                <SelectContent>
                  {aircraft.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.year} {a.make} {a.model} ({a.registration})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Stage</Label>
              <Select value={form.stage} onValueChange={v => update('stage', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Buyer</Label>
              <Select value={form.buyer_id || ''} onValueChange={v => selectClient('buyer_id', 'buyer_name', v)}>
                <SelectTrigger><SelectValue placeholder="Select buyer..." /></SelectTrigger>
                <SelectContent>
                  {clients.filter(c => ['Buyer', 'Both'].includes(c.client_type)).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Seller</Label>
              <Select value={form.seller_id || ''} onValueChange={v => selectClient('seller_id', 'seller_name', v)}>
                <SelectTrigger><SelectValue placeholder="Select seller..." /></SelectTrigger>
                <SelectContent>
                  {clients.filter(c => ['Seller', 'Both'].includes(c.client_type)).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Priority</Label>
              <Select value={form.priority} onValueChange={v => update('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Financial</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Asking Price ($)" field="asking_price" type="number" />
            <Field label="Offer Price ($)" field="offer_price" type="number" />
            <Field label="Agreed Price ($)" field="agreed_price" type="number" />
            <Field label="Commission Rate (%)" field="commission_rate" type="number" />
            <Field label="Commission Amount ($)" field="commission_amount" type="number" />
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Timeline & Logistics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Expected Close Date" field="expected_close_date" type="date" />
            <Field label="Actual Close Date" field="actual_close_date" type="date" />
            <Field label="Escrow/Title Company" field="escrow_company" />
            <Field label="Pre-Buy Facility" field="prebuy_facility" />
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Notes</h2>
          <Textarea value={form.notes || ''} onChange={e => update('notes', e.target.value)} rows={4} placeholder="Deal notes, negotiation history..." />
        </section>
      </div>
    </div>
  );
}