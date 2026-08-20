import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, Loader2 } from "lucide-react";

const COCKPIT_IMAGE = "https://images.unsplash.com/photo-1583500178690-f7facca6f7af?w=1600&q=80";

const LEAD_SOURCES = [
  "Referral",
  "Website",
  "Trade-A-Plane",
  "Controller",
  "AirMart",
  "Social Media",
  "Google Search",
  "Other"
];

export default function ValuationForm() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    year: "",
    make: "",
    model: "",
    total_hours: "",
    additional_notes: "",
    lead_source: ""
  });
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!consent) {
      setError("Please agree to the privacy policy to continue.");
      return;
    }

    setSubmitting(true);
    try {
      await base44.functions.invoke('submitValuationRequest', {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        make: form.make,
        model: form.model,
        year: form.year,
        total_hours: form.total_hours,
        additional_notes: form.additional_notes,
        lead_source: form.lead_source,
        referral_code: localStorage.getItem('affiliate_ref') || '',
        employee_code: localStorage.getItem('employee_ref') || ''
      });
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.error || "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  const inputClass = "w-full px-3 py-2.5 border border-white/40 rounded text-sm text-gray-800 outline-none focus:border-[#00447f] focus:ring-1 focus:ring-[#00447f]/20 transition-all bg-white/80";
  const labelClass = "block text-xs font-bold text-[#0d1a26] mb-1.5 uppercase tracking-wide";

  if (submitted) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-lg mx-auto text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="text-xl font-black text-[#00447f] mb-2">Request Received!</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Thank you — our team will review your aircraft details and reach out with a fair market valuation within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 md:p-8 max-w-lg">
      <h3 className="text-2xl font-black text-[#00447f] leading-tight mb-2 uppercase">
        Quick, No BS Aircraft Valuation
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-6">
        Submit a few details about your aircraft, and our team will return a fair market valuation and explain how we can help you.
      </p>

      <div className="space-y-4">
        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>First <span className="text-red-500">*</span></label>
            <input className={inputClass} value={form.first_name} onChange={handleChange('first_name')} required />
          </div>
          <div>
            <label className={labelClass}>Last <span className="text-red-500">*</span></label>
            <input className={inputClass} value={form.last_name} onChange={handleChange('last_name')} required />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>Email <span className="text-red-500">*</span></label>
          <input type="email" className={inputClass} value={form.email} onChange={handleChange('email')} required />
        </div>

        {/* Phone */}
        <div>
          <label className={labelClass}>Phone <span className="text-red-500">*</span></label>
          <input type="tel" className={inputClass} value={form.phone} onChange={handleChange('phone')} required />
        </div>

        {/* Aircraft details */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Year <span className="text-red-500">*</span></label>
            <input className={inputClass} value={form.year} onChange={handleChange('year')} required />
          </div>
          <div>
            <label className={labelClass}>Make <span className="text-red-500">*</span></label>
            <input className={inputClass} value={form.make} onChange={handleChange('make')} required />
          </div>
          <div>
            <label className={labelClass}>Model <span className="text-red-500">*</span></label>
            <input className={inputClass} value={form.model} onChange={handleChange('model')} required />
          </div>
        </div>

        <div>
          <label className={labelClass}>Total Hours <span className="text-red-500">*</span></label>
          <input type="number" className={inputClass} value={form.total_hours} onChange={handleChange('total_hours')} required />
        </div>

        {/* Additional Notes */}
        <div>
          <label className={labelClass}>Additional Notes</label>
          <textarea rows={3} className={inputClass} value={form.additional_notes} onChange={handleChange('additional_notes')} />
        </div>

        {/* Lead Source */}
        <div>
          <label className={labelClass}>How did you hear about us?</label>
          <select className={inputClass} value={form.lead_source} onChange={handleChange('lead_source')}>
            <option value="">Make Selection</option>
            {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Consent */}
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#00447f] cursor-pointer" />
          <span className="text-xs text-gray-600 leading-relaxed">
            I agree to the privacy policy. <span className="text-red-500">*</span>
          </span>
        </label>

        {/* CAPTCHA placeholder */}
        <div className="flex items-center gap-2 py-1">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2">
            <input type="checkbox" required className="w-4 h-4 accent-[#00447f] cursor-pointer" />
            <span className="text-xs text-gray-500">I'm not a robot</span>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded font-bold text-sm transition-all hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ backgroundColor: '#00447f', color: '#fff' }}
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? "Submitting..." : "Get My Valuation"}
        </button>
      </div>
    </form>
  );
}