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

  useEffect(() => {
    base44.entities.Aircraft.list().then(data => {
      const found = data.find(a => a.id === id);
      setAircraft(found || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (aircraft) {
      form.message = form.message || `I'm interested in the ${aircraft.year} ${aircraft.make} ${aircraft.model} (${aircraft.registration}).`;
      await base44.integrations.Core.SendEmail({
        to: "sales@flyclearblue.com",
        subject: `Aircraft Inquiry: ${aircraft.year} ${aircraft.make} ${aircraft.model} (${aircraft.registration})`,
        body: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`,
      });
    }
    setInquirySent(true);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  if (!aircraft) return (
    <div className="text-center py-24">
      <Plane className="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <p className="text-gray-400">Aircraft not found.</p>
      <Link to="/public/inventory" className="mt-4 inline-block text-amber-600 hover:underline">← Back to Inventory</Link>
    </div>
  );

  const images = aircraft.images || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Link to="/public/inventory" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Inventory
      </Link>

      <div className="grid lg:grid-cols-5 gap-12">
        {/* Left: Photos + Specs */}
        <div className="lg:col-span-3 space-y-8">
          {/* Photo Gallery */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video">
              {images.length > 0 ? (
                <img src={images[photoIdx]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#0a1628' }}>
                  <Plane className="w-20 h-20 text-white/20" />
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setPhotoIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setPhotoIdx(i => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                    {photoIdx + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((url, i) => (
                  <button key={i} onClick={() => setPhotoIdx(i)} className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === photoIdx ? 'border-amber-500' : 'border-transparent'}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specs */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Aircraft Specifications</h2>
            <div className="grid grid-cols-2 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
              {[
                ["Registration", aircraft.registration],
                ["Year", aircraft.year],
                ["Make", aircraft.make],
                ["Model", aircraft.model],
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
              ].filter(([, v]) => v != null).map(([label, value]) => (
                <div key={label} className="bg-white px-4 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {aircraft.notes && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Additional Information</h2>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{aircraft.notes}</p>
            </div>
          )}

          {/* Avionics Details */}
          {aircraft.avionics_details && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Avionics Details</h2>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{aircraft.avionics_details}</p>
            </div>
          )}
        </div>

        {/* Right: Price + Contact */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                {aircraft.year} {aircraft.make} {aircraft.model}
              </h1>
            </div>
            <p className="text-gray-400 text-sm mb-5">{aircraft.registration} {aircraft.location ? `· ${aircraft.location}` : ''}</p>
            {aircraft.status === 'Under Contract' && (
              <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-sm text-orange-700 font-medium">
                This aircraft is currently under contract.
              </div>
            )}
            <p className="text-4xl font-bold mb-6" style={{ color: '#0a1628' }}>{formatCurrency(aircraft.asking_price)}</p>

            <div className="space-y-2 text-sm mb-7">
              {aircraft.total_time && <div className="flex items-center gap-2 text-gray-600"><Check className="w-4 h-4 text-amber-500" />{aircraft.total_time.toLocaleString()} Total Time</div>}
              {aircraft.engine_type && <div className="flex items-center gap-2 text-gray-600"><Check className="w-4 h-4 text-amber-500" />{aircraft.engine_type} Engine</div>}
              {aircraft.avionics_suite && <div className="flex items-center gap-2 text-gray-600"><Check className="w-4 h-4 text-amber-500" />{aircraft.avionics_suite}</div>}
              {aircraft.adsb_compliant && <div className="flex items-center gap-2 text-gray-600"><Check className="w-4 h-4 text-amber-500" />ADS-B Out Compliant</div>}
            </div>

            <div className="flex gap-3">
              <a href="tel:+13862276840" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-colors" style={{ backgroundColor: '#0a1628' }}>
                <Phone className="w-4 h-4" /> Call Us
              </a>
              <a href="mailto:sales@flyclearblue.com" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-700 hover:border-gray-400 transition-colors">
                <Mail className="w-4 h-4" /> Email
              </a>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Request Information</h3>
            {inquirySent ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                <p className="font-semibold text-gray-800">Inquiry Sent!</p>
                <p className="text-sm text-gray-500 mt-1">We'll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleInquiry} className="space-y-3">
                <input required type="text" placeholder="Your Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                <input required type="email" placeholder="Email Address" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                <input type="tel" placeholder="Phone Number" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                <textarea rows={3} placeholder="Message (optional)" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-colors" style={{ backgroundColor: '#d97706' }}>
                  Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}