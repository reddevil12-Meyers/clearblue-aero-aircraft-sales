import { Link } from "react-router-dom";
import { Shield, DollarSign, Phone, CheckCircle } from "lucide-react";

export default function PublicInsurance() {
  return (
    <div>
      <div className="py-20 text-white text-center" style={{ backgroundColor: '#0a1628' }}>
        <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Insurance & Financing</h1>
        <p className="text-white/60 text-xl max-w-xl mx-auto">We connect you with the right coverage and financing solutions for your aircraft purchase.</p>
      </div>

      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Insurance */}
          <div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#0a1628' }}>
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Aircraft Insurance</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Protecting your investment is essential. We work with leading aviation insurance providers to get you competitive coverage for your aircraft — whether you're buying, selling, or appraising.
            </p>
            <div className="space-y-3">
              {["Hull & Liability Coverage", "In-Flight & Ground Coverage", "Medical Payments", "Non-Owned Aircraft Coverage", "Hangar Keeper's Liability"].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financing */}
          <div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#0a1628' }}>
              <DollarSign className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Aircraft Financing</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              We partner with specialized aviation lenders who understand the market. Get competitive rates and terms tailored to general aviation aircraft purchases.
            </p>
            <div className="space-y-3">
              {["Competitive fixed & variable rates", "Terms up to 20 years", "New & used aircraft financing", "Refinancing options available", "Pre-approval assistance"].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 text-white text-center" style={{ backgroundColor: '#0a1628' }}>
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Get a Quote Today</h2>
          <p className="text-white/60 mb-8">Our team will connect you with the right insurance and financing partners for your situation.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/public/contact" className="px-8 py-4 rounded-lg font-semibold text-white transition-all" style={{ backgroundColor: '#d97706' }}>Contact Us</Link>
            <a href="tel:+13862276840" className="px-8 py-4 rounded-lg font-semibold border-2 border-white/30 hover:bg-white/10 flex items-center gap-2 transition-all">
              <Phone className="w-4 h-4" /> (386) 227-6840
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}