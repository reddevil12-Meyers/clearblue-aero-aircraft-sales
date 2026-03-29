import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import StepAircraft from "../components/appraisal/StepAircraft";
import StepRecords from "../components/appraisal/StepRecords";
import StepComps from "../components/appraisal/StepComps";
import StepValuation from "../components/appraisal/StepValuation";
import StepReport from "../components/appraisal/StepReport";

const TABS = [
  { id: 'aircraft', label: '1. Aircraft' },
  { id: 'records', label: '2. Records' },
  { id: 'comps', label: '3. Comps' },
  { id: 'valuation', label: '4. Valuation' },
  { id: 'report', label: '5. Report' },
];

export default function AppraisalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNew = id === 'new';

  const [form, setForm] = useState({
    appraisal_number: '', aircraft_id: '', aircraft_summary: '', client_id: '', client_name: '',
    appraisal_type: 'Desktop', appraisal_mode: 'Desktop', purpose: '',
    appraisal_date: '', effective_date: '', status: 'Draft', fee: '',
    payment_status: 'Pending', comparable_sales: '', appraiser_notes: '', condition_rating: ''
  });
  const [aircraft, setAircraft] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appraisalId, setAppraisalId] = useState(isNew ? null : id);

  const activeTab = searchParams.get('tab') || 'aircraft';
  const setTab = (tab) => setSearchParams({ tab });

  useEffect(() => {
    const promises = [
      base44.entities.Aircraft.list('-created_date', 200),
      base44.entities.Client.list('-created_date', 200),
    ];
    if (!isNew) {
      promises.push(base44.entities.Appraisal.filter({}).then(all => all.find(a => a.id === id)));
    }
    Promise.all(promises).then(([ac, cl, found]) => {
      setAircraft(ac);
      setClients(cl);
      if (found) setForm(prev => ({ ...prev, ...found }));
      setLoading(false);
    });
  }, [id, isNew]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    const data = { ...form };
    if (data.fee !== '' && data.fee != null) data.fee = Number(data.fee);
    else delete data.fee;
    if (data.condition_rating) data.condition_rating = Number(data.condition_rating);
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;

    if (isNew || !appraisalId) {
      if (!data.appraisal_number) data.appraisal_number = `AP-${Date.now().toString(36).toUpperCase()}`;
      const created = await base44.entities.Appraisal.create(data);
      setAppraisalId(created.id);
      navigate(`/appraisals/${created.id}?tab=records`, { replace: true });
    } else {
      await base44.entities.Appraisal.update(appraisalId, data);
      navigate('/appraisals');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this appraisal?')) return;
    await base44.entities.Appraisal.delete(id);
    navigate('/appraisals');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/appraisals')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-semibold">
              {isNew ? 'New Appraisal' : (form.aircraft_summary || form.appraisal_number || 'Appraisal')}
            </h1>
            {!isNew && <p className="text-sm text-muted-foreground">{form.appraisal_number} · {form.appraisal_mode}</p>}
          </div>
          {!isNew && <StatusBadge status={form.status} />}
        </div>
        {!isNew && (
          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            disabled={isNew && tab.id !== 'aircraft'}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
              ${activeTab === tab.id ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}
              disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'aircraft' && (
        <div className="space-y-6">
          <StepAircraft form={form} update={update} aircraft={aircraft} clients={clients} />
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!form.aircraft_id || !form.appraisal_mode}>
              {isNew ? 'Create Appraisal & Continue →' : 'Save & Continue →'}
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <StepRecords aircraftId={form.aircraft_id} />
      )}

      {activeTab === 'comps' && (
        <StepComps aircraftId={form.aircraft_id} valuationRunId={null} />
      )}

      {activeTab === 'valuation' && (
        <StepValuation form={form} appraisalId={appraisalId} aircraftId={form.aircraft_id} />
      )}

      {activeTab === 'report' && (
        <StepReport form={form} update={update} appraisalId={appraisalId} onSave={handleSave} />
      )}
    </div>
  );
}