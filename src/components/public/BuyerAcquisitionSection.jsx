import { Link } from "react-router-dom";
import { ArrowRight, ClipboardCheck, Search, ShieldCheck } from "lucide-react";

const NAVY = "#00447f";
const GOLD = "#C9A84C";

const POINTS = [
  {
    icon: ClipboardCheck,
    title: "Written Representation",
    text: "You are the client, not the seller. Every search runs under a written consulting agreement.",
  },
  {
    icon: Search,
    title: "Full-Market Search",
    text: "Listed and off-market aircraft, screened against your mission, budget, and experience.",
  },
  {
    icon: ShieldCheck,
    title: "Pre-Buy to Closing",
    text: "Logs reviewed before you travel, the pre-buy coordinated, and the negotiation handled for you.",
  },
];

export default function BuyerAcquisitionSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: NAVY }}>
          We Work for Buyers
        </p>
        <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: NAVY }}>
          Buyer Acquisitions
        </h2>
        <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto mb-10">
          The listing broker works for the seller. Who works for you? Our buyer representation covers the search, the inspection, and the negotiation, so you buy the right aircraft at the right price.
        </p>
        <div className="grid sm:grid-cols-3 gap-6 mb-10 text-left">
          {POINTS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-[#f5f6f8] rounded-2xl p-6 border border-gray-100">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: NAVY }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-black mb-2" style={{ color: NAVY }}>{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/buyer"
            className="flex items-center gap-2 px-7 py-3.5 rounded font-bold text-sm transition-all hover:brightness-110"
            style={{ backgroundColor: NAVY, color: "#fff" }}
          >
            Buyer Representation <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/specialty-desks"
            className="flex items-center gap-2 px-7 py-3.5 rounded font-bold text-sm border transition-all hover:brightness-110"
            style={{ borderColor: NAVY, color: NAVY }}
          >
            Our Specialty Desks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}