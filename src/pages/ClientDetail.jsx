import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Trash2, User, Plane, FileText, Paperclip, Clock } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import ClientAircraftTab from "@/components/client/ClientAircraftTab";
import ClientAppraisalTab from "@/components/client/ClientAppraisalTab";
import ClientDocumentsTab from "@/components/client/ClientDocumentsTab";
import ClientActivityTab from "@/components/client/ClientActivityTab";

const CLIENT_TYPES = ["Buyer", "Seller", "Both", "Appraiser Client"];
const STATUSES = ["Active", "Prospect", "Inactive", "Closed"];
const LEAD_SOURCES = ["Referral", "Website", "Trade-A-Plane", "Controller", "AirMart", "Cold Call", "Trade Show", "Social Media", "Other"];

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'aircraft', label: 'Aircraft', icon: Plane },
  { id: 'appraisals', label: 'Appraisals', icon: FileText },
  { id: 'documents', label: 'Documents', icon: Paperclip },
  { id: 'activity', label: 'Activity', icon: Clock },
];

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNew = id === 'new';
  const activeTab = searchParams.get('tab') || 'overview';

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
    if (isNew) navigate('/clients');
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this client?')) {
      await base44.entities.Client.delete(id);
      navigate('/clients');
    }
  };

  const setTab = (tab) => setSearchParams({ tab });

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  );

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

  const clientName = `${form.first_name} ${form.last_name}`.trim();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 lg:px-8 pt-6 pb-0 border-b border-border bg-card">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-display font-semibold">
                  {isNew ? 'New Client' : (clientName || 'Client')}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {form.company && <span className="text-sm text-muted-foreground">{form.company}</span>}
                  {form.email && <span className="text-sm text-muted-foreground">· {form.email}</span>}
                  {form.status && <StatusBadge status={form.status} />}
                  {form.client_type && <StatusBadge status={form.client_type} />}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isNew && (
                <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          {!isNew && (
            <div className="flex gap-1 -mb-px overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">

          {/* Overview tab (or new client form) */}
          {(activeTab === 'overview' || isNew) && (
            <div className="space-y-6">
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
                  <div className="col-span-2"><Field label="Address" field="address" /></div>
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
          )}

          {activeTab === 'aircraft' && !isNew && <ClientAircraftTab clientId={id} />}
          {activeTab === 'appraisals' && !isNew && <ClientAppraisalTab clientId={id} />}
          {activeTab === 'documents' && !isNew && <ClientDocumentsTab clientId={id} />}
          {activeTab === 'activity' && !isNew && <ClientActivityTab clientId={id} clientName={clientName} />}
        </div>
      </div>
    </div>
  );
}