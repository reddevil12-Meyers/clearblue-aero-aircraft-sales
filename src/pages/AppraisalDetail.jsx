import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Trash2, FileDown, Sparkles } from "lucide-react";
import { generateAppraisalPDF } from '../utils/generateAppraisalPDF';
import StatusBadge from "../components/StatusBadge";

const TYPES = ["Desktop", "On-Site Inspection", "Pre-Purchase", "Insurance", "Estate/Tax", "Litigation Support", "Financing"];
const PURPOSES = ["Sale/Purchase", "Insurance", "Estate Planning", "Tax Reporting", "Financing", "Litigation", "Partnership Dissolution", "Donation", "Other"];
const METHODS = ["Market Comparison", "Cost Approach", "Income Approach", "Combined"];
const STATUSES = ["Draft", "In Progress", "Review", "Final", "Delivered"];
const LOGBOOKS = ["Complete", "Partial", "Missing", "Digital"];
const PAYMENT = ["Pending", "Invoiced", "Paid"];

export default function AppraisalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [form, setForm] = useState({
    appraisal_number: '', aircraft_id: '', aircraft_summary: '', client_id: '', client_name: '',
    appraisal_type: 'Desktop', purpose: '', appraisal_date: '', effective_date: '',
    market_value: '', wholesale_value: '', retail_value: '', condition_rating: '',
    airframe_assessment: '', engine_assessment: '', avionics_assessment: '',
    interior_assessment: '', exterior_assessment: '', ad_compliance: '',
    logbook_status: '', comparable_sales: '', value_adjustments: '',
    methodology: 'Market Comparison', status: 'Draft', fee: '', payment_status: 'Pending',
    appraiser_notes: ''
  });
  const [aircraft, setAircraft] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const promises = [
      base44.entities.Aircraft.list('-created_date', 200),
      base44.entities.Client.list('-created_date', 200),
    ];
    if (!isNew) promises.push(base44.entities.Appraisal.list());

    Promise.all(promises).then(([ac, cl, ap]) => {
      setAircraft(ac);
      setClients(cl);
      if (!isNew && ap) {
        const found = ap.find(a => a.id === id);
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
      aircraft_summary: ac ? `${ac.year} ${ac.make} ${ac.model} (${ac.registration})` : ''
    }));
  };

  const handleClientSelect = (clientId) => {
    const cl = clients.find(c => c.id === clientId);
    setForm(prev => ({
      ...prev,
      client_id: clientId,
      client_name: cl ? `${cl.first_name} ${cl.last_name}` : ''
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    ['market_value', 'wholesale_value', 'retail_value', 'condition_rating', 'fee'].forEach(f => {
      if (data[f] !== '' && data[f] != null) data[f] = Number(data[f]);
      else delete data[f];
    });
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;

    if (isNew) {
      if (!data.appraisal_number) {
        data.appraisal_number = `AP-${Date.now().toString(36).toUpperCase()}`;
      }
      await base44.entities.Appraisal.create(data);
    } else {
      await base44.entities.Appraisal.update(id, data);
    }
    setSaving(false);
    navigate('/appraisals');
  };

  const handleGenerateAI = async () => {
    const ac = aircraft.find(a => a.id === form.aircraft_id);
    if (!ac) { alert('Please select an aircraft first.'); return; }
    setAiLoading(true);
    const prompt = `You are an expert aircraft appraiser. Based on the following aircraft record, generate a professional appraisal report with detailed assessments and estimated market values.

Aircraft Record:
- Year: ${ac.year}
- Make: ${ac.make}
- Model: ${ac.model}
- Registration: ${ac.registration}
- Serial Number: ${ac.serial_number || 'Unknown'}
- Total Time: ${ac.total_time ? ac.total_time + ' hrs' : 'Unknown'}
- Engine Time SMOH: ${ac.engine_time_smoh ? ac.engine_time_smoh + ' hrs' : 'Unknown'}
- Engine Type: ${ac.engine_type || 'Unknown'}
- Number of Engines: ${ac.num_engines || 'Unknown'}
- Propeller Time: ${ac.propeller_time ? ac.propeller_time + ' hrs' : 'Unknown'}
- Avionics Suite: ${ac.avionics_suite || 'Unknown'}
- Avionics Details: ${ac.avionics_details || 'None provided'}
- Interior Condition: ${ac.interior_condition || 'Unknown'}
- Exterior Condition: ${ac.exterior_condition || 'Unknown'}
- Paint Year: ${ac.paint_year || 'Unknown'}
- Interior Year: ${ac.interior_year || 'Unknown'}
- Damage History: ${ac.damage_history || 'None'}
- Damage Details: ${ac.damage_details || 'None'}
- ADS-B Compliant: ${ac.adsb_compliant ? 'Yes' : 'No'}
- Useful Load: ${ac.useful_load ? ac.useful_load + ' lbs' : 'Unknown'}
- Fuel Capacity: ${ac.fuel_capacity ? ac.fuel_capacity + ' gal' : 'Unknown'}
- Location: ${ac.location || 'Unknown'}
- Notes: ${ac.notes || 'None'}

Appraisal Type: ${form.appraisal_type}
Purpose: ${form.purpose || 'General'}
Methodology: ${form.methodology}

Generate a thorough, professional appraisal. For market values, research current comparable sales for this aircraft type and provide realistic USD estimates. Be specific and detailed in each section. Write in the style of a professional USPAP-compliant aircraft appraisal.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      add_context_from_internet: false,
      response_json_schema: {
        type: 'object',
        properties: {
          airframe_assessment: { type: 'string' },
          engine_assessment: { type: 'string' },
          avionics_assessment: { type: 'string' },
          interior_assessment: { type: 'string' },
          exterior_assessment: { type: 'string' },
          ad_compliance: { type: 'string' },
          comparable_sales: { type: 'string' },
          value_adjustments: { type: 'string' },
          market_value: { type: 'number' },
          wholesale_value: { type: 'number' },
          retail_value: { type: 'number' },
          condition_rating: { type: 'number' },
          logbook_status: { type: 'string', enum: ['Complete', 'Partial', 'Missing', 'Digital'] },
        }
      }
    });
    setForm(prev => ({ ...prev, ...result }));
    setAiLoading(false);
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    const ac = aircraft.find(a => a.id === form.aircraft_id) || null;
    const { Client } = base44.entities;
    let cl = null;
    if (form.client_id) {
      const allClients = await Client.list();
      cl = allClients.find(c => c.id === form.client_id) || null;
    }
    generateAppraisalPDF(form, ac, cl);
    setGenerating(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this appraisal?')) {
      await base44.entities.Appraisal.delete(id);
      navigate('/appraisals');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

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

  const TextareaField = ({ label, field, rows = 3, placeholder }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Textarea value={form[field] || ''} onChange={e => update(field, e.target.value)} rows={rows} placeholder={placeholder} />
    </div>
  );

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/appraisals')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-semibold">
              {isNew ? 'New Appraisal' : (form.aircraft_summary || form.appraisal_number || 'Appraisal')}
            </h1>
            {!isNew && <p className="text-sm text-muted-foreground">{form.appraisal_number}</p>}
          </div>
          {!isNew && <StatusBadge status={form.status} />}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="outline" onClick={handleGenerateAI} disabled={aiLoading || !form.aircraft_id} className="gap-2 border-violet-300 text-violet-700 hover:bg-violet-50">
              <Sparkles className="w-4 h-4" />{aiLoading ? 'Generating...' : 'Auto-Generate with AI'}
            </Button>
          )}
          {!isNew && (
            <Button variant="outline" onClick={handleGeneratePDF} disabled={generating} className="gap-2">
              <FileDown className="w-4 h-4" />{generating ? 'Generating...' : 'Generate PDF'}
            </Button>
          )}
          {!isNew && <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* General Info */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">General Information</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Appraisal Number" field="appraisal_number" placeholder="Auto-generated" />
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
              <Label className="text-xs font-medium text-muted-foreground">Client</Label>
              <Select value={form.client_id || ''} onValueChange={handleClientSelect}>
                <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <SelectField label="Appraisal Type" field="appraisal_type" options={TYPES} />
            <SelectField label="Purpose" field="purpose" options={PURPOSES} />
            <SelectField label="Methodology" field="methodology" options={METHODS} />
            <SelectField label="Status" field="status" options={STATUSES} />
            <Field label="Appraisal Date" field="appraisal_date" type="date" />
            <Field label="Effective Date of Value" field="effective_date" type="date" />
          </div>
        </section>

        {/* Valuation */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Valuation</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Fair Market Value ($)" field="market_value" type="number" />
            <Field label="Wholesale Value ($)" field="wholesale_value" type="number" />
            <Field label="Retail Value ($)" field="retail_value" type="number" />
            <Field label="Condition Rating (1-10)" field="condition_rating" type="number" />
          </div>
        </section>

        {/* Assessments */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Detailed Assessment</h2>
          <div className="grid lg:grid-cols-2 gap-4">
            <TextareaField label="Airframe Assessment" field="airframe_assessment" placeholder="Overall airframe condition, corrosion, known issues..." />
            <TextareaField label="Engine Assessment" field="engine_assessment" placeholder="Engine condition, compressions, oil analysis..." />
            <TextareaField label="Avionics Assessment" field="avionics_assessment" placeholder="Avionics panel, databases, functionality..." />
            <TextareaField label="Interior Assessment" field="interior_assessment" placeholder="Seats, carpet, headliner, panels..." />
            <TextareaField label="Exterior Assessment" field="exterior_assessment" placeholder="Paint condition, corrosion, dents..." />
            <TextareaField label="AD Compliance Notes" field="ad_compliance" placeholder="Airworthiness directives status..." />
          </div>
          <div className="mt-4">
            <SelectField label="Logbook Status" field="logbook_status" options={LOGBOOKS} />
          </div>
        </section>

        {/* Market Analysis */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Market Analysis</h2>
          <div className="space-y-4">
            <TextareaField label="Comparable Sales Analysis" field="comparable_sales" rows={4} placeholder="Recent comparable sales data..." />
            <TextareaField label="Value Adjustments Summary" field="value_adjustments" rows={3} placeholder="Adjustments for equipment, condition, time..." />
          </div>
        </section>

        {/* Billing & Notes */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider">Billing & Notes</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Appraisal Fee ($)" field="fee" type="number" />
            <SelectField label="Payment Status" field="payment_status" options={PAYMENT} />
          </div>
          <TextareaField label="Internal Appraiser Notes" field="appraiser_notes" rows={4} placeholder="Private notes not included in report..." />
        </section>
      </div>
    </div>
  );
}