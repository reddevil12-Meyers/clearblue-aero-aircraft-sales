import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plane, Phone, Mail, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "../../components/FormatCurrency";

export default function PublicAircraftDetail() {
  const { id } = useParams();
  const [aircraft, setAircraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [inquirySent, setInquirySent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    base44.entities.Aircraft.list().then(data => {
      setAircraft(data.find(a => a.id === id) || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleInquiry = async (e) => {
    e.preventDefault();
    setSending(true);
    const msg = form.message || `I'm interested in the ${aircraft.year} ${aircraft.make} ${aircraft.model} (${aircraft.registration}).`;
    await base44.integrations.Core.SendEmail({
      to: "sales@flyclearblue.com",
      subject: `Aircraft Inquiry: ${aircraft.year} ${aircraft.make} ${aircraft.model} (${aircraft.registration})`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${msg}`,
    });
    setSending(false);
    setInquirySent(true);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-[#C9A84C]/20 border-t-[#C9A84C] rounded-full animate-spin" />
    </div>
  );

  if (!aircraft) return (
    <div className="text-center py-32">
      <Plane className="w-16 h-16 text-gray-200 mx-auto mb-5" />
      <p className="text-gray-400 text-lg">Aircraft not found.</p>
      <Link to="/public/inventory" className="mt-4 inline-block font-bold text-[#C9A84C] hover:underline">← Back to Inventory</Link>
    </div>
  );

  const images = aircraft.images || [];

  const specs = [
    ["Registration", aircraft.registration],
    ["Year", aircraft.year],
    ["Make / Model", aircraft.make && aircraft.model ? `${aircraft.make} ${aircraft.model}` : null],
    ["Serial Number", aircraft.serial_number],
    ["Total Time", aircraft.total_time ? `${aircraft.total_time.toLocaleString()} hrs` : null],
    ["Engine SMOH", aircraft.engine_time_smoh ? `${aircraft.engine_time_smoh.toLocaleString()} hrs` : null],
    ["Engine Type", aircraft.engine_type],
    ["Avionics", aircraft.avionics_suite],
    ["Interior", aircraft.interior_condition],
    ["Exterior", aircraft.exterior_condition],
    ["ADS-B Out", aircraft.adsb_compliant != null ? (aircraft.adsb_compliant ? "Compliant" : "Non-Compliant") : null],
    ["Useful Load", aircraft.useful_load ? `${aircraft.useful_load.toLocaleString()} lbs` : null],
    ["Fuel Capacity", aircraft.fuel_capacity ? `${aircraft.fuel_capacity} gal` : null],
    ["Location", aircraft.location],
    ["Damage History", aircraft.damage_history],
    ["Annual Due", aircraft.annual_due],
  ].filter(([, v]) => v != null);

  return (
    <div className="bg-white">
      {/* Sub-header */}
      <div className="bg-[#050d1a] px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/public/inventory" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Inventory
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid lg:grid-cols-5 gap-14">
          {/* Left */}
          <div className="lg:col-span-3 space-y-10">
            {/* Gallery */}
            <div>
              <div className="relative rounded-2xl overflow-hidden bg-[#050d1a] aspect-video">
                {images.length > 0 ? (
                  <img src={images[photoIdx]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Plane className="w-24 h-24 text-white/10" />
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button onClick={() => setPhotoIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setPhotoIdx(i => (i + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-medium">
                      {photoIdx + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {images.map((url, i) => (
                    <button key={i} onClick={() => setPhotoIdx(i)} className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === photoIdx ? 'border-[#C9A84C]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specs */}
            <div>
              <h2 className="text-2xl font-black text-[#050d1a] mb-6">Aircraft Specifications</h2>
              <div className="grid grid-cols-2 gap-px bg-gray-100 rounded-2xl overflow-hidden">
                {specs.map(([label, value]) => (
                  <div key={label} className="bg-white px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium mb-0.5 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-bold text-[#050d1a]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {aircraft.avionics_details && (
              <div>
                <h2 className="text-2xl font-black text-[#050d1a] mb-4">Avionics Details</h2>
                <p className="text-gray-500 leading-relaxed whitespace-pre-wrap">{aircraft.avionics_details}</p>
              </div>
            )}
            {aircraft.notes && (
              <div>
                <h2 className="text-2xl font-black text-[#050d1a] mb-4">Additional Information</h2>
                <p className="text-gray-500 leading-relaxed whitespace-pre-wrap">{aircraft.notes}</p>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Card */}
            <div className="bg-[#050d1a] text-white rounded-2xl p-8">
              <h1 className="text-2xl font-black mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {aircraft.year} {aircraft.make} {aircraft.model}
              </h1>
              <p className="text-white/40 text-sm mb-6">{aircraft.registration}{aircraft.location ? ` · ${aircraft.location}` : ''}</p>
              {aircraft.status === 'Under Contract' && (
                <div className="mb-5 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-2.5 text-sm text-orange-400 font-semibold">
                  This aircraft is currently under contract.
                </div>
              )}
              <p className="text-5xl font-black text-[#C9A84C] mb-8">{formatCurrency(aircraft.asking_price)}</p>
              <div className="space-y-2.5 mb-8">
                {aircraft.total_time && <div className="flex items-center gap-3 text-sm text-white/60"><Check className="w-4 h-4 text-[#C9A84C] shrink-0" />{aircraft.total_time.toLocaleString()} Total Time</div>}
                {aircraft.engine_type && <div className="flex items-center gap-3 text-sm text-white/60"><Check className="w-4 h-4 text-[#C9A84C] shrink-0" />{aircraft.engine_type} Engine</div>}
                {aircraft.avionics_suite && <div className="flex items-center gap-3 text-sm text-white/60"><Check className="w-4 h-4 text-[#C9A84C] shrink-0" />{aircraft.avionics_suite}</div>}
                {aircraft.adsb_compliant && <div className="flex items-center gap-3 text-sm text-white/60"><Check className="w-4 h-4 text-[#C9A84C] shrink-0" />ADS-B Out Compliant</div>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <a href="tel:+13862276840" className="flex items-center justify-center gap-2 py-3.5 rounded-lg font-bold text-sm text-[#050d1a] transition-all hover:brightness-110" style={{ backgroundColor: '#C9A84C' }}>
                  <Phone className="w-4 h-4" /> Call Us
                </a>
                <a href="mailto:sales@flyclearblue.com" className="flex items-center justify-center gap-2 py-3.5 rounded-lg font-bold text-sm text-white border border-white/20 hover:bg-white/10 transition-all">
                  <Mail className="w-4 h-4" /> Email
                </a>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h3 className="text-xl font-black text-[#050d1a] mb-6">Request Information</h3>
              {inquirySent ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#C9A84C' }}>
                    <Check className="w-6 h-6 text-[#050d1a]" />
                  </div>
                  <p className="font-black text-[#050d1a] text-lg">Inquiry Sent!</p>
                  <p className="text-sm text-gray-400 mt-2">We'll be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleInquiry} className="space-y-3">
                  <input required type="text" placeholder="Your Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 bg-[#f5f6f8]" />
                  <input required type="email" placeholder="Email Address" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 bg-[#f5f6f8]" />
                  <input type="tel" placeholder="Phone Number" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 bg-[#f5f6f8]" />
                  <textarea rows={3} placeholder="Message (optional)" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 bg-[#f5f6f8] resize-none" />
                  <button type="submit" disabled={sending} className="w-full py-4 rounded-lg font-bold text-sm text-[#050d1a] transition-all hover:brightness-110 disabled:opacity-60" style={{ backgroundColor: '#C9A84C' }}>
                    {sending ? "Sending..." : "Send Inquiry"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}