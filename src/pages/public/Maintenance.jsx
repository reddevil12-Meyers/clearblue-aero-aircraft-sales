import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Wrench, ShieldCheck, FileSearch, BarChart2, Phone } from "lucide-react";

const CORE_SERVICES = [
  "Pre-buy inspections (airframe, engine, avionics, logbook audit, damage history review)",
  "Maintenance oversight and coordination (scheduled and unscheduled)",
  "Logbook review and reconstruction",
  "Airworthiness directive (AD) and service bulletin compliance checks",
  "Engine health analysis (compression, borescope, trend data)",
  "Avionics system evaluation and upgrade consulting",
  "Repair cost estimation and negotiation support",
  "Annual and 100-hour inspection management",
  "Ferry and post-purchase inspection coordination",
  "Seller pre-listing inspections and aircraft valuation support",
];

const WHY = [
  { icon: ShieldCheck, title: "Buyer Protection", desc: "Our pre-buy inspections go far beyond a surface-level review — we audit airframe, engine, avionics, and logbooks to uncover every issue before you close." },
  { icon: FileSearch, title: "Negotiation Leverage", desc: "A thorough inspection isn't just a checklist. It's your strongest negotiating tool and your best protection against hidden ownership costs." },
  { icon: BarChart2, title: "Market-Aware Analysis", desc: "Because we operate at the intersection of maintenance and brokerage, we interpret every finding in terms of value, negotiation leverage, and long-term ownership costs." },
  { icon: Wrench, title: "Seller Readiness", desc: "For sellers, our maintenance oversight and inspection readiness ensure your aircraft presents at its highest possible market value." },
];

export default function PublicMaintenance() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div
        className="relative py-36 text-center text-white overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=85')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#050d1a]/85" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">Aircraft Maintenance</p>
          <h1 className="text-6xl md:text-7xl font-black leading-tight mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Protect Your<br />Investment.
          </h1>
          <p className="text-xl text-white/60 leading-relaxed mb-10">
            From pre-buy inspections to ongoing maintenance management — we keep your aircraft airworthy and your transactions protected.
          </p>
          <Link
            to="/public/contact"
            className="inline-flex items-center gap-3 px-10 py-5 font-bold text-[#050d1a] rounded text-sm tracking-wide transition-all hover:brightness-110"
            style={{ backgroundColor: '#C9A84C' }}
          >
            Schedule an Inspection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Intro Copy */}
      <section className="py-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">The ClearBlue Approach</p>
            <h2 className="text-5xl font-black text-[#050d1a] leading-tight mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
              Maintenance Meets<br />Market Intelligence.
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-6">
              Owning or acquiring an aircraft should feel exciting — not uncertain. Our General Aviation Aircraft Maintenance services are designed to protect your investment at every stage, whether you're preparing to buy, sell, or maintain your aircraft for peak performance.
            </p>
            <p className="text-gray-500 leading-relaxed mb-6">
              We specialize in comprehensive pre-buy inspections that go far beyond a surface-level review. By combining deep technical expertise with real-world market knowledge, we help you make confident, informed decisions before closing a deal.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Because we operate at the intersection of maintenance and brokerage, we don't just identify issues — we interpret them in terms of value, negotiation leverage, and long-term ownership costs. That means fewer surprises, stronger deals, and smoother transactions.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200&q=85"
              alt="Aircraft Maintenance"
              className="w-full h-full object-cover"
            />
            <div className="absolute -bottom-6 -right-6 bg-[#050d1a] text-white rounded-2xl p-7 shadow-2xl">
              <p className="text-4xl font-black text-[#C9A84C]">100%</p>
              <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">Inspection Backed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-24 bg-[#f5f6f8]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Why It Matters</p>
            <h2 className="text-5xl font-black text-[#050d1a]" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Integrated Advantage
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {WHY.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-10 border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#050d1a' }}>
                  <Icon className="w-7 h-7 text-[#C9A84C]" />
                </div>
                <h3 className="text-xl font-black text-[#050d1a] mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="py-28 bg-[#050d1a]">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">What We Offer</p>
            <h2 className="text-5xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Core Services
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {CORE_SERVICES.map((service, i) => (
              <div key={i} className="flex items-start gap-4 p-6 bg-white/5 rounded-xl border border-white/5 hover:border-[#C9A84C]/20 hover:bg-white/8 transition-all">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: '#C9A84C' }}>
                  <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
                    <path d="M1 5l3 3 7-7" stroke="#050d1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm text-white/70 font-medium leading-relaxed">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pre-Buy Spotlight */}
      <section className="py-28 max-w-4xl mx-auto px-6 lg:px-10 text-center">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">The Pre-Buy Inspection</p>
        <h2 className="text-5xl font-black text-[#050d1a] mb-8 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          Your Strongest Negotiating Tool
        </h2>
        <p className="text-gray-500 text-xl leading-relaxed mb-12">
          A thorough pre-buy inspection isn't just a checklist — it's your strongest negotiating tool and your best protection against hidden costs. Our integrated approach ensures that every aircraft we represent or evaluate is backed by technical accuracy and market awareness.
        </p>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          {[
            { num: "01", title: "Technical Inspection", desc: "Full airframe, engine, avionics, and systems evaluation by experienced aviation technicians." },
            { num: "02", title: "Logbook & Records Audit", desc: "Complete review of maintenance history, ADs, STCs, and damage disclosures for hidden issues." },
            { num: "03", title: "Market Value Report", desc: "Our brokerage insight translates findings into negotiation leverage and fair market value guidance." },
          ].map(({ num, title, desc }) => (
            <div key={num} className="bg-[#f5f6f8] rounded-2xl p-8">
              <p className="text-5xl font-black text-gray-100 leading-none mb-4">{num}</p>
              <h3 className="font-black text-[#050d1a] mb-3">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#050d1a] text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to Schedule?
          </h2>
          <p className="text-white/40 text-lg mb-10">
            Contact our team to arrange a pre-buy inspection, maintenance consultation, or seller readiness review.
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