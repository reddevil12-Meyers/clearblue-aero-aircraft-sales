import { Link } from "react-router-dom";
import { Award, Users, Plane, Target, ArrowRight } from "lucide-react";

export default function PublicAbout() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div
        className="relative py-36 text-center text-white overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587893904478-66e23f3d3b7f?w=1800&q=85')", backgroundSize: 'cover', backgroundPosition: 'center 30%' }}
      >
        <div className="absolute inset-0 bg-[#050d1a]/80" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">Who We Are</p>
          <h1 className="text-6xl md:text-7xl font-black leading-tight mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            About ClearBlue Aero
          </h1>
          <p className="text-xl text-white/60 leading-relaxed">
            A veteran owned aviation brokerage built on integrity, expertise, and a genuine passion for flight.
          </p>
        </div>
      </div>

      {/* Mission Statement */}
      <section className="py-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">Our Mission</p>
            <h2 className="text-5xl font-black text-[#050d1a] leading-tight mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
              Where Military Precision Meets Aviation Excellence
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-6">
              ClearBlue Aero was founded on the principle that every aircraft transaction deserves the same level of precision, discipline, and care that our founders brought to military service.
            </p>
            <p className="text-gray-500 leading-relaxed">
              We're not a listing aggregator. We're your dedicated brokers — pilots who understand your aircraft, your goals, and what it takes to close a deal the right way.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: "20+", label: "Years Experience" },
              { num: "500+", label: "Transactions Closed" },
              { num: "50+", label: "States Served" },
              { num: "100%", label: "Veteran Owned" },
            ].map(({ num, label }) => (
              <div key={label} className="bg-[#050d1a] rounded-2xl p-8 text-center">
                <p className="text-4xl font-black text-[#C9A84C] mb-2">{num}</p>
                <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-[#f5f6f8]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Our Values</p>
            <h2 className="text-5xl font-black text-[#050d1a]" style={{ fontFamily: "'Playfair Display', serif" }}>What Drives Us</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Award, title: "Veteran Owned", desc: "Founded and operated by veterans who bring integrity and dedication to every engagement." },
              { icon: Plane, title: "Pilot Operated", desc: "Our brokers are active pilots. We speak the language and understand your needs from the cockpit." },
              { icon: Users, title: "Client First", desc: "Your goals drive every decision we make — from first inquiry through final closing." },
              { icon: Target, title: "Transparent", desc: "No hidden fees, no ambiguity. Clear communication and honest guidance throughout." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-13 h-13 w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#050d1a' }}>
                  <Icon className="w-7 h-7 text-[#C9A84C]" />
                </div>
                <h3 className="text-lg font-black text-[#050d1a] mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-28 max-w-6xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">What We Offer</p>
          <h2 className="text-5xl font-black text-[#050d1a]" style={{ fontFamily: "'Playfair Display', serif" }}>Our Services</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Aircraft Sales", desc: "Strategic representation for sellers of single-engine, multi-engine, and turbine aircraft throughout the United States." },
            { title: "Aircraft Acquisitions", desc: "Targeted search and acquisition services for buyers seeking specific airframes at the right price and condition." },
            { title: "Aircraft Appraisals", desc: "Certified desktop and on-site appraisals for insurance, financing, estate, and litigation purposes." },
            { title: "Pre-Purchase Inspections", desc: "We coordinate and attend inspections with qualified mechanics to protect your interests and verify aircraft condition." },
            { title: "Aircraft Leasing", desc: "Dry and wet lease arrangement assistance for individuals and businesses requiring flexible aircraft access." },
            { title: "Market Consulting", desc: "Unbiased consulting to match buyers with the right aircraft platform for their mission and budget." },
          ].map(({ title, desc }) => (
            <div key={title} className="p-8 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-[#C9A84C]/20 transition-all duration-300 group">
              <div className="w-8 h-0.5 mb-6 transition-all duration-300 group-hover:w-14" style={{ backgroundColor: '#C9A84C' }} />
              <h3 className="font-black text-[#050d1a] text-lg mb-3">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#050d1a] text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to Work With Us?
          </h2>
          <p className="text-white/40 text-lg mb-10">
            Whether you're buying, selling, or exploring your options, our team is ready to help.
          </p>
          <Link
            to="/public/contact"
            className="inline-flex items-center gap-3 px-10 py-5 font-bold text-[#050d1a] rounded text-sm tracking-wide transition-all hover:brightness-110"
            style={{ backgroundColor: '#C9A84C' }}
          >
            Get in Touch <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}