import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle } from "lucide-react";

const MAKES = ["Cessna", "Piper", "Beechcraft", "Cirrus", "Mooney", "Diamond", "Socata", "Grumman", "Commander", "Pilatus", "TBM", "Other"];
const CONDITIONS = ["New/Refurbished", "Excellent", "Good", "Fair", "Poor"];

export default function AircraftEntryForm({ engineType }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    make: "", model: "", year: "", registration: "", serial_number: "",
    total_time: "", engine_time_smoh: "", avionics_suite: "",
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
      subject: `New Seller Inquiry: ${form.year} ${form.make} ${form.model} (${form.registration})`,
      body: `
Seller: ${form.first_name} ${form.last_name}
Email: ${form.email}
Phone: ${form.phone}

Aircraft: ${form.year} ${form.make} ${form.model}
Registration: ${form.registration}
Serial Number: ${form.serial_number}
Engine Type: ${engineType === 'twin' ? 'Twin Engine' : 'Single Engine'}
Total Time: ${form.total_time} hrs
Engine SMOH: ${form.engine_time_smoh} hrs
Avionics: ${form.avionics_suite}
Interior: ${form.interior_condition}
Exterior: ${form.exterior_condition}
Asking Price: $${form.asking_price}
Location: ${form.location}

Notes:
${form.notes}
      `.trim()
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Submission Received!</h2>
        <p className="text-gray-500">Thank you for reaching out. A ClearBlue Aero broker will contact you within 1 business day to discuss your aircraft listing.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          List Your {engineType === 'twin' ? 'Twin Engine' : 'Single Engine'} Aircraft
        </h1>
        <p className="text-gray-500">Fill out the form below and a broker will contact you within 1 business day.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact Info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-7">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">Your Contact Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "First Name", field: "first_name", required: true },
              { label: "Last Name", field: "last_name", required: true },
              { label: "Email Address", field: "email", type: "email", required: true },
              { label: "Phone Number", field: "phone", type: "tel" },
            ].map(({ label, field, type = "text", required }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}{required && ' *'}</label>
                <input required={required} type={type} value={form[field]} onChange={e => update(field, e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Aircraft Info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-7">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">Aircraft Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Make *</label>
              <select required value={form.make} onChange={e => update('make', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                <option value="">Select make...</option>
                {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Model *</label>
              <input required type="text" value={form.model} onChange={e => update('model', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="e.g. 172S, PA-28" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Year *</label>
              <input required type="number" value={form.year} onChange={e => update('year', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="2005" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Registration (N-Number) *</label>
              <input required type="text" value={form.registration} onChange={e => update('registration', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="N12345" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Serial Number</label>
              <input type="text" value={form.serial_number} onChange={e => update('serial_number', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Total Time (hrs)</label>
              <input type="number" value={form.total_time} onChange={e => update('total_time', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Engine Time SMOH (hrs)</label>
              <input type="number" value={form.engine_time_smoh} onChange={e => update('engine_time_smoh', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Avionics</label>
              <input type="text" value={form.avionics_suite} onChange={e => update('avionics_suite', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="e.g. Garmin G1000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Interior Condition</label>
              <select value={form.interior_condition} onChange={e => update('interior_condition', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                <option value="">Select...</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Exterior Condition</label>
              <select value={form.exterior_condition} onChange={e => update('exterior_condition', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                <option value="">Select...</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Asking Price ($)</label>
              <input type="number" value={form.asking_price} onChange={e => update('asking_price', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="e.g. 85000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Location (Airport)</label>
              <input type="text" value={form.location} onChange={e => update('location', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="KDAB" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Additional Notes</label>
            <textarea rows={4} value={form.notes} onChange={e => update('notes', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" placeholder="Any additional information about your aircraft..." />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="w-full py-4 rounded-xl text-white font-bold text-base transition-all disabled:opacity-60" style={{ backgroundColor: '#0a1628' }}>
          {submitting ? "Submitting..." : "Submit Listing Inquiry"}
        </button>
      </form>
    </div>
  );
}