import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NAVY = "#1B365D";
const GOLD = "#C4A35A";

export default function EstateIntakeForm() {
  const [form, setForm] = useState({
    n_number: "",
    hangar_city: "",
    letters_status: "",
    counsel_name: "",
    firm: "",
    counsel_email: "",
    pr_client_name: "",
    time_critical: ""
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await base44.functions.invoke("submitEstateIntake", form);
      setSent(true);
    } catch (err) {
      setError("Something went wrong. Please call 386-227-6840.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
        <CheckCircle className="w-14 h-14" style={{ color: GOLD }} />
        <h3 className="text-2xl font-bold text-white">Received.</h3>
        <p className="text-white/70 max-w-md">
          We will reply to counsel within three business days of a complete intake.
        </p>
      </div>
    );
  }

  const fieldCls = "w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors";
  const inputCls = `${fieldCls} bg-white text-gray-900 focus:border-[${GOLD}]`;
  const labelCls = "block text-xs font-semibold text-white/60 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>N-number *</label>
          <input required value={form.n_number} onChange={e => update("n_number", e.target.value)}
            className={inputCls} placeholder="N" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
        </div>
        <div>
          <label className={labelCls}>Hangar / airport city *</label>
          <input required value={form.hangar_city} onChange={e => update("hangar_city", e.target.value)}
            className={inputCls} placeholder="e.g. Spruce Creek, FL" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Letters status *</label>
        <select required value={form.letters_status} onChange={e => update("letters_status", e.target.value)}
          className={inputCls} style={{ borderColor: "rgba(255,255,255,0.2)" }}>
          <option value="" disabled>Select one…</option>
          <option>Issued</option>
          <option>Pending</option>
          <option>Heir-at-law only</option>
          <option>Trustee</option>
          <option>Family-law injunction</option>
          <option>Unknown</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Counsel name *</label>
          <input required value={form.counsel_name} onChange={e => update("counsel_name", e.target.value)}
            className={inputCls} placeholder="Jane Doe, Esq." style={{ borderColor: "rgba(255,255,255,0.2)" }} />
        </div>
        <div>
          <label className={labelCls}>Firm *</label>
          <input required value={form.firm} onChange={e => update("firm", e.target.value)}
            className={inputCls} placeholder="Doe & Associates" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Counsel email *</label>
        <input required type="email" value={form.counsel_email} onChange={e => update("counsel_email", e.target.value)}
          className={inputCls} placeholder="counsel@firm.com" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
      </div>

      <div>
        <label className={labelCls}>PR / client name</label>
        <input value={form.pr_client_name} onChange={e => update("pr_client_name", e.target.value)}
          className={inputCls} placeholder="Optional" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
      </div>

      <div>
        <label className={labelCls}>Anything time-critical</label>
        <textarea value={form.time_critical} onChange={e => update("time_critical", e.target.value)} rows={3}
          className={`${inputCls} resize-none`} placeholder="Registration / insurance / storm / eviction" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
      </div>

      {error && <p className="text-red-300 text-sm">{error}</p>}

      <button type="submit" disabled={sending}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all hover:brightness-110 disabled:opacity-60"
        style={{ backgroundColor: GOLD, color: NAVY }}>
        <Send className="w-4 h-4" />
        {sending ? "Sending…" : "Request a Situation Report"}
      </button>
    </form>
  );
}