import { useState } from "react";
import { CheckCircle, Send, Plane } from "lucide-react";
import { base44 } from "@/api/base44Client";

const MAKES = ["Cessna", "Piper", "Beechcraft", "Cirrus", "Mooney", "Diamond", "Socata", "Grumman", "Commander", "Pilatus", "TBM", "Daher", "Epic", "Textron", "Hawker", "Embraer", "Bombardier", "Gulfstream", "Dassault", "Other"];
const CONDITIONS = ["New/Refurbished", "Excellent", "Good", "Fair", "Poor"];
const AVIONICS = ["Garmin G1000", "Garmin G3X", "Garmin GTN 750/650", "Avidyne IFD", "Aspen EFD", "King Digital", "Collins Pro Line", "Honeywell Primus", "Steam Gauges", "Mixed/Upgraded", "Other"];

export default function AircraftEntryForm({ engineType = "single" }) {
  const isTwin = engineType === "twin";
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    make: "", model: "", year: "", registration: "", serial_number: "",
    total_time: "", engine_time_smoh: "", avionics_suite: "",
    interior_condition: "", exterior_condition: "",
    asking_price: "", location: "", notes: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    const body = Object.entries(form).map(([k, v]) => `${k}: ${v}`).join('\n');
    await base44.integrations.Core.SendEmail({
      to: "sales@flyclearblue.com",
      subject: `New ${isTwin ? 'Multi-Engine' : 'Single Engine'} Aircraft Listing Submission — ${form.year} ${form.make} ${form.model}`,
      body: `New aircraft listing submission from ${form.name}:\n\n${body}`,
    });
    setSending(false);
    setSent(true);
  };

  const Field = ({ label, field, type = "text", placeholder, required }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}{required && " *"}</label>
      <input
        required={required} type={type} value={form[field]} onChange={e => update(field, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors"
      />
    </div>
  );

  const SelectField = ({ label, field, options, required }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}{required && " *"}</label>
      <select
        required={required} value={form[field]} onChange={e => update(field, e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors bg-white"
      >
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="bg-[#f5f6f8] min-h-screen">
      <div className="bg-[#00447f] py-20 px-4 text-center">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">
          {isTwin ? "Multi-Engine" : "Single Engine"} Aircraft
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          List Your Aircraft
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Fill out the form below and one of our brokers will contact you within one business day.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {sent ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#00447f' }} />
            <h2 className="text-2xl font-black text-[#00447f] mb-3">Submission Received!</h2>
            <p className="text-gray-500 max-w-md mx-auto">Thank you for your submission. A ClearBlue Aero broker will review your aircraft details and reach out within one business day.</p>
            <button
              onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", make: "", model: "", year: "", registration: "", serial_number: "", total_time: "", engine_time_smoh: "", avionics_suite: "", interior_condition: "", exterior_condition: "", asking_price: "", location: "", notes: "" }); }}
              className="mt-6 px-6 py-2 rounded-lg text-sm font-semibold text-white hover:brightness-110 transition-all"
              style={{ backgroundColor: '#00447f' }}
            >
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
            {/* Contact Info */}
            <div>
              <h2 className="text-base font-black text-[#00447f] mb-4 uppercase tracking-wider">Your Contact Information</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Full Name" field="name" required placeholder="John Smith" />
                <Field label="Email" field="email" type="email" required placeholder="john@example.com" />
                <Field label="Phone" field="phone" placeholder="(555) 123-4567" />
              </div>
            </div>

            {/* Aircraft Info */}
            <div>
              <h2 className="text-base font-black text-[#00447f] mb-4 uppercase tracking-wider">Aircraft Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <SelectField label="Make" field="make" options={MAKES} required />
                <Field label="Model" field="model" required placeholder="172S" />
                <Field label="Year" field="year" type="number" required placeholder="2005" />
                <Field label="Registration" field="registration" required placeholder="N12345" />
                <Field label="Serial Number" field="serial_number" placeholder="S/N" />
                <Field label="Total Time (hrs)" field="total_time" type="number" placeholder="1500" />
                <Field label="Engine Time SMOH (hrs)" field="engine_time_smoh" type="number" placeholder="450" />
                <Field label="Location (Airport)" field="location" placeholder="KFIN" />
                <SelectField label="Avionics Suite" field="avionics_suite" options={AVIONICS} />
                <SelectField label="Interior Condition" field="interior_condition" options={CONDITIONS} />
                <SelectField label="Exterior Condition" field="exterior_condition" options={CONDITIONS} />
                <Field label="Asking Price ($)" field="asking_price" type="number" placeholder="85000" />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Additional Notes</label>
              <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors resize-none"
                placeholder="Any additional details about the aircraft, upgrades, damage history, etc." />
            </div>

            <button type="submit" disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white text-sm transition-all hover:brightness-110 disabled:opacity-60"
              style={{ backgroundColor: '#00447f' }}>
              <Send className="w-4 h-4" />
              {sending ? "Submitting…" : "Submit Listing"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}