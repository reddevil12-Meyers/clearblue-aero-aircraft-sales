import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const INSURANCE_COS = [
  { name: "Avemco", url: "http://www.avemco.com/Aviation/Insurance", desc: "Personalized service, specialist consultations, and custom quotes for pilots who love to fly." },
  { name: "AOPA Insurance", url: "http://insurance.aopa.org/aviation", desc: "From underwriting to claims, AOPA treats you as a fellow aviator — not just a number on an actuarial table." },
  { name: "Falcon Aviation Insurance", url: "http://www.falconinsurance.com/", desc: "Custom-tailored coverage for your unique airplane and helicopter insurance needs." },
  { name: "USAA Aircraft Insurance", url: "http://www.usaa.com/inet/wc/insurance_aviation", desc: "Competitive rates and personalized quotes for aircraft protection through the USAA Insurance Agency." },
  { name: "Travers Aviation Insurance", url: "http://www.traversaviation.com/", desc: "Over 60 years experience. Competitive rates and a wide range of aviation policies." },
];

const FINANCE_COS = [
  { name: "PNC Aircraft Finance", url: "http://www.pncaviationfinance.com/" },
  { name: "National Aircraft Finance Company", url: "http://www.airloans.com/" },
  { name: "Dorr Aviation Credit Corporation", url: "http://www.dorraviation.com/" },
  { name: "AOPA Aviation Finance", url: "http://finance.aopa.org/aircraft" },
  { name: "Red River State Bank", url: "http://www.airloan.com/" },
  { name: "US Aircraft Financing", url: "http://www.usaircraftfinance.com/" },
];

export default function PublicInsurance() {
  const [recentAircraft, setRecentAircraft] = useState([]);

  useEffect(() => {
    base44.entities.Aircraft.filter({ show_on_public: true }, '-created_date', 4)
      .then(setRecentAircraft).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <div className="relative py-32 px-6 text-center overflow-hidden" style={{ backgroundColor: '#0a1628' }}>
        <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">Resources</p>
        <h1 className="text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Insurance &amp; Financing</h1>
        <p className="text-white/50 max-w-xl mx-auto leading-relaxed">Trusted resources to help protect and fund your aircraft investment.</p>
      </div>

      {/* Action buttons */}
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-wrap gap-4 justify-center">
          <a href="mailto:info@flyclearblue.com" className="px-6 py-3 text-sm font-semibold text-white rounded-lg transition-colors" style={{ backgroundColor: '#0a1628' }}>
            Email Us
          </a>
          <a href="http://www.banterraaircraft.com/loans/overview" target="_blank" rel="noopener noreferrer" className="px-6 py-3 text-sm font-semibold rounded-lg border-2 transition-colors" style={{ borderColor: '#0a1628', color: '#0a1628' }}>
            Apply for Financing
          </a>
          <a href="http://www.falconinsurance.com/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 text-sm font-semibold rounded-lg border-2 transition-colors" style={{ borderColor: '#0a1628', color: '#0a1628' }}>
            Get Insurance Quote
          </a>
        </div>
      </div>

      {/* Insurance */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-amber-600 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Coverage</p>
            <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Insurance Companies</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {INSURANCE_COS.map(co => (
              <div key={co.name} className="p-6 rounded-2xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/20 transition-all">
                <a href={co.url} target="_blank" rel="noopener noreferrer" className="font-bold text-gray-900 hover:text-amber-600 transition-colors text-base">{co.name}</a>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{co.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Finance */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-amber-600 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Funding</p>
            <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Finance Companies</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FINANCE_COS.map(co => (
              <a key={co.name} href={co.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-5 bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all group">
                <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></div>
                <span className="font-semibold text-sm text-gray-800 group-hover:text-amber-700 transition-colors">{co.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Inventory */}
      {recentAircraft.length > 0 && (
        <section className="py-24 px-6 bg-white border-t border-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-amber-600 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Current Listings</p>
                <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Recently Added</h2>
              </div>
              <Link to="/public/inventory" className="text-sm font-semibold text-gray-900 hover:text-amber-600 transition-colors">View all →</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentAircraft.map(ac => (
                <Link key={ac.id} to={`/public/inventory/${ac.id}`} className="group">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-3">
                    {ac.images?.[0]
                      ? <img src={ac.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full bg-gray-100" />}
                  </div>
                  <p className="text-sm font-bold text-gray-900">{ac.year} {ac.make} {ac.model}</p>
                  {ac.asking_price && <p className="text-xs text-amber-600 font-semibold mt-0.5">${ac.asking_price.toLocaleString()}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}