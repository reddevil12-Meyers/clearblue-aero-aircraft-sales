import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const INSURANCE_COS = [
  { name: "Avemco", url: "http://www.avemco.com/Aviation/Insurance", desc: "For those who love to fly Avemco® has you covered call us today for a quote. Personalized Service · Talk to a Specialist · Personalized Quotes" },
  { name: "AOPA Insurance", url: "http://insurance.aopa.org/aviation", desc: "From underwriting to claims service, we know that there's much more to you than can be captured by numbers on an actuarial table. You're a fellow aviator. Whether you're an aircraft owner, renter, CFI — AOPA has you covered." },
  { name: "Falcon Aviation Insurance", url: "http://www.falconinsurance.com/", desc: "Falcon Aviation Insurance Agency realizes that your airplane and helicopter insurance needs are unique, which is why we custom tailor your coverage to your needs." },
  { name: "USAA Aircraft Insurance For Pilots", url: "http://www.usaa.com/inet/wc/insurance_aviation", desc: "Aviation insurance offered through the USAA Insurance Agency — protection for your aircraft, competitive rates, and a personalized quote. Get a quote online today." },
  { name: "Travers Aviation Insurance", url: "http://www.traversaviation.com/", desc: "Request an Online Quote Today! Over 60 Years Experience · Competitive Rates · Wide Range of Policies" },
];

const FINANCE_COS = [
  { name: "PNC Aircraft Finance", url: "http://www.pncaviationfinance.com/" },
  { name: "National Aircraft Finance Company", url: "http://www.airloans.com/" },
  { name: "Dorr Aviation Credit Corporation, LLC", url: "http://www.dorraviation.com/" },
  { name: "AOPA Aviation Finance", url: "http://finance.aopa.org/aircraft" },
  { name: "Red River State Bank", url: "http://www.airloan.com/" },
  { name: "US Aircraft Financing", url: "http://www.usaircraftfinance.com/" },
];

const PARTNERS = [
  { name: "Lima Bravo Aviation", url: "https://limabravoaviation.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2016/06/LB-logo-2024-300x94.png" },
  { name: "Columbus Aero Service", url: "http://www.columbusaeroservice.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2016/06/Columbus-Aero_144x144.png" },
  { name: "Gann Aviation", url: "http://www.gannaviation.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2017/12/Gann-Logo.png" },
];

export default function PublicInsurance() {
  const [recentAircraft, setRecentAircraft] = useState([]);

  useEffect(() => {
    base44.entities.Aircraft.filter({ show_on_public: true }, '-created_date', 4)
      .then(setRecentAircraft).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-[#1a3a5c] py-12 text-center">
        <h1 className="text-4xl font-bold text-white">Insurance &amp; Financing</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14 grid lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Insurance */}
          <div>
            <h2 className="text-center text-[#5b99cc] font-bold text-lg uppercase tracking-widest mb-6 border-b border-gray-200 pb-3">Insurance Companies</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {INSURANCE_COS.map(co => (
                <div key={co.name}>
                  <a href={co.url} target="_blank" rel="noopener noreferrer" className="font-bold text-[#1a3a5c] hover:underline">{co.name}</a>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{co.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Finance */}
          <div>
            <h2 className="text-center text-[#5b99cc] font-bold text-lg uppercase tracking-widest mb-6 border-b border-gray-200 pb-3">Finance Companies</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {FINANCE_COS.map(co => (
                <a key={co.name} href={co.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1a3a5c] hover:underline text-sm">{co.name}</a>
              ))}
            </div>
          </div>

          {/* Recent Inventory */}
          {recentAircraft.length > 0 && (
            <div>
              <h2 className="text-center text-[#5b99cc] font-bold text-lg uppercase tracking-widest mb-6 border-b border-gray-200 pb-3">Recently Added Inventory</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {recentAircraft.map(ac => (
                  <Link key={ac.id} to={`/public/inventory/${ac.id}`} className="flex gap-3 items-start group">
                    <div className="w-20 h-16 rounded overflow-hidden bg-gray-100 shrink-0">
                      {ac.images?.[0]
                        ? <img src={ac.images[0]} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gray-200" />}
                    </div>
                    <p className="text-sm font-semibold text-[#1a3a5c] group-hover:underline">{ac.year} {ac.make} {ac.model}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <a href="mailto:info@flyclearblue.com" className="flex items-center gap-3 bg-[#4a9c6d] text-white px-5 py-3 rounded font-semibold text-sm hover:bg-[#3a8c5d] transition-colors w-full justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Email Us
          </a>
          <a href="http://www.banterraaircraft.com/loans/overview" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#4a9c6d] text-white px-5 py-3 rounded font-semibold text-sm hover:bg-[#3a8c5d] transition-colors w-full justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Apply for Financing
          </a>
          <a href="http://www.falconinsurance.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#4a9c6d] text-white px-5 py-3 rounded font-semibold text-sm hover:bg-[#3a8c5d] transition-colors w-full justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Get Insurance Quote
          </a>

          <div className="pt-4">
            <h4 className="text-sm font-bold text-[#1a3a5c] uppercase tracking-widest mb-4">Our Trusted Partners</h4>
            <div className="space-y-4">
              {PARTNERS.map(p => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer">
                  <img src={p.img} alt={p.name} className="h-12 object-contain grayscale hover:grayscale-0 transition-all" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}