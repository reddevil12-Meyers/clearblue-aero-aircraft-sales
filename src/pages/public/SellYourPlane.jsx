import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, DollarSign, FileText, Handshake, Shield, Star } from "lucide-react";

const STEPS = [
  { icon: FileText, num: "01", title: "Submit Your Aircraft", desc: "Complete our secure listing form with your aircraft's details. A broker will review and respond within one business day." },
  { icon: DollarSign, num: "02", title: "Expert Valuation", desc: "Our brokers assess current market conditions and develop a data-driven pricing strategy designed to maximize your return." },
  { icon: Star, num: "03", title: "Strategic Marketing", desc: "Your aircraft is marketed to our nationwide network of qualified buyers through premium channels and targeted outreach." },
  { icon: Shield, num: "04", title: "Seamless Closing", desc: "From pre-purchase inspection to title, escrow, and transfer — we manage every detail so you can close with confidence." },
];

export default function PublicSellYourPlane() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div
        className="relative py-32 text-center text-white overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559478586-c9e47da61f42?w=1800&q=85')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#050d1a]/80" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">Aircraft Sales</p>
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sell Smarter.<br />Sell Faster.
          </h1>
          <p className="text-xl text-white/60 mb-10 leading-relaxed">
            ClearBlue Aero handles every step — from valuation to closing — so you can focus on what comes next.
          </p>
          <Link
            to="/public/sell/single-engine"
            className="inline-flex items-center gap-3 px-10 py-5 font-bold text-[#050d1a] rounded text-sm tracking-wide transition-all hover:brightness-110"
            style={{ backgroundColor: '#C9A84C' }}
          >
            List Your Aircraft <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Process */}
      <section className="py-28 bg-[#f5f6f8]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-20">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">How It Works</p>
            <h2 className="text-5xl font-black text-[#050d1a]" style={{ fontFamily: "'Playfair Display', serif" }}>Our Proven Process</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {STEPS.map(({ icon: Icon, num, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-10 border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group">
                <div className="flex items-start gap-6">
                  <div>
                    <p className="text-6xl font-black text-gray-100 group-hover:text-[#C9A84C]/20 transition-colors leading-none mb-3">{num}</p>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#050d1a' }}>
                      <Icon className="w-6 h-6 text-[#C9A84C]" />
                    </div>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-xl font-black text-[#050d1a] mb-3">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Choose Type */}
      <section className="py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Get Started</p>
          <h2 className="text-5xl font-black text-[#050d1a] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>Select Your Aircraft Type</h2>
          <p className="text-gray-400 mb-14 text-lg">Choose the category that best describes your aircraft to begin the listing process.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Single Engine", sub: "Cessna, Piper, Cirrus, Mooney & more", path: "/public/sell/single-engine" },
              { title: "Twin Engine", sub: "Beechcraft Baron, Piper Seneca, Cessna 310 & more", path: "/public/sell/twin-engine" },
            ].map(({ title, sub, path }) => (
              <Link
                key={title}
                to={path}
                className="group relative p-12 bg-[#050d1a] rounded-2xl text-left overflow-hidden hover:brightness-110 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#C9A84C]/5 -translate-y-1/2 translate-x-1/2 group-hover:bg-[#C9A84C]/10 transition-colors" />
                <h3 className="text-2xl font-black text-white mb-2">{title}</h3>
                <p className="text-sm text-white/40 mb-8">{sub}</p>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#C9A84C] uppercase tracking-wide">
                  Begin Listing <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Sell With Us */}
      <section className="py-20 bg-[#050d1a]">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <h2 className="text-4xl font-black text-white text-center mb-14" style={{ fontFamily: "'Playfair Display', serif" }}>Why Sell With ClearBlue Aero</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              "Nationwide qualified buyer network",
              "Market-based pricing strategy",
              "Professional listing presentation",
              "Full transaction management",
              "Pre-purchase inspection coordination",
              "Title, escrow & closing support",
            ].map(b => (
              <div key={b} className="flex items-center gap-4 p-5 bg-white/5 rounded-xl border border-white/5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#C9A84C' }}>
                  <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3"><path d="M1 5l3 3 7-7" stroke="#050d1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span className="text-sm text-white/70 font-medium">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}