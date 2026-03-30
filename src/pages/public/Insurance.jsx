import { Link } from "react-router-dom";
import { Shield, DollarSign, Phone, ArrowRight } from "lucide-react";

const INSURANCE_ITEMS = [
  "Hull & Liability Coverage",
  "In-Flight & Ground Coverage",
  "Medical Payments Coverage",
  "Non-Owned Aircraft Coverage",
  "Hangar Keeper's Liability",
  "Open Pilot Warranties",
];

const FINANCE_ITEMS = [
  "Competitive fixed & variable rates",
  "Terms up to 20 years",
  "New & used aircraft financing",
  "Refinancing & equity options",
  "Pre-approval assistance",
  "Aviation-specific lender network",
];

export default function PublicInsurance() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-[#050d1a] py-28 text-center px-6">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Resources</p>
        <h1 className="text-6xl font-black text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
          Insurance &<br />Financing
        </h1>
        <p className="text-white/40 text-xl max-w-xl mx-auto leading-relaxed">
          We connect you with the right coverage and capital to complete your transaction with confidence.
        </p>
      </div>

      {/* Two Panels */}
      <section className="py-28 max-w-6xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-12">
        {/* Insurance */}
        <div className="group bg-[#f5f6f8] rounded-2xl p-12 hover:shadow-xl transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8" style={{ backgroundColor: '#050d1a' }}>
            <Shield className="w-8 h-8 text-[#C9A84C]" />
          </div>
          <h2 className="text-3xl font-black text-[#050d1a] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>Aircraft Insurance</h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            Protecting your investment is paramount. We work with leading aviation insurers to place comprehensive coverage for your aircraft — whether you're buying, selling, or appraising.
          </p>
          <div className="space-y-3">
            {INSURANCE_ITEMS.map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#C9A84C' }}>
                  <svg viewBox="0 0 12 10" fill="none" className="w-2.5 h-2.5"><path d="M1 5l3 3 7-7" stroke="#050d1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span className="text-sm text-gray-600 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financing */}
        <div className="group bg-[#f5f6f8] rounded-2xl p-12 hover:shadow-xl transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8" style={{ backgroundColor: '#050d1a' }}>
            <DollarSign className="w-8 h-8 text-[#C9A84C]" />
          </div>
          <h2 className="text-3xl font-black text-[#050d1a] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>Aircraft Financing</h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            We partner with specialized aviation lenders who understand the market. Get competitive rates and flexible terms tailored specifically for general aviation aircraft purchases.
          </p>
          <div className="space-y-3">
            {FINANCE_ITEMS.map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#C9A84C' }}>
                  <svg viewBox="0 0 12 10" fill="none" className="w-2.5 h-2.5"><path d="M1 5l3 3 7-7" stroke="#050d1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span className="text-sm text-gray-600 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#050d1a] text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
            Get Connected Today
          </h2>
          <p className="text-white/40 text-lg mb-10">
            Our team will match you with the right insurance and financing partners for your specific situation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/public/contact"
              className="flex items-center gap-2 px-10 py-5 rounded font-bold text-[#050d1a] text-sm tracking-wide transition-all hover:brightness-110"
              style={{ backgroundColor: '#C9A84C' }}
            >
              Contact Our Team <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="tel:+13862276840"
              className="flex items-center gap-2 px-10 py-5 rounded font-bold text-white text-sm tracking-wide border border-white/20 hover:bg-white/10 transition-all"
            >
              <Phone className="w-4 h-4" /> (386) 227-6840
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}