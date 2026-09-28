import { Link } from "react-router-dom";
import { ArrowRight, DollarSign, Search, Handshake, FileText, Phone, AlertTriangle, MapPin, Scale } from "lucide-react";
import ValuationForm from "@/components/public/ValuationForm";
import useSeo from "@/hooks/useSeo";

const NAVY = "#00447f";
const GOLD = "#C9A84C";
const COCKPIT_IMAGE = "https://images.unsplash.com/photo-1569939012617-bd8f156b934a?w=1600&q=80&auto=format&fit=crop";

export default function PublicSellYourPlane() {
  useSeo({
    title: "Sell Your Aircraft | Florida Brokerage | ClearBlue Aero",
    description: "List with a Florida broker who prices to the market, screens buyers, and runs the sale through closing. Piston, complex, vintage, and estate airframes.",
    path: "/sell",
  });
  return (
    <div className="bg-white w-full">
      <div className="bg-[#00447f] py-24 px-4 text-center">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">SELL WITH CLEARBLUE AERO</p>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-5">
          Sell the airplane.<br />Keep the process from becoming the job.
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          Selling an aircraft is not listing it on one website and waiting. We represent the seller only on your transaction.
        </p>
        <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded font-bold text-sm" style={{ backgroundColor: GOLD, color: NAVY }}>
          Schedule a conversation <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={COCKPIT_IMAGE} alt="Aircraft cockpit" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0d1a26]/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 flex justify-end md:pr-[75px]">
          <div className="w-full max-w-lg">
            <ValuationForm />
          </div>
        </div>
      </section>
    </div>
  );
}
