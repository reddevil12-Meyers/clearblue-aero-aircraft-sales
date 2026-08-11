import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, Clock, CheckCircle, Loader2, X, User, Mail, Phone, Video, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const APPOINTMENT_TYPES = [
  { value: "Virtual Tour", label: "Virtual Tour", icon: Video, needsLocation: false },
  { value: "In-Person Viewing", label: "In-Person Viewing", icon: MapPin, needsLocation: true },
  { value: "Pre-Purchase Inspection", label: "Pre-Purchase Inspection", icon: Clock, needsLocation: true },
  { value: "Phone Call", label: "Phone Call", icon: Phone, needsLocation: false },
];

export default function ScheduleAppointment({ aircraft, variant = "public" }) {
  const isPublic = variant === "public";

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    appointment_type: "Virtual Tour",
    requested_datetime: "",
    duration_minutes: 45,
    client_name: "",
    client_email: "",
    client_phone: "",
    notes: "",
  });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const aircraftSummary = aircraft
    ? `${aircraft.year || ""} ${aircraft.make || ""} ${aircraft.model || ""}`.trim()
    : "Aircraft";

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedType = APPOINTMENT_TYPES.find(t => t.value === form.appointment_type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    setResult(null);
    try {
      const res = await base44.functions.invoke("scheduleAircraftAppointment", {
        aircraft_id: aircraft?.id,
        aircraft_summary: aircraftSummary,
        location: aircraft?.location,
        appointment_type: form.appointment_type,
        requested_datetime: form.requested_datetime,
        duration_minutes: Number(form.duration_minutes),
        client_name: form.client_name,
        client_email: form.client_email,
        client_phone: form.client_phone,
        notes: form.notes,
        source: variant,
      });
      setResult(res.data);
      setStatus("success");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Failed to schedule appointment");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setError("");
    setOpen(false);
  };

  const openForm = () => setOpen(true);

  // Build the datetime-local default suggestion: tomorrow 10:00
  const suggestDatetime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  if (!open && status !== "success") {
    if (isPublic) {
      return (
        <button
          onClick={openForm}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm bg-[#C9A84C] text-[#00447f] transition-all hover:brightness-110"
        >
          <Calendar className="w-4 h-4" /> Schedule a Tour
        </button>
      );
    }
    return (
      <Button onClick={openForm} className="w-full gap-2">
        <Calendar className="w-4 h-4" /> Schedule Appointment
      </Button>
    );
  }

  if (status === "success" && result) {
    const start = new Date(result.start?.dateTime || result.start);
    const formatted = start.toLocaleString(undefined, {
      weekday: "long", month: "long", day: "numeric",
      year: "numeric", hour: "numeric", minute: "2-digit",
    });
    if (isPublic) {
      return (
        <div className="rounded-xl border border-white/20 bg-white/5 p-6 text-center text-white">
          <CheckCircle className="w-12 h-12 text-[#C9A84C] mx-auto mb-3" />
          <p className="font-bold text-lg mb-1">Appointment Scheduled!</p>
          <p className="text-white/80 text-sm mb-3">
            {result.summary}
          </p>
          <p className="text-white/70 text-sm mb-1">{formatted}</p>
          {result.hangout_link && (
            <a href={result.hangout_link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-[#C9A84C] text-[#00447f] text-sm font-bold hover:brightness-110">
              <Video className="w-4 h-4" /> Join Virtual Tour
            </a>
          )}
          {result.html_link && (
            <div className="mt-3">
              <a href={result.html_link} target="_blank" rel="noopener noreferrer"
                className="text-xs text-white/60 hover:text-white underline underline-offset-2">
                View in Google Calendar
              </a>
            </div>
          )}
          <button onClick={reset} className="mt-4 text-xs font-semibold text-white/70 hover:text-white underline underline-offset-2">
            Schedule another
          </button>
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <p className="font-bold text-lg text-foreground mb-1">Appointment Scheduled!</p>
        <p className="text-muted-foreground text-sm mb-2">{result.summary}</p>
        <p className="text-foreground text-sm font-medium mb-3">{formatted}</p>
        {result.hangout_link && (
          <a href={result.hangout_link} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">
            <Video className="w-4 h-4" /> Join Virtual Tour
          </a>
        )}
        {result.html_link && (
          <div className="mt-3">
            <a href={result.html_link} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline">
              View in Google Calendar
            </a>
          </div>
        )}
        <Button onClick={reset} variant="ghost" size="sm" className="mt-3">
          Schedule another
        </Button>
      </div>
    );
  }

  // Form state
  if (isPublic) {
    return (
      <div className="rounded-xl border border-white/20 bg-white/5 p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C9A84C]" /> Schedule a Tour
          </h4>
          <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-white/70 mb-1 block">Appointment Type</label>
              <select
                value={form.appointment_type}
                onChange={e => update("appointment_type", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#C9A84C]"
              >
                {APPOINTMENT_TYPES.map(t => <option key={t.value} value={t.value} className="text-black">{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/70 mb-1 block">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={form.requested_datetime || suggestDatetime()}
                onChange={e => update("requested_datetime", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#C9A84C] [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/70 mb-1 block">Duration (min)</label>
              <input
                type="number"
                min="15"
                step="15"
                value={form.duration_minutes}
                onChange={e => update("duration_minutes", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/70 mb-1 block">Your Name</label>
              <input
                required
                value={form.client_name}
                onChange={e => update("client_name", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-[#C9A84C]"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/70 mb-1 block">Email</label>
              <input
                type="email"
                required
                value={form.client_email}
                onChange={e => update("client_email", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-[#C9A84C]"
                placeholder="you@email.com"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-white/70 mb-1 block">Phone (optional)</label>
              <input
                value={form.client_phone}
                onChange={e => update("client_phone", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-[#C9A84C]"
                placeholder="Phone"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-white/70 mb-1 block">Notes (optional)</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={e => update("notes", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-[#C9A84C] resize-none"
                placeholder="Anything we should know?"
              />
            </div>
          </div>
          {selectedType?.needsLocation && aircraft?.location && (
            <p className="text-xs text-white/60 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Aircraft location: {aircraft.location}
            </p>
          )}
          {error && <p className="text-red-300 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm bg-[#C9A84C] text-[#00447f] transition-all hover:brightness-110 disabled:opacity-60"
          >
            {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Scheduling…</> : <><Calendar className="w-4 h-4" /> Schedule</>}
          </button>
        </form>
      </div>
    );
  }

  // Admin variant
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" /> Schedule Appointment
        </h4>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Appointment Type</Label>
            <Select value={form.appointment_type} onValueChange={v => update("appointment_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {APPOINTMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Date & Time</Label>
            <Input
              type="datetime-local"
              required
              value={form.requested_datetime || suggestDatetime()}
              onChange={e => update("requested_datetime", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Duration (min)</Label>
            <Input
              type="number"
              min="15"
              step="15"
              value={form.duration_minutes}
              onChange={e => update("duration_minutes", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Client Name</Label>
            <Input required value={form.client_name} onChange={e => update("client_name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Client Email</Label>
            <Input type="email" required value={form.client_email} onChange={e => update("client_email", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Client Phone</Label>
            <Input value={form.client_phone} onChange={e => update("client_phone", e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Notes</Label>
            <Textarea rows={2} value={form.notes} onChange={e => update("notes", e.target.value)} />
          </div>
        </div>
        {selectedType?.needsLocation && aircraft?.location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Aircraft location: {aircraft.location}
          </p>
        )}
        {error && <p className="text-destructive text-xs">{error}</p>}
        <Button type="submit" disabled={status === "loading"} className="w-full gap-2">
          {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Scheduling…</> : <><Calendar className="w-4 h-4" /> Schedule Appointment</>}
        </Button>
      </form>
    </div>
  );
}