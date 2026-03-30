import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plane, ArrowLeft, Phone, Mail, MapPin, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default function PublicAircraftDetail() {
  const { id } = useParams();
  const [aircraft, setAircraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    base44.entities.Aircraft.filter({ show_on_public: true }, '-created_date', 200)
      .then(data => {
        const found = data.find(a => a.id === id);
        setAircraft(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-40">
      <div className="w-8 h-8 border-4 border-[#00447f]/20 border-t-[#00447f] rounded-full animate-spin" />
    </div>
  );

  if (!aircraft) return (
    <div className="text-center py-40 text-gray-400">
      <Plane className="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p className="text-xl font-semibold">Aircraft not found</p>
      <Link to="/public/inventory" className="text-[#00447f] text-sm mt-4 inline-block hover:underline">← Back to Inventory</Link>
    </div>
  );

  const images = aircraft.images || [];

  const specs = [
    { label: "Year", value: aircraft.year },
    { label: "Registration", value: aircraft.registration },
    { label: "Serial Number", value: aircraft.serial_number },
    { label: "Total Time", value: aircraft.total_time ? `${aircraft.total_time.toLocaleString()} hrs` : null },
    { label: "Engine Time SMOH", value: aircraft.engine_time_smoh ? `${aircraft.engine_time_smoh.toLocaleString()} hrs` : null },
    { label: "Engine Type", value: aircraft.engine_type },
    { label: "Engine Manufacturer", value: aircraft.engine_manufacturer },
    { label: "Avionics", value: aircraft.avionics_suite },
    { label: "Interior Condition", value: aircraft.interior_condition },
    { label: "Exterior Condition", value: aircraft.exterior_condition },
    { label: "ADS-B Compliant", value: aircraft.adsb_compliant === true ? "Yes" : aircraft.adsb_compliant === false ? "No" : null },
    { label: "Useful Load", value: aircraft.useful_load ? `${aircraft.useful_load.toLocaleString()} lbs` : null },
    { label: "Fuel Capacity", value: aircraft.fuel_capacity ? `${aircraft.fuel_capacity} gal` : null },
    { label: "Location", value: aircraft.location },
    { label: "Annual Due", value: aircraft.annual_due },
  ].filter(s => s.value);

  return (
    <div className="bg-[#f5f6f8] min-h-screen">
      {/* Back nav */}
      <div className="bg-[#00447f] px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <Link to="/public/inventory" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Inventory
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
        {/* Left / Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="relative aspect-video bg-gray-100">
              {images.length > 0 ? (
                <>
                  <img src={images[imgIndex]} alt={`Photo ${imgIndex + 1}`} className="w-full h-full object-cover" />
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={() => setImgIndex(i => (i + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button key={i} onClick={() => setImgIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? 'bg-white' : 'bg-white/40'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Plane className="w-20 h-20 text-gray-200" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((url, i) => (
                  <button key={i} onClick={() => setImgIndex(i)}
                    className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === imgIndex ? 'border-[#00447f]' : 'border-transparent'}`}>
                    <img src={url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + Price */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-[#00447f]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {aircraft.year} {aircraft.make} {aircraft.model}
                </h1>
                <p className="text-gray-400 mt-1 flex items-center gap-1"><MapPin className="w-4 h-4" />{aircraft.location || "Location available on request"}</p>
              </div>
              {aircraft.asking_price && (
                <div className="text-right">
                  <p className="text-3xl font-black text-[#C9A84C]">${aircraft.asking_price.toLocaleString()}</p>
                  {aircraft.status === "Under Contract" && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700">Under Contract</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Specs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-black text-[#00447f] mb-4">Aircraft Specifications</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {specs.map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#00447f' }} />
                  <span className="text-gray-400 text-sm">{label}:</span>
                  <span className="text-gray-800 text-sm font-semibold">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Avionics Details */}
          {aircraft.avionics_details && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-black text-[#00447f] mb-3">Avionics Details</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{aircraft.avionics_details}</p>
            </div>
          )}

          {/* Notes */}
          {aircraft.notes && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-black text-[#00447f] mb-3">Additional Notes</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{aircraft.notes}</p>
            </div>
          )}
        </div>

        {/* Right / Contact */}
        <div className="space-y-5">
          <div className="bg-[#00447f] text-white rounded-2xl p-6 sticky top-28">
            <h3 className="text-xl font-black mb-1">Interested?</h3>
            <p className="text-white/50 text-sm mb-5">Contact our team for more information or to schedule a viewing.</p>
            <a
              href={`mailto:sales@flyclearblue.com?subject=Inquiry: ${aircraft.year} ${aircraft.make} ${aircraft.model} (${aircraft.registration})`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-bold text-sm mb-3 transition-all hover:brightness-110"
              style={{ backgroundColor: '#C9A84C', color: '#00447f' }}
            >
              <Mail className="w-4 h-4" /> Email Us
            </a>
            <a
              href="tel:+13862276840"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-bold text-sm border border-white/20 hover:bg-white/10 transition-all"
            >
              <Phone className="w-4 h-4" /> (386) 227-6840
            </a>
            <div className="mt-5 pt-5 border-t border-white/10 text-xs text-white/30 space-y-1">
              <p>Mon – Fri, 8 AM – 6 PM EST</p>
              <p>sales@flyclearblue.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}