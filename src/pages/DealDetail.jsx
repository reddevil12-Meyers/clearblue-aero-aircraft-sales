import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Trash2, ChevronDown, X } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import PurchaseAgreementSection from "../components/deal/PurchaseAgreementSection";
import SendEmailSection from "../components/deal/SendEmailSection";

const STAGES = ["Lead", "Qualification", "Listing Agreement Being Prepared", "Aircraft Listed", "Showing", "Offer", "Negotiation", "Pre-Buy Inspection", "Escrow", "Closing", "Closed Won", "Closed Lost"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

function ClientSearchSelect({ label, value, clients, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = clients.find(c => c.id === value);

  const filtered = clients.filter(c => {
    const name = `${c.first_name} ${c.last_name} ${c.company || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (client) => {
    onChange(client.id, `${client.first_name} ${client.last_name}`);
    setSearch("");
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("", "");
    setSearch("");
  };

  return (
    <div className="space-y-1.5" ref={ref}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="relative">
        <div
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm cursor-pointer"
          onClick={() => setOpen(o => !o)}
        >
          {open ? (
            <input
              autoFocus
              className="flex-1 outline-none bg-transparent placeholder:text-muted-foreground"
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className={selected ? "text-foreground" : "text-muted-foreground"}>
              {selected ? `${selected.first_name} ${selected.last_name}` : `Select ${label.toLowerCase()}...`}
            </span>
          )}
          <div className="flex items-center gap-1 ml-2">
            {selected && !open && <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" onClick={handleClear} />}
            <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
          </div>
        </div>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">No clients found.</div>
            ) : (
              filtered.map(c => (
                <div
                  key={c.id}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${c.id === value ? 'bg-accent/50 font-medium' : ''}`}
                  onMouseDown={() => handleSelect(c)}
                >
                  {c.first_name} {c.last_name}
                  {c.company && <span className="text-xs text-muted-foreground ml-1">· {c.company}</span>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AircraftSearchSelect({ aircraft, value, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const labelOf = (a) => `${a.year} ${a.make} ${a.model} (${a.registration})`;
  const selected = aircraft.find(a => a.id === value);

  const filtered = aircraft.filter(a => labelOf(a).toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (a) => { onChange(a.id); setSearch(""); setOpen(false); };

  return (
    <div className="space-y-1.5" ref={ref}>
      <Label className="text-xs font-medium text-muted-foreground">Aircraft</Label>
      <div className="relative">
        <div
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm cursor-pointer"
          onClick={() => setOpen(o => !o)}
        >
          {open ? (
            <input
              autoFocus
              className="flex-1 outline-none bg-transparent placeholder:text-muted-foreground"
              placeholder="Search aircraft..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className={selected ? "text-foreground" : "text-muted-foreground"}>
              {selected ? labelOf(selected) : "Select aircraft..."}
            </span>
          )}
          <div className="flex items-center gap-1 ml-2">
            {selected && !open && <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); onChange(""); }} />}
            <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
          </div>
        </div>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">No aircraft found.</div>
            ) : (
              filtered.map(a => (
                <div
                  key={a.id}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${a.id === value ? 'bg-accent/50 font-medium' : ''}`}
                  onMouseDown={() => handleSelect(a)}
                >
                  {labelOf(a)}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Defined OUTSIDE the component to prevent remounting on every render
const Field = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    <Input type={type} value={value} onChange={onChange} placeholder={placeholder} />
  </div>
);

export default function DealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [form, setForm] = useState({
    title: '', aircraft_id: '', aircraft_summary: '', buyer_id: '', buyer_name: '',
    seller_id: '', seller_name: '', stage: 'Lead', asking_price: '', offer_price: '',
    agreed_price: '', deposit_amount: '', commission_rate: '', commission_amount: '', outside_broker_commission: '',
    expected_close_date: '', actual_close_date: '', escrow_company: '', escrow_fee: '',
    prebuy_facility: '', priority: 'Medium', what_conveys: '', notes: '', document_urls: []
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
        if (found) {
          const merged = { ...found };
          // Auto-calculate commission amount if not already set
          const price = parseFloat(merged.agreed_price);
          const rate = parseFloat(merged.commission_rate);
          if (!isNaN(price) && !isNaN(rate) && !merged.commission_amount) {
            merged.commission_amount = ((price * rate) / 100).toFixed(2);
          }
          setForm(prev => ({ ...prev, ...merged }));
        }
      }
      setLoading(false);
    });
  }, [id, isNew]);

  const update = (field, value) => setForm(prev => {
    const next = { ...prev, [field]: value };
    if (field === 'agreed_price' || field === 'commission_rate') {
      const price = parseFloat(field === 'agreed_price' ? value : prev.agreed_price);
      const rate = parseFloat(field === 'commission_rate' ? value : prev.commission_rate);
      if (!isNaN(price) && !isNaN(rate)) {
        next.commission_amount = ((price * rate) / 100).toFixed(2);
      }
    }
    return next;
  });

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
    ['asking_price', 'offer_price', 'agreed_price', 'deposit_amount', 'commission_rate', 'commission_amount', 'outside_broker_commission', 'escrow_fee'].forEach(f => {
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
            <Field label="Deal Title" value={form.title || ''} onChange={e => update('title', e.target.value)} placeholder="e.g., N12345 - Smith Acquisition" />
            <AircraftSearchSelect
              aircraft={[...aircraft].sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))}
              value={form.aircraft_id || ''}
              onChange={handleAircraftSelect}
            />
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Stage</Label>
              <Select value={form.stage} onValueChange={v => update('stage', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <ClientSearchSelect
              label="Buyer"
              value={form.buyer_id || ''}
              clients={clients}
              onChange={(id, name) => setForm(prev => ({ ...prev, buyer_id: id, buyer_name: name }))}
            />
            <ClientSearchSelect
              label="Owner"
              value={form.seller_id || ''}
              clients={clients}
              onChange={(id, name) => setForm(prev => ({ ...prev, seller_id: id, seller_name: name }))}
            />
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
            <Field label="Asking Price ($)" value={form.asking_price || ''} onChange={e => update('asking_price', e.target.value)} type="number" />
            <Field label="Offer Price ($)" value={form.offer_price || ''} onChange={e => update('offer_price', e.target.value)} type="number" />
            <Field label="Agreed Price ($)" value={form.agreed_price || ''} onChange={e => update('agreed_price', e.target.value)} type="number" />
            <Field label="Commission Rate (%)" value={form.commission_rate || ''} onChange={e => update('commission_rate', e.target.value)} type="number" />
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Commission Amount ($) <span className="text-muted-foreground/60 font-normal">(auto)</span></Label>
              <Input type="number" value={form.commission_amount || ''} onChange={e => update('commission_amount', e.target.value)} className="bg-muted/40" />
            </div>
            <Field label="Outside Broker Commission ($)" value={form.outside_broker_commission || ''} onChange={e => update('outside_broker_commission', e.target.value)} type="number" />
            <Field label="Deposit Amount ($)" value={form.deposit_amount || ''} onChange={e => update('deposit_amount', e.target.value)} type="number" />
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Timeline & Logistics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Expected Close Date" value={form.expected_close_date || ''} onChange={e => update('expected_close_date', e.target.value)} type="date" />
            <Field label="Actual Close Date" value={form.actual_close_date || ''} onChange={e => update('actual_close_date', e.target.value)} type="date" />
            <Field label="Escrow/Title Company" value={form.escrow_company || ''} onChange={e => update('escrow_company', e.target.value)} />
            <Field label="Escrow Fee ($)" value={form.escrow_fee || ''} onChange={e => update('escrow_fee', e.target.value)} type="number" />
            <Field label="Pre-Buy Facility" value={form.prebuy_facility || ''} onChange={e => update('prebuy_facility', e.target.value)} />
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Notes</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">What Conveys with Sale</Label>
              <Textarea value={form.what_conveys || ''} onChange={e => update('what_conveys', e.target.value)} rows={3} placeholder="e.g. Log books, engine overhaul records, spare parts, covers..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
              <Textarea value={form.notes || ''} onChange={e => update('notes', e.target.value)} rows={4} placeholder="Deal notes, negotiation history..." />
            </div>
          </div>
        </section>

        {!isNew && (
          <>
            <PurchaseAgreementSection
              dealId={id}
              deal={form}
              aircraft={aircraft.find(a => a.id === form.aircraft_id)}
              documentUrls={form.document_urls || []}
              onDocumentAdded={(url) => setForm(prev => ({ ...prev, document_urls: [...(prev.document_urls || []), url] }))}
              onDocumentRemoved={(url) => setForm(prev => ({ ...prev, document_urls: (prev.document_urls || []).filter(u => u !== url) }))}
            />
            <SendEmailSection deal={form} documentUrls={form.document_urls || []} />
          </>
        )}
      </div>
    </div>
  );
}