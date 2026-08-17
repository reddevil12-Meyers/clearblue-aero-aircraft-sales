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

const CLIENT_TYPES = ["Buyer", "Owner", "Both Buyer and Owner", "Prior Owner", "Appraiser Client", "Broker", "Vendor"];
const STATUSES = ["Active", "Prospect", "Inactive", "Closed"];
const LEAD_SOURCES = ["Referral", "Website", "Trade-A-Plane", "Controller", "AirMart", "Cold Call", "Trade Show", "Social Media", "Gardner Aircraft Sales", "Other"];

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'aircraft', label: 'Aircraft', icon: Plane },
  { id: 'appraisals', label: 'Appraisals', icon: FileText },
  { id: 'documents', label: 'Documents', icon: Paperclip },
  { id: 'activity', label: 'Activity', icon: Clock },
];

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
      <SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  </div>
);

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNew = id === 'new';
  const activeTab = searchParams.get('tab') || 'overview';

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', company: '',
    client_type: 'Buyer', lead_source: '', status: 'Prospect', assigned_to: '',
    aircraft_interests: '', budget_min: '', budget_max: '',
    address: '', city: '', state: '', zip: '', notes: '', last_contacted: ''
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Load the client record independently of the user list, because non-admin
    // users cannot list Users (platform restriction). A failed user-list call
    // must not block the page from rendering.
    if (!isNew) {
      base44.entities.Client.list().then(clients => {
        const found = clients.find(c => c.id === id);
        if (found) setForm(prev => ({ ...prev, ...found }));
        setLoading(false);
      }).catch(() => setLoading(false));
    }
    base44.entities.User.list('-created_date', 100)
      .then(setUsers)
      .catch(() => { /* non-admin users can't list users — dropdown stays empty */ });
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
    // Sync to HubSpot CRM (non-blocking)
    if (data.email) {
      try {
        await base44.functions.invoke('syncToHubspot', {
          email: data.email,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          company: data.company || '',
          city: data.city || '',
          state: data.state || '',
          zip: data.zip || '',
        });
      } catch (e) {
        console.log('HubSpot sync failed (non-blocking):', e.message);
      }
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
                  <Field label="First Name" value={form.first_name || ''} onChange={e => update('first_name', e.target.value)} />
                  <Field label="Last Name" value={form.last_name || ''} onChange={e => update('last_name', e.target.value)} />
                  <Field label="Email" value={form.email || ''} onChange={e => update('email', e.target.value)} type="email" />
                  <Field label="Phone" value={form.phone || ''} onChange={e => update('phone', e.target.value)} type="tel" />
                  <Field label="Company" value={form.company || ''} onChange={e => update('company', e.target.value)} />
                  <SelectField label="Lead Source" value={form.lead_source || ''} onValueChange={v => update('lead_source', v)} options={LEAD_SOURCES} />
                </div>
              </section>

              <section className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Classification</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <SelectField label="Client Type" value={form.client_type || ''} onValueChange={v => update('client_type', v)} options={CLIENT_TYPES} />
                  <SelectField label="Status" value={form.status || ''} onValueChange={v => update('status', v)} options={STATUSES} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Assigned To</Label>
                    <Select value={form.assigned_to || ''} onValueChange={v => update('assigned_to', v)}>
                      <SelectTrigger><SelectValue placeholder="Select user..." /></SelectTrigger>
                      <SelectContent>
                        {users.map(u => <SelectItem key={u.id} value={u.email}>{u.full_name} ({u.email})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Field label="Budget Min" value={form.budget_min || ''} onChange={e => update('budget_min', e.target.value)} type="number" />
                  <Field label="Budget Max" value={form.budget_max || ''} onChange={e => update('budget_max', e.target.value)} type="number" />
                </div>
                <div className="mt-4">
                  <Label className="text-xs font-medium text-muted-foreground">Aircraft Interests</Label>
                  <Textarea value={form.aircraft_interests || ''} onChange={e => update('aircraft_interests', e.target.value)} className="mt-1.5" rows={2} placeholder="e.g., Single-engine piston, IFR capable, under $250k..." />
                </div>
              </section>

              <section className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Address</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="col-span-2"><Field label="Address" value={form.address || ''} onChange={e => update('address', e.target.value)} /></div>
                  <Field label="City" value={form.city || ''} onChange={e => update('city', e.target.value)} />
                  <Field label="State" value={form.state || ''} onChange={e => update('state', e.target.value)} />
                  <Field label="Zip" value={form.zip || ''} onChange={e => update('zip', e.target.value)} />
                  <Field label="Last Contacted" value={form.last_contacted || ''} onChange={e => update('last_contacted', e.target.value)} type="date" />
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