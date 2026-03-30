import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle, ArrowRight } from "lucide-react";

const MAKES = ["Cessna", "Piper", "Beechcraft", "Cirrus", "Mooney", "Diamond", "Socata", "Grumman", "Commander", "Pilatus", "TBM", "Other"];
const CONDITIONS = ["New/Refurbished", "Excellent", "Good", "Fair", "Poor"];
const ENGINE_TYPES = ["Piston", "Turboprop", "Turbojet", "Turbofan"];

const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 bg-[#f5f6f8] text-[#050d1a] font-medium";

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
      {label}{required && ' *'}
    </label>
    {children}
  </div>
);

export default function AircraftEntryForm({ engineType }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    make: "", model: "", year: "", registration: "", serial_number: "",
    total_time: "", engine_time_smoh: "", engine_manufacturer: "", engine_type: "",
    propeller_manufacturer: "", propeller_time: "",
    avionics_suite: "",
    interior_condition: "", exterior_condition: "", asking_price: "",
    location: "", notes: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.integrations.Core.SendEmail({
      to: "sales@flyclearblue.com",
      subject: `New ${engineType === 'twin' ? 'Twin Engine' : 'Single Engine'} Listing: ${form.year} ${form.make} ${form.model}`,
      body: `SELLER\nName: ${form.first_name} ${form.last_name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nAIRCRAFT\nYear/Make/Model: ${form.year} ${form.make} ${form.model}\nRegistration: ${form.registration}\nSerial: ${form.serial_number}\nEngine Type: ${engineType === 'twin' ? 'Twin Engine' : 'Single Engine'}\nTotal Time: ${form.total_time} hrs\nEngine SMOH: ${form.engine_time_smoh} hrs\nEngine Manufacturer: ${form.engine_manufacturer}\nEngine Type: ${form.engine_type}\nPropeller Manufacturer: ${form.propeller_manufacturer}\nPropeller Total Time: ${form.propeller_time} hrs\nAvionics: ${form.avionics_suite}\nInterior: ${form.interior_condition}\nExterior: ${form.exterior_condition}\nAsking Price: $${form.asking_price}\nLocation: ${form.location}\n\nNOTES:\n${form.notes}`,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8" style={{ backgroundColor: '#C9A84C' }}>
          <CheckCircle className="w-10 h-10 text-[#050d1a]" />
        </div>
        <h2 className="text-3xl font-black text-[#050d1a] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Submission Received</h2>
        <p className="text-gray-500 text-lg leading-relaxed">A ClearBlue Aero broker will contact you within one business day.</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f5f6f8] min-h-screen w-full">
      {/* Header */}
      <div className="bg-[#050d1a] py-20 px-4 text-center">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">
          {engineType === 'twin' ? 'Twin Engine' : 'Single Engine'} Listing
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          List Your Aircraft
        </h1>
        <p className="text-white/40">A broker will respond within one business day.</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Contact */}
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 pb-4 border-b border-gray-100">Your Information</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First Name" required>
                <input required type="text" value={form.first_name} onChange={e => update('first_name', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Last Name" required>
                <input required type="text" value={form.last_name} onChange={e => update('last_name', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Email" required>
                <input required type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Phone">
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className={inputClass} />
              </Field>
            </div>
          </div>

          {/* Aircraft */}
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 pb-4 border-b border-gray-100">Aircraft Details</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Make" required>
                <select required value={form.make} onChange={e => update('make', e.target.value)} className={inputClass}>
                  <option value="">Select make...</option>
                  {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Model" required>
                <input required type="text" value={form.model} onChange={e => update('model', e.target.value)} className={inputClass} placeholder="e.g. 172S" />
              </Field>
              <Field label="Year" required>
                <input required type="number" value={form.year} onChange={e => update('year', e.target.value)} className={inputClass} placeholder="2005" />
              </Field>
              <Field label="Registration" required>
                <input required type="text" value={form.registration} onChange={e => update('registration', e.target.value)} className={inputClass} placeholder="N12345" />
              </Field>
              <Field label="Serial Number">
                <input type="text" value={form.serial_number} onChange={e => update('serial_number', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Total Time (hrs)">
                <input type="number" value={form.total_time} onChange={e => update('total_time', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Engine Time SMOH (hrs)">
                <input type="number" value={form.engine_time_smoh} onChange={e => update('engine_time_smoh', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Engine Manufacturer">
                <input type="text" value={form.engine_manufacturer} onChange={e => update('engine_manufacturer', e.target.value)} className={inputClass} placeholder="e.g. Lycoming, Continental" />
              </Field>
              <Field label="Engine Type">
                <select value={form.engine_type} onChange={e => update('engine_type', e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {ENGINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Propeller Manufacturer">
                <input type="text" value={form.propeller_manufacturer} onChange={e => update('propeller_manufacturer', e.target.value)} className={inputClass} placeholder="e.g. Hartzell, McCauley" />
              </Field>
              <Field label="Propeller Total Time (hrs)">
                <input type="number" value={form.propeller_time} onChange={e => update('propeller_time', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Avionics">
                <input type="text" value={form.avionics_suite} onChange={e => update('avionics_suite', e.target.value)} className={inputClass} placeholder="e.g. Garmin G1000" />
              </Field>
              <Field label="Interior Condition">
                <select value={form.interior_condition} onChange={e => update('interior_condition', e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Exterior Condition">
                <select value={form.exterior_condition} onChange={e => update('exterior_condition', e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Asking Price ($)">
                <input type="number" value={form.asking_price} onChange={e => update('asking_price', e.target.value)} className={inputClass} placeholder="e.g. 85000" />
              </Field>
              <Field label="Location (Airport)">
                <input type="text" value={form.location} onChange={e => update('location', e.target.value)} className={inputClass} placeholder="KDAB" />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Additional Notes">
                <textarea rows={4} value={form.notes} onChange={e => update('notes', e.target.value)} className={`${inputClass} resize-none`} placeholder="Paint year, damage history, upgrades, logbooks..." />
              </Field>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-5 rounded-xl font-black text-[#050d1a] text-base flex items-center justify-center gap-3 transition-all hover:brightness-110 disabled:opacity-60"
            style={{ backgroundColor: '#C9A84C' }}
          >
            {submitting ? "Submitting..." : <>Submit Listing Inquiry <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}