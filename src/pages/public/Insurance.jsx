import { Link } from "react-router-dom";
import { Shield, DollarSign, FileText, Phone, ArrowRight, CheckCircle } from "lucide-react";

const insuranceTypes = [
  { icon: Shield, title: "Hull & Liability", desc: "Comprehensive coverage for your aircraft structure and third-party liability protection for every flight." },
  { icon: FileText, title: "In-Flight & Ground", desc: "Protection whether your aircraft is airborne or hangared, including coverage for taxiing incidents and ground hazards." },
  { icon: DollarSign, title: "Lender-Required Coverage", desc: "If you're financing your purchase, we help you meet lender insurance requirements efficiently and affordably." },
];

const financingOptions = [
  { title: "New Purchase Financing", desc: "Competitive rates for first-time buyers and experienced pilots alike. We connect you with aviation-specific lenders." },
  { title: "Refinancing", desc: "Already own an aircraft? We can help you explore better rates or pull equity to fund upgrades." },
  { title: "Leaseback Arrangements", desc: "Structure your purchase as a leaseback to offset ownership costs through rental revenue." },
];

const coverageItems = [
  "Liability coverage up to $1M+ per occurrence",
  "Hull coverage at agreed value",
  "Medical payments coverage",
  "Guest voluntary settlement",
  "In-flight and not-in-flight options",
  "Student/renter pilot endorsements",
];

export default function PublicInsurance() {
  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <div className="bg-[#00447f] py-24 px-4 text-center">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Insurance & Financing</p>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-5">
          Protect Your Investment
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
          ClearBlue Aero connects you with trusted aviation insurance and financing partners to simplify aircraft ownership from day one.
        </p>
      </div>

      {/* Insurance */}
      <section className="py-20 bg-[#f5f6f8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Coverage Options</p>
            <h2 className="text-4xl font-black text-[#00447f]">Aircraft Insurance</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {insuranceTypes.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: '#00447f' }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-black text-[#00447f] mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h3 className="text-lg font-black text-[#00447f] mb-5">Typical Coverage Includes</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {coverageItems.map(item => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#00447f' }} />
                  <span className="text-gray-600 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Financing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Financing Solutions</p>
            <h2 className="text-4xl font-black text-[#00447f]">Aircraft Financing</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {financingOptions.map(({ title, desc }) => (
              <div key={title} className="bg-[#f5f6f8] rounded-2xl p-7 border border-gray-100">
                <h3 className="text-lg font-black text-[#00447f] mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#00447f] text-center px-4">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">Get a Quote</p>
        <h2 className="text-4xl font-black text-white mb-5">Ready to Get Covered?</h2>
        <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">Contact us today and we'll connect you with the right insurance and financing options for your aircraft.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/contact" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm hover:brightness-110 transition-all" style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
            Get in Touch <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="tel:+13862276840" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/20 hover:bg-white/10 transition-all">
            <Phone className="w-4 h-4" /> (386) 227-6840
          </a>
        </div>
      </section>
    </div>
  );
}