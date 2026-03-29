import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

const Field = ({ label, children }) => (
  <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>
);

export default function StepRecords({ aircraftId }) {
  const [records, setRecords] = useState(null);
  const [aircraft, setAircraft] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!aircraftId) return;
    base44.entities.AircraftRecords.filter({ aircraft_id: aircraftId }).then(res => {
      if (res.length > 0) setRecords(res[0]);
      else setRecords({ aircraft_id: aircraftId });
    });
    base44.entities.Aircraft.list().then(list => {
      const found = list.find(a => a.id === aircraftId);
      if (found) setAircraft(found);
    });
  }, [aircraftId]);

  const update = (field, value) => setRecords(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    const data = { ...records };
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;
    if (records.id) {
      await base44.entities.AircraftRecords.update(records.id, data);
    } else {
      const created = await base44.entities.AircraftRecords.create(data);
      setRecords(created);
    }
    setSaving(false);
  };

  if (!aircraftId) return (
    <div className="text-center py-12 text-muted-foreground">
      <p>Please select an aircraft on the Aircraft tab first.</p>
    </div>
  );

  if (!records) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Logbooks & Maintenance</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Field label="Logbook Status">
            <Select value={records.logbook_status || ''} onValueChange={v => update('logbook_status', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{['Complete', 'Partial', 'Missing', 'Digital'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Last Annual Inspection">
            <Input type="date" value={records.annual_inspection_date || ''} onChange={e => update('annual_inspection_date', e.target.value)} />
          </Field>
          <Field label="Annual Due">
            <Input type="date" value={records.annual_inspection_due || ''} onChange={e => update('annual_inspection_due', e.target.value)} />
          </Field>
          <Field label="Engine Overhaul Date">
            <Input type="date" value={records.engine_overhaul_date || ''} onChange={e => update('engine_overhaul_date', e.target.value)} />
          </Field>
          <Field label="Overhaul Facility">
            <Input value={records.engine_overhaul_facility || ''} onChange={e => update('engine_overhaul_facility', e.target.value)} />
          </Field>
          <Field label="Prop Overhaul Date">
            <Input type="date" value={records.prop_overhaul_date || ''} onChange={e => update('prop_overhaul_date', e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Logbook Notes">
            <Textarea value={records.logbook_notes || ''} onChange={e => update('logbook_notes', e.target.value)} rows={2} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          {[
            { field: 'maintenance_current', label: 'Maintenance Records Current' },
            { field: 'weight_and_balance_current', label: 'Weight & Balance Current' },
            { field: 'poh_available', label: 'POH / AFM Available' },
            { field: '337_forms', label: '337 Forms Present' },
          ].map(({ field, label }) => (
            <div key={field} className="flex items-center gap-2">
              <Switch checked={!!records[field]} onCheckedChange={v => update(field, v)} />
              <Label className="text-sm">{label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Airworthiness & Compliance</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field label="AD Compliance Status">
            <Select value={records.ad_compliance_status || ''} onValueChange={v => update('ad_compliance_status', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{['Fully Compliant', 'Partial', 'Non-Compliant', 'Unknown'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Service Bulletin Status">
            <Select value={records.service_bulletins_status || ''} onValueChange={v => update('service_bulletins_status', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{['All Complied', 'Some Complied', 'None Complied', 'Unknown'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="AD Compliance Notes">
            <Textarea value={records.ad_notes || ''} onChange={e => update('ad_notes', e.target.value)} rows={2} />
          </Field>
          <Field label="Open / Non-Compliant ADs">
            <Textarea value={records.open_ads || ''} onChange={e => update('open_ads', e.target.value)} rows={2} />
          </Field>
          <Field label="STCs Installed">
            <Textarea value={records.stcs_installed || ''} onChange={e => update('stcs_installed', e.target.value)} rows={2} />
          </Field>
          <Field label="Service Bulletin Notes">
            <Textarea value={records.service_bulletin_notes || ''} onChange={e => update('service_bulletin_notes', e.target.value)} rows={2} />
          </Field>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Damage & FAA Records</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field label="Damage History">
            <Select value={records.damage_history || ''} onValueChange={v => update('damage_history', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{['None', 'Minor', 'Major', 'Unknown'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="FAA Record Status">
            <Select value={records.faa_record_status || ''} onValueChange={v => update('faa_record_status', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{['Clear', 'Lien Noted', 'Not Checked', 'Issue Found'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Damage Details">
            <Textarea value={records.damage_details || ''} onChange={e => update('damage_details', e.target.value)} rows={2} />
          </Field>
          <Field label="FAA Record Notes">
            <Textarea value={records.faa_record_notes || ''} onChange={e => update('faa_record_notes', e.target.value)} rows={2} />
          </Field>
          <div className="lg:col-span-2">
            <Field label="Additional Notes">
              <Textarea value={records.additional_notes || ''} onChange={e => update('additional_notes', e.target.value)} rows={3} />
            </Field>
          </div>
        </div>
      </div>


      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Records'}
        </Button>
      </div>
    </div>
  );
}