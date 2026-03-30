import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_BADGE = {
  "Available": "bg-green-100 text-green-700",
  "Under Contract": "bg-amber-100 text-amber-700",
  "Sold": "bg-gray-100 text-gray-500",
  "Off Market": "bg-red-100 text-red-600",
};

function ContactForm({ aircraftTitle }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "info@flyclearblue.com",
        subject: `Inquiry about ${aircraftTitle} from ${form.name}`,
        body: `Aircraft: ${aircraftTitle}\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`
      });
    } catch {}
    setSending(false);
    setSent(true);
  };
  if (sent) return <p className="text-green-600 font-semibold py-4 text-center">Message sent! We'll be in touch soon.</p>;
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Name *" value={form.name} onChange={e => update("name", e.target.value)} />
      <input required type="email" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="E-mail *" value={form.email} onChange={e => update("email", e.target.value)} />
      <input required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Telephone *" value={form.phone} onChange={e => update("phone", e.target.value)} />
      <textarea required rows={4} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Message *" value={form.message} onChange={e => update("message", e.target.value)} />
      <div className="flex gap-3 items-center">
        <button type="submit" disabled={sending} className="bg-[#1a3a5c] text-white px-5 py-2 rounded text-sm font-medium hover:bg-[#14304d] transition-colors">{sending ? "Sending..." : "Send message"}</button>
        <button type="button" onClick={() => setForm({ name: "", email: "", phone: "", message: "" })} className="text-sm text-gray-500 underline">clear</button>
      </div>
    </form>
  );
}

export default function PublicAircraftDetail() {
  const { id } = useParams();
  const [aircraft, setAircraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    base44.entities.Aircraft.list().then(data => {
      const found = data.find(a => a.id === id);
      setAircraft(found || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-4 border-[#1a3a5c]/20 border-t-[#1a3a5c] rounded-full animate-spin" />
    </div>
  );

  if (!aircraft) return (
    <div className="text-center py-32 text-gray-500">
      <p>Aircraft not found.</p>
      <Link to="/public/inventory" className="text-[#5b99cc] hover:underline mt-2 inline-block">← Back to Inventory</Link>
    </div>
  );

  const images = aircraft.images || [];
  const title = `${aircraft.year} ${aircraft.make} ${aircraft.model}`;

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-[#1a3a5c] py-12 text-center">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {aircraft.status && (
          <span className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-semibold ${STATUS_BADGE[aircraft.status] || 'bg-gray-100 text-gray-600'}`}>
            {aircraft.status}
          </span>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-10">
        {/* Main */}
        <div className="lg:col-span-2">
          <Link to="/public/inventory" className="text-[#5b99cc] text-sm hover:underline flex items-center gap-1 mb-6">
            <ChevronLeft className="w-4 h-4" /> Back to Inventory
          </Link>

          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="mb-8">
              <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
                <img src={images[imgIdx]} alt={title} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setImgIdx(i => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-xs bg-black/40 px-2 py-0.5 rounded-full">{imgIdx + 1} / {images.length}</div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={`shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-[#5b99cc]' : 'border-transparent'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Specs */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-[#1a3a5c] mb-4">Aircraft Specifications</h2>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {[
                ["Registration", aircraft.registration],
                ["Year", aircraft.year],
                ["Make", aircraft.make],
                ["Model", aircraft.model],
                ["Serial Number", aircraft.serial_number],
                ["Total Time", aircraft.total_time ? `${aircraft.total_time.toLocaleString()} hrs` : null],
                ["Engine SMOH", aircraft.engine_time_smoh ? `${aircraft.engine_time_smoh.toLocaleString()} hrs` : null],
                ["Engine Type", aircraft.engine_type],
                ["Number of Engines", aircraft.num_engines],
                ["Propeller Time", aircraft.propeller_time ? `${aircraft.propeller_time.toLocaleString()} hrs` : null],
                ["Avionics", aircraft.avionics_suite],
                ["Interior Condition", aircraft.interior_condition],
                ["Exterior Condition", aircraft.exterior_condition],
                ["Paint Year", aircraft.paint_year],
                ["Interior Year", aircraft.interior_year],
                ["Damage History", aircraft.damage_history],
                ["ADS-B Compliant", aircraft.adsb_compliant != null ? (aircraft.adsb_compliant ? "Yes" : "No") : null],
                ["Useful Load", aircraft.useful_load ? `${aircraft.useful_load.toLocaleString()} lbs` : null],
                ["Fuel Capacity", aircraft.fuel_capacity ? `${aircraft.fuel_capacity} gal` : null],
                ["Location", aircraft.location],
                ["Annual Due", aircraft.annual_due],
              ].filter(([, v]) => v != null && v !== "").map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-gray-50 py-1.5">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800 text-right max-w-[55%]">{String(value)}</span>
                </div>
              ))}
            </div>
            {aircraft.asking_price && aircraft.status !== "Sold" && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-2xl font-bold text-[#1a3a5c]">Asking Price: ${aircraft.asking_price.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Notes / Description */}
          {aircraft.notes && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-[#1a3a5c] mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{aircraft.notes}</p>
            </div>
          )}

          {/* Avionics Details */}
          {aircraft.avionics_details && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-[#1a3a5c] mb-3">Avionics Details</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{aircraft.avionics_details}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price callout */}
          {aircraft.asking_price && aircraft.status !== "Sold" && (
            <div className="bg-[#1a3a5c] text-white rounded-lg p-5 text-center">
              <p className="text-sm opacity-80 mb-1">Asking Price</p>
              <p className="text-3xl font-bold">${aircraft.asking_price.toLocaleString()}</p>
            </div>
          )}

          {/* Quick action buttons */}
          <div className="space-y-3">
            <a href="mailto:info@flyclearblue.com" className="flex items-center justify-center gap-2 bg-[#4a9c6d] text-white px-4 py-3 rounded font-semibold text-sm hover:bg-[#3a8c5d] transition-colors w-full">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Email Us
            </a>
            <a href="http://www.banterraaircraft.com/loans/overview" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#4a9c6d] text-white px-4 py-3 rounded font-semibold text-sm hover:bg-[#3a8c5d] transition-colors w-full">
              Apply for Financing
            </a>
            <a href="http://www.falconinsurance.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#4a9c6d] text-white px-4 py-3 rounded font-semibold text-sm hover:bg-[#3a8c5d] transition-colors w-full">
              Get Insurance Quote
            </a>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
            <h3 className="font-bold text-[#1a3a5c] mb-4">We'd love to hear from you.</h3>
            <ContactForm aircraftTitle={title} />
          </div>
        </div>
      </div>
    </div>
  );
}