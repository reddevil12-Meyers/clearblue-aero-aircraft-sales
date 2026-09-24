import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { supabase } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const ROLES = ["Buy this make", "Sell this make", "Vintage type", "Not sure"];
const NAVY = "#1B365D";
const GOLD = "#C4A35A";

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B365D] transition-colors";

export default function DeskIntakeForm({ slug }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    model_interest: "",
    budget_or_nnumber: "",
    notes: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const { error } = await supabase.from('clients').insert({
        first_name: form.name.split(' ')[0] || '',
        last_name: form.name.split(' ').slice(1).join(' ') || '',
        email: form.email,
        phone: form.phone,
        notes: `Specialty desk (${slug}): ${form.role}\nModel/interest: ${form.model_interest}\nBudget/N-number: ${form.budget_or_nnumber}\n${form.notes}`,
        lead_source: 'Website',
        status: 'Prospect',
      });
      toast({ title: "Submitted", description: "We'll be in touch soon." });
      setSent(true);
    } catch (err) {
      console.error("Desk intake error:", err);
      setError("Something went wrong. Please try again or call 386 227-6840.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
        <CheckCircle className="w-14 h-14" style={{ color: NAVY }} />
        <h3 className="text-2xl font-black" style={{ color: NAVY }}>
          Received.
        </h3>
        <p className="text-gray-500">We will reply from ClearBlue Aero.</p>
        <button
          onClick={() => {
            setSent(false);
            setForm({ name: "", email: "", phone: "", role: "", model_interest: "", budget_or_nnumber: "", notes: "" });
          }}
          className="mt-2 px-6 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ backgroundColor: NAVY }}
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Name *</label>
          <input required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="John Smith" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Email *</label>
          <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder="john@example.com" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
          <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} placeholder="(555) 123-4567" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">I want to *</label>
          <select required value={form.role} onChange={(e) => update("role", e.target.value)} className={`${inputClass} bg-white`}>
            <option value="" disabled>Select one…</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Model, year, or mission</label>
          <input value={form.model_interest} onChange={(e) => update("model_interest", e.target.value)} className={inputClass} placeholder="e.g. 1979 F33A Bonanza" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Budget range, or N-number if selling</label>
          <input value={form.budget_or_nnumber} onChange={(e) => update("budget_or_nnumber", e.target.value)} className={inputClass} placeholder="e.g. $250k–$350k, or N123AB" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
        <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Anything else we should know…" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all hover:brightness-110 disabled:opacity-60"
        style={{ backgroundColor: GOLD, color: NAVY }}
      >
        <Send className="w-4 h-4" />
        {sending ? "Sending…" : "Start the conversation"}
      </button>
    </form>
  );
}