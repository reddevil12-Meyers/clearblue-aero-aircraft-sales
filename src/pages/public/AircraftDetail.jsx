import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_BADGE = {
  "Available": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Under Contract": "bg-amber-50 text-amber-700 border border-amber-200",
  "Sold": "bg-gray-100 text-gray-500 border border-gray-200",
  "Off Market": "bg-red-50 text-red-600 border border-red-200",
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
  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 bg-gray-50 transition-colors";
  if (sent) return (
    <div className="text-center py-6">
      <p className="font-semibold text-gray-800">Message sent!</p>
      <p className="text-sm text-gray-500 mt-1">We'll be in touch shortly.</p>
    </div>
  );
  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <input required className={inputClass} placeholder="Your name" value={form.name} onChange={e => update("name", e.target.value)} />
      <input required type="email" className={inputClass} placeholder="Email address" value={form.email} onChange={e => update("email", e.target.value)} />
      <input required className={inputClass} placeholder="Phone number" value={form.phone} onChange={e => update("phone", e.target.value)} />
      <textarea required rows={3} className={inputClass} placeholder="Your message" value={form.message} onChange={e => update("message", e.target.value)} />
      <button type="submit" disabled={sending} className="w-full py-3 text-sm font-bold text-white rounded-lg transition-colors" style={{ backgroundColor: '#0a1628' }}>
        {sending ? "Sending..." : "Send Inquiry"}
      </button>
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
      setAircraft(data.find(a => a.id === id) || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
    </div>
  );

  if (!aircraft) return (
    <div className="text-center py-32 text-gray-400">
      <p className="text-lg font-medium">Aircraft not found</p>
      <Link to="/public/inventory" className="text-sm text-amber-600 hover:underline mt-3 inline-block">← Back to Inventory</Link>
    </div>
  );

  const images = aircraft.images || [];
  const title = `${aircraft.year} ${aircraft.make} ${aircraft.model}`;
  const specs = [
    ["Registration", aircraft.registration],
    ["Year", aircraft.year],
    ["Make / Model", `${aircraft.make} ${aircraft.model}`],
    ["Serial Number", aircraft.serial_number],
    ["Total Time", aircraft.total_time ? `${aircraft.total_time.toLocaleString()} hrs` : null],
    ["Engine SMOH", aircraft.engine_time_smoh ? `${aircraft.engine_time_smoh.toLocaleString()} hrs` : null],
    ["Engine Type", aircraft.engine_type],
    ["Engines", aircraft.num_engines],
    ["Propeller Time", aircraft.propeller_time ? `${aircraft.propeller_time.toLocaleString()} hrs` : null],
    ["Avionics", aircraft.avionics_suite],
    ["Interior Condition", aircraft.interior_condition],
    ["Exterior Condition", aircraft.exterior_condition],
    ["Paint Year", aircraft.paint_year],
    ["Interior Year", aircraft.interior_year],
    ["Damage History", aircraft.damage_history],
    ["ADS-B Out", aircraft.adsb_compliant != null ? (aircraft.adsb_compliant ? "Yes" : "No") : null],
    ["Useful Load", aircraft.useful_load ? `${aircraft.useful_load.toLocaleString()} lbs` : null],
    ["Fuel Capacity", aircraft.fuel_capacity ? `${aircraft.fuel_capacity} gal` : null],
    ["Location", aircraft.location],
    ["Annual Due", aircraft.annual_due],
  ].filter(([, v]) => v != null && v !== "");

  return (
    <div>
      {/* Hero */}
      <div className="relative py-24 px-6 text-center" style={{ backgroundColor: '#0a1628' }}>
        <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">Aircraft Detail</p>
        <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h1>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {aircraft.status && (
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${STATUS_BADGE[aircraft.status] || 'bg-gray-100 text-gray-500'}`}>{aircraft.status}</span>
          )}
          {aircraft.asking_price && aircraft.status !== "Sold" && (
            <span className="text-sm font-bold text-amber-400">${aircraft.asking_price.toLocaleString()}</span>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Link to="/public/inventory" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8">
            <ChevronLeft className="w-4 h-4" /> Back to Inventory
          </Link>

          {/* Gallery */}
          {images.length > 0 && (
            <div className="mb-8">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video shadow-lg">
                <img src={images[imgIdx]} alt={title} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white rounded-full p-2 hover:bg-black/60 transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setImgIdx(i => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white rounded-full p-2 hover:bg-black/60 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">{imgIdx + 1} / {images.length}</div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-amber-400' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {aircraft.notes && (
            <div className="bg-white rounded-2xl border border-gray-100 p-7 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-500 leading-relaxed whitespace-pre-line">{aircraft.notes}</p>
            </div>
          )}

          {/* Specs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-7 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Specifications</h2>
            <div className="grid sm:grid-cols-2 gap-x-12">
              {specs.map(([label, value]) => (
                <div key={label} className="flex justify-between py-3 border-b border-gray-50 gap-6">
                  <span className="text-sm text-gray-400 shrink-0">{label}</span>
                  <span className="text-sm font-medium text-gray-800 text-right">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Avionics Details */}
          {aircraft.avionics_details && (
            <div className="bg-white rounded-2xl border border-gray-100 p-7">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Avionics Details</h2>
              <p className="text-gray-500 leading-relaxed whitespace-pre-line">{aircraft.avionics_details}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Price */}
          {aircraft.asking_price && aircraft.status !== "Sold" && (
            <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: '#0a1628' }}>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Asking Price</p>
              <p className="text-3xl font-bold text-amber-400">${aircraft.asking_price.toLocaleString()}</p>
            </div>
          )}

          {/* Quick links */}
          <div className="space-y-2">
            <a href="mailto:info@flyclearblue.com" className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 transition-colors" style={{ borderColor: '#0a1628', color: '#0a1628' }}>
              Email Us
            </a>
            <a href="http://www.banterraaircraft.com/loans/overview" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-colors" style={{ backgroundColor: '#c9a84c' }}>
              Apply for Financing
            </a>
            <a href="http://www.falconinsurance.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
              Get Insurance Quote
            </a>
          </div>

          {/* Contact form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5">Inquire About This Aircraft</h3>
            <ContactForm aircraftTitle={title} />
          </div>
        </div>
      </div>
    </div>
  );
}