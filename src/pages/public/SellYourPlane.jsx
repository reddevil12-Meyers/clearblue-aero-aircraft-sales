import { Link } from "react-router-dom";
import { ArrowRight, DollarSign, Search, Handshake, FileText, Phone } from "lucide-react";
import ValuationForm from "@/components/public/ValuationForm";
import useSeo from "@/hooks/useSeo";

const COCKPIT_IMAGE = "https://images.unsplash.com/photo-1569939012617-bd8f156b934a?w=1600&q=80&auto=format&fit=crop";

const steps = [
{ icon: FileText, num: "01", title: "Aircraft Evaluation", desc: "We conduct a thorough review of your aircraft including logbooks, maintenance status, avionics, and market comps to determine the right price." },
{ icon: Search, num: "02", title: "Market Listing", desc: "Your aircraft gets listed on top platforms including Trade-A-Plane, Controller, and our own buyer network for maximum exposure." },
{ icon: DollarSign, num: "03", title: "Offers & Negotiation", desc: "We handle all inquiries, showings, and negotiations, protecting your interests and keeping you informed at every step." },
{ icon: Handshake, num: "04", title: "Smooth Closing", desc: "From pre-buy inspections to escrow, we coordinate every detail to ensure a seamless and secure transaction." }];


export default function PublicSellYourPlane() {
  useSeo({ title: "Sell Your Aircraft | ClearBlue Aero Brokerage", description: "Sell your aircraft with ClearBlue Aero. Expert pricing, nationwide marketing on Trade-A-Plane and Controller, qualified buyers, and full-service closing. Request a free valuation today.", path: "/sell" });
  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <div className="bg-[#00447f] py-24 px-4 text-center">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">SELL WITH CLEARBLUE AERO</p>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-5">
          Sell Your Aircraft.<br />Done Right.
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          We take the complexity out of selling your aircraft, from pricing and listing to negotiation and closing. Let our experienced brokers get you the best outcome.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/sell/single-engine" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110" style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
            Single Engine Aircraft <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/sell/twin-engine" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/20 hover:bg-white/10 transition-all">
            Multi-Engine Aircraft <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Process */}
      <section className="py-20 bg-[#f5f6f8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Our Process</p>
            <h2 className="text-4xl font-black text-[#00447f]">How It Works</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ icon: Icon, num, title, desc }) =>
            <div key={num} className="bg-white rounded-2xl p-7 border border-gray-100">
                <p className="text-5xl font-black mb-4" style={{ color: '#C9A84C' }}>{num}</p>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#00447f' }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-black text-[#00447f] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Valuation Form Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={COCKPIT_IMAGE} alt="Aircraft cockpit" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0d1a26]/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 flex justify-end" style={{ paddingRight: '75px' }}>
          <div className="w-full max-w-lg">
            <ValuationForm />
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Why ClearBlue Aero</p>
          <h2 className="text-4xl font-black text-[#00447f] mb-6">The Broker Difference</h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-10">
            As pilot-brokers with decades of combined experience, we understand aircraft from both the cockpit and the marketplace. We don't just list your plane. We advocate for your best outcome at every stage.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            {[
            { label: "Expert Pricing", desc: "Data-driven valuations backed by real market comps and appraisal experience." },
            { label: "Qualified Buyers", desc: "We pre-qualify all prospects so your time isn't wasted on non-serious inquiries." },
            { label: "Full-Service Closing", desc: "We handle title, escrow coordination, and all paperwork through to delivery." }].
            map(({ label, desc }) =>
            <div key={label} className="bg-[#f5f6f8] rounded-2xl p-6 border border-gray-100">
                <p className="font-black text-[#00447f] mb-2">{label}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#00447f] text-center px-4">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">Ready to List?</p>
        <h2 className="text-4xl font-black text-white mb-5">Start Your Listing Today</h2>
        <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">Fill out our quick form and a broker will reach out within one business day.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/sell/single-engine" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm hover:brightness-110 transition-all" style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
            Single Engine <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/sell/twin-engine" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/20 hover:bg-white/10 transition-all">
            Multi-Engine <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>);

}