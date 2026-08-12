import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LEAD_SOURCES = [
  "Single-Engine Form", "Multi-Engine Form", "Contact Form", "Website",
  "Referral", "Trade-A-Plane", "Controller", "AirMart", "Cold Call",
  "Trade Show", "Social Media", "Manual", "Other",
];

const LEAD_TYPES = ["Buyer", "Seller", "Both", "Appraisal"];
const STATUSES = ["New", "Contacted", "Qualified", "Converted", "Lost"];

export default function LeadForm({ initialData = {}, onSubmit, submitLabel = "Save Lead" }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    lead_source: "Manual",
    lead_type: "Buyer",
    aircraft_interest: "",
    message: "",
    budget_min: "",
    budget_max: "",
    status: "New",
    assigned_to: "",
    notes: "",
    ...initialData,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.last_name) return;
    setSaving(true);
    try {
      const payload = { ...form };
      payload.budget_min = payload.budget_min ? Number(payload.budget_min) : undefined;
      payload.budget_max = payload.budget_max ? Number(payload.budget_max) : undefined;
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>First Name</Label>
          <Input value={form.first_name} onChange={e => set("first_name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Last Name *</Label>
          <Input required value={form.last_name} onChange={e => set("last_name", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={e => set("phone", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Company</Label>
          <Input value={form.company} onChange={e => set("company", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Lead Source</Label>
          <Select value={form.lead_source} onValueChange={v => set("lead_source", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LEAD_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Lead Type</Label>
          <Select value={form.lead_type} onValueChange={v => set("lead_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LEAD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Aircraft of Interest</Label>
        <Input value={form.aircraft_interest} onChange={e => set("aircraft_interest", e.target.value)} placeholder="e.g. 2015 Cessna 182T" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Budget Min ($)</Label>
          <Input type="number" value={form.budget_min} onChange={e => set("budget_min", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Budget Max ($)</Label>
          <Input type="number" value={form.budget_max} onChange={e => set("budget_max", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Assigned To (email)</Label>
        <Input type="email" value={form.assigned_to} onChange={e => set("assigned_to", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Message / Inquiry</Label>
        <Textarea rows={3} value={form.message} onChange={e => set("message", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} />
      </div>
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}