import { useState } from "react";
import { CheckCircle, Send, Plane } from "lucide-react";
import { base44 } from "@/api/base44Client";

import { MAKES, AVIONICS } from "@/lib/aircraftOptions";
const CONDITIONS = ["New/Refurbished", "Excellent", "Good", "Fair", "Poor"];

const Field = ({ label, value, onChange, type = "text", placeholder, required }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1">{label}{required && " *"}</label>
    <input
      required={required} type={type} value={value} onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1">{label}{required && " *"}</label>
    <select
      required={required} value={value} onChange={onChange}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors bg-white"
    >
      <option value="">Select…</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default function AircraftEntryForm({ engineType = "single" }) {
  const isTwin = engineType === "twin";
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    make: "", model: "", year: "", registration: "", serial_number: "",
    total_time: "", engine_time_smoh: "", avionics_suite: "",
    interior_condition: "", exterior_condition: "",
    asking_price: "", location: "", notes: "",
    engine_manufacturer: "", engine_model: "", engine2_time_smoh: "",
    propeller_manufacturer: "", propeller_model: "", propeller_time: "",
    propeller2_time: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const f = (field) => ({ value: form[field], onChange: e => update(field, e.target.value) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await base44.functions.invoke('submitListing', { ...form, engineType, referral_code: localStorage.getItem('affiliate_ref') || '', employee_code: localStorage.getItem('employee_ref') || '' });
      setSent(true);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#f5f6f8] min-h-screen">
      <div className="bg-[#00447f] py-20 px-4 text-center">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">
          {isTwin ? "Multi-Engine" : "Single Engine"} Aircraft
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
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
              onClick={() => { setSent(false);               setForm({ name: "", email: "", phone: "", make: "", model: "", year: "", registration: "", serial_number: "", total_time: "", engine_time_smoh: "", avionics_suite: "", interior_condition: "", exterior_condition: "", asking_price: "", location: "", notes: "", engine_manufacturer: "", engine_model: "", engine2_time_smoh: "", propeller_manufacturer: "", propeller_model: "", propeller_time: "", propeller2_time: "" }); }}
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
                 <Field label="Full Name" {...f('name')} required placeholder="John Smith" />
                 <Field label="Email" {...f('email')} type="email" required placeholder="john@example.com" />
                 <Field label="Phone" {...f('phone')} placeholder="(555) 123-4567" />
               </div>
            </div>

            {/* Aircraft Info */}
            <div>
              <h2 className="text-base font-black text-[#00447f] mb-4 uppercase tracking-wider">Aircraft Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <SelectField label="Make" {...f('make')} options={MAKES} required />
                <Field label="Model" {...f('model')} required placeholder="172S" />
                <Field label="Year" {...f('year')} type="number" required placeholder="2005" />
                <Field label="Registration" {...f('registration')} required placeholder="N12345" />
                <Field label="Serial Number" {...f('serial_number')} placeholder="S/N" />
                <Field label="Total Time (hrs)" {...f('total_time')} type="number" placeholder="1500" />
                {!isTwin && <Field label="Engine Time SMOH (hrs)" {...f('engine_time_smoh')} type="number" placeholder="450" />}
                <Field label="Location (Airport)" {...f('location')} placeholder="KFIN" />
                <SelectField label="Avionics Suite" {...f('avionics_suite')} options={AVIONICS} />
                <SelectField label="Interior Condition" {...f('interior_condition')} options={CONDITIONS} />
                <SelectField label="Exterior Condition" {...f('exterior_condition')} options={CONDITIONS} />
                <Field label="Asking Price ($)" {...f('asking_price')} type="number" placeholder="85000" />
                </div>
                </div>

                {/* Engine & Propeller Information — multi-engine only */}
                {isTwin && (
                <div>
                <h2 className="text-base font-black text-[#00447f] mb-4 uppercase tracking-wider">Engine Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Engine Manufacturer" {...f('engine_manufacturer')} placeholder="Lycoming" />
                  <Field label="Engine Model" {...f('engine_model')} placeholder="O-320" />
                  <Field label="Engine 1 Time SMOH (hrs)" {...f('engine_time_smoh')} type="number" placeholder="450" />
                  <Field label="Engine 2 Time SMOH (hrs)" {...f('engine2_time_smoh')} type="number" placeholder="450" />
                </div>
                <div className="grid sm:grid-cols-3 gap-4 mt-4">
                  <Field label="Propeller Manufacturer" {...f('propeller_manufacturer')} placeholder="Hartzell" />
                  <Field label="Propeller Model" {...f('propeller_model')} placeholder="HC-C2YK" />
                  <Field label="Propeller 1 Time (hrs)" {...f('propeller_time')} type="number" placeholder="1200" />
                </div>
                <div className="grid sm:grid-cols-3 gap-4 mt-4">
                  <Field label="Propeller 2 Time (hrs)" {...f('propeller2_time')} type="number" placeholder="1200" />
                </div>
                </div>
                )}

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