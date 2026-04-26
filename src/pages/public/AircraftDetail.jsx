import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plane, ArrowLeft, Phone, Mail, MapPin, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import AircraftSalesSheet from "@/components/AircraftSalesSheet";

export default function PublicAircraftDetail() {
  const { id } = useParams();
  const [aircraft, setAircraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [showSheet, setShowSheet] = useState(false);

  const handlePrint = () => {
    setShowSheet(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowSheet(false), 500);
    }, 300);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    base44.functions.invoke('getPublicAircraftDetail', { id })
      .then(res => { setAircraft(res.data.aircraft || null); setLoading(false); })
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
      <Link to="/inventory" className="text-[#00447f] text-sm mt-4 inline-block hover:underline">← Back to Inventory</Link>
    </div>
  );

  const images = aircraft.images || [];

  const avionicsSpecs = [
    { label: "Avionics Suite", value: aircraft.avionics_suite },
    { label: "Avionics Details", value: aircraft.avionics_details },
  ].filter(s => s.value);

  const statusLabel = aircraft.status === "Sold" ? "SOLD"
    : aircraft.status === "Under Contract" ? "UNDER CONTRACT"
    : null;

  return (
    <div className="bg-[#f5f6f8] min-h-screen">
      {/* Back nav */}
      <div className="bg-[#00447f] px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <Link to="/inventory" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Inventory
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Title */}
        <div className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-3xl md:text-4xl font-black text-[#00447f]">
              {aircraft.year} {aircraft.make} {aircraft.model}
            </h1>
            <div className="text-right flex flex-col items-end gap-2">
              {aircraft.asking_price && aircraft.status !== "Sold" && (
                <p className="text-3xl font-black text-[#C9A84C]">${aircraft.asking_price.toLocaleString()}</p>
              )}
              {statusLabel && (
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${aircraft.status === "Sold" ? "bg-gray-200 text-gray-600" : "bg-amber-50 text-amber-700"}`}>
                  {statusLabel}
                </span>
              )}
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border border-[#00447f] text-[#00447f] hover:bg-[#00447f] hover:text-white transition-all"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
          {aircraft.location && (
            <p className="text-gray-400 mt-1 flex items-center gap-1 text-sm"><MapPin className="w-4 h-4" />{aircraft.location}</p>
          )}
        </div>

        {/* Image Gallery */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-8">
          <div className="flex justify-center bg-gray-100">
            <div className="relative w-3/4" style={{ aspectRatio: "16/9" }}>
            {images.length > 0 ? (
              <>
                <img src={images[imgIndex]} alt={`Photo ${imgIndex + 1}`} className="absolute inset-0 w-full h-full object-cover" />
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
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {imgIndex + 1} / {images.length}
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
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50">
              {images.map((url, i) => (
                <button key={i} onClick={() => setImgIndex(i)}
                  className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === imgIndex ? 'border-[#00447f]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left — Description + Specs */}
          <div className="lg:col-span-2 space-y-8">

            {/* Description */}
            {aircraft.notes && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-black text-[#00447f] mb-3 uppercase tracking-wide">Description</h2>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{aircraft.notes}</p>
              </div>
            )}

            {/* Specifications */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-black text-[#00447f] mb-5 pb-3 border-b border-gray-100 uppercase tracking-wide">Specifications</h2>

              {/* Top two-column: Asking Price + Location | Registration + Yr/Make/Model + Serial */}
              <div className="grid grid-cols-2 gap-x-6 mb-4">
                {/* Left */}
                <div className="divide-y divide-gray-50">
                  {aircraft.asking_price && aircraft.status !== "Sold" && (
                    <div className="flex items-baseline justify-between py-2.5">
                      <span className="text-gray-500 text-sm font-semibold">Asking Price</span>
                      <span className="text-[#C9A84C] font-black text-lg">${aircraft.asking_price.toLocaleString()}</span>
                    </div>
                  )}
                  {aircraft.location && (
                    <div className="flex items-start justify-between gap-4 py-2.5">
                      <span className="text-gray-500 text-sm shrink-0">Aircraft Location</span>
                      <span className="text-gray-800 text-sm font-semibold text-right">{aircraft.location}</span>
                    </div>
                  )}
                </div>
                {/* Right */}
                <div className="divide-y divide-gray-50">
                  {aircraft.registration && (
                    <div className="flex items-start justify-between gap-4 py-2.5">
                      <span className="text-gray-500 text-sm shrink-0">Registration</span>
                      <span className="text-gray-800 text-sm font-semibold text-right">{aircraft.registration}</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4 py-2.5">
                    <span className="text-gray-500 text-sm shrink-0">Yr/Make/Model</span>
                    <span className="text-gray-800 text-sm font-semibold text-right">{aircraft.year} {aircraft.make} {aircraft.model}</span>
                  </div>
                  {aircraft.serial_number && (
                    <div className="flex items-start justify-between gap-4 py-2.5">
                      <span className="text-gray-500 text-sm shrink-0">Serial Number</span>
                      <span className="text-gray-800 text-sm font-semibold text-right">{aircraft.serial_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Airframe & Engine — two columns */}
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#00447f] mt-5 mb-2">Airframe &amp; Engine Data</h3>
              <div className="grid grid-cols-2 gap-x-6">
                {/* Left */}
                <div className="divide-y divide-gray-50">
                  {[
                    { label: "Airframe Total Time", value: aircraft.total_time ? `${aircraft.total_time.toLocaleString()} hrs` : null },
                    { label: "Exterior Condition", value: aircraft.exterior_condition },
                    { label: "Interior Condition", value: aircraft.interior_condition },
                    { label: "Annual Due", value: aircraft.annual_due },
                    { label: "ADS-B Compliant", value: aircraft.adsb_compliant === true ? "Yes" : aircraft.adsb_compliant === false ? "No" : null },
                  ].filter(s => s.value).map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                      <span className="text-gray-500 text-sm shrink-0">{label}</span>
                      <span className="text-gray-800 text-sm font-semibold text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
                {/* Right */}
                <div className="divide-y divide-gray-50">
                  {[
                    { label: "Engine Manufacturer", value: [aircraft.engine_manufacturer, aircraft.engine_model].filter(Boolean).join(" ") || null },
                    { label: "Engine Type", value: aircraft.engine_type },
                    { label: "Engine Time", value: aircraft.engine_time_smoh ? `${aircraft.engine_time_smoh.toLocaleString()} hrs ${aircraft.engine_time_type || 'SMOH'}` : null },
                    { label: "Propeller Manufacturer", value: [aircraft.propeller_manufacturer, aircraft.propeller_model].filter(Boolean).join(" ") || null },
                    { label: "Propeller Time", value: aircraft.propeller_time ? `${aircraft.propeller_time.toLocaleString()} hrs` : null },
                  ].filter(s => s.value).map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                      <span className="text-gray-500 text-sm shrink-0">{label}</span>
                      <span className="text-gray-800 text-sm font-semibold text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Avionics & Equipment */}
              {avionicsSpecs.length > 0 && (
                <>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#00447f] mt-6 mb-2">Avionics &amp; Equipment</h3>
                  <div className="divide-y divide-gray-50">
                    {avionicsSpecs.map(({ label, value }) => (
                      <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                        <span className="text-gray-500 text-sm shrink-0">{label}</span>
                        <span className="text-gray-800 text-sm font-semibold text-right whitespace-pre-wrap">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Instruments */}
              {aircraft.instruments?.length > 0 && (
                <>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#00447f] mt-6 mb-2">Instruments</h3>
                  <div className="divide-y divide-gray-50">
                    {aircraft.instruments.map((inst, i) => (
                      <div key={i} className="flex items-start justify-between gap-4 py-2.5">
                        <span className="text-gray-500 text-sm">{inst.name}</span>
                        <span className="text-gray-800 text-sm font-semibold text-right">
                          {[inst.make, inst.model].filter(Boolean).join(" ")}{inst.condition ? ` · ${inst.condition}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100 leading-relaxed">
                These specifications are presented as introductory information only. ClearBlue Aero makes no representations or warranties with respect to the aircraft. All interested parties should conduct an independent inspection. The aircraft is subject to prior sale or lease.
              </p>
            </div>

            {/* Other */}
            {aircraft.other && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-black text-[#00447f] mb-3 uppercase tracking-wide">Other</h2>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{aircraft.other}</p>
              </div>
            )}
          </div>

          {/* Right — Contact */}
          <div>
            <div className="bg-[#00447f] text-white rounded-2xl p-6 sticky top-28">
              <h3 className="text-xl font-black mb-1">Have Questions?</h3>
              <p className="text-white/50 text-sm mb-1">Interested in Purchasing?</p>
              <p className="text-white/70 text-sm font-semibold mb-5">{aircraft.year} {aircraft.make} {aircraft.model}</p>

              <a
                href="tel:+13862276840"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-bold text-sm mb-3 transition-all hover:brightness-110"
                style={{ backgroundColor: '#C9A84C', color: '#00447f' }}
              >
                <Phone className="w-4 h-4" /> Call (386) 227-6840
              </a>
              <a
                href={`mailto:sales@flyclearblue.com?subject=Inquiry: ${aircraft.year} ${aircraft.make} ${aircraft.model} (${aircraft.registration || ''})`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-bold text-sm border border-white/20 hover:bg-white/10 transition-all"
              >
                <Mail className="w-4 h-4" /> Email Us
              </a>

              <div className="mt-5 pt-5 border-t border-white/10 text-xs text-white/30 space-y-1">
                <p>Monday – Friday, 8 AM – 6 PM EST</p>
                <p>sales@flyclearblue.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Hidden sales sheet — rendered for printing */}
      {showSheet && (
        <div className="print-only" style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, background: "#fff", width: "100%", minHeight: "100vh" }}>
          <AircraftSalesSheet aircraft={aircraft} />
        </div>
      )}

      <style>{`
        @media print {
          body > * { display: none !important; }
          .print-only { display: block !important; position: static !important; }
        }
        .print-only { display: none; }
      `}</style>
    </div>
  );
}