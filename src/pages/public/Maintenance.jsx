import { Link } from "react-router-dom";
import { Wrench, Search, ShieldCheck, ClipboardList, Settings, Phone, ArrowRight, CheckCircle } from "lucide-react";

const services = [
  {
    icon: Search,
    title: "Pre-Purchase Inspections",
    desc: "Before you buy, we coordinate a thorough pre-purchase inspection with trusted FAA-certified facilities to uncover any issues and protect your investment.",
  },
  {
    icon: ShieldCheck,
    title: "AD & SB Compliance Review",
    desc: "We review Airworthiness Directives and Service Bulletins relevant to your aircraft to ensure full compliance and document status.",
  },
  {
    icon: ClipboardList,
    title: "Logbook & Records Analysis",
    desc: "Our brokers analyze maintenance logs, engine records, and avionics paperwork to verify airworthiness history and detect discrepancies.",
  },
  {
    icon: Settings,
    title: "Engine & Avionics Analysis",
    desc: "Comprehensive review of engine hours, time since overhaul, prop condition, and avionics serviceability to assess value and airworthiness.",
  },
  {
    icon: Wrench,
    title: "Annual Inspection Coordination",
    desc: "We help coordinate annual inspections with qualified shops so you're never caught off-guard by compliance deadlines.",
  },
  {
    icon: ShieldCheck,
    title: "Post-Sale Support",
    desc: "After your purchase, we remain available to help with questions about maintenance history, upcoming service intervals, and shop referrals.",
  },
];

const checkItems = [
  "FAA-certified inspection coordination",
  "Engine trend monitoring support",
  "Airworthiness Directive compliance review",
  "Pre-buy inspection management",
  "Logbook and records verification",
  "Trusted MRO shop network",
];

export default function PublicMaintenance() {
  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <div className="bg-[#00447f] py-24 px-4 text-center">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Maintenance & Inspections</p>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
          Airworthy. Always.
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
          ClearBlue Aero brings brokerage-level diligence to maintenance oversight — protecting buyers and sellers through every phase of a transaction.
        </p>
      </div>

      {/* Services Grid */}
      <section className="py-20 bg-[#f5f6f8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">What We Offer</p>
            <h2 className="text-3xl md:text-5xl font-black text-[#00447f]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Maintenance Services
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: '#00447f' }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-black text-[#00447f] mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200&q=85"
                alt="Aircraft maintenance"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-[#00447f] text-white rounded-2xl p-5 shadow-2xl hidden md:block">
              <p className="text-3xl font-black text-[#C9A84C]">100%</p>
              <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">Pre-Buy Verified</p>
            </div>
          </div>
          <div>
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Our Approach</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#00447f] leading-tight mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Broker-Led<br />Maintenance Intelligence
            </h2>
            <p className="text-gray-500 leading-relaxed text-lg mb-8">
              We don't just sell aircraft — we ensure the ones we represent are properly vetted. Our brokers work alongside certified mechanics to interpret findings and negotiate resolution before closing.
            </p>
            <div className="space-y-3">
              {checkItems.map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#C9A84C' }}>
                    <CheckCircle className="w-3.5 h-3.5 text-[#00447f]" />
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#00447f] text-center px-4">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">Ready to Get Started?</p>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
          Schedule a Pre-Buy Today
        </h2>
        <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">
          Contact our team to coordinate a pre-purchase inspection or maintenance review for any aircraft.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/contact"
            className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110"
            style={{ backgroundColor: '#C9A84C', color: '#00447f' }}
          >
            Contact Us <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="tel:+13862276840"
            className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/20 hover:bg-white/10 transition-all"
          >
            <Phone className="w-4 h-4" /> (386) 227-6840
          </a>
        </div>
      </section>
    </div>
  );
}