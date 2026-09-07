import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";

const NAVY = "#00447f";
const GOLD = "#C9A84C";

export default function EstateConciergeSection() {
  return (
    <section className="relative overflow-hidden py-14 px-4 text-center" style={{ backgroundColor: NAVY }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(0,68,127,0.88), rgba(0,68,127,0.88)), url('https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/0370e691a_82EA3D53-5A45-4F89-8E94-32BD723D4728.png')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />
      <div className="relative max-w-3xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
          For Probate and Family-Law Counsel
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          Estate Aircraft Concierge
        </h2>
        <p className="text-white/70 text-base md:text-lg mb-8 max-w-2xl mx-auto">
          Heirs, executors, and attorneys get one discreet point of contact for valuation, listing, and sale of an estate aircraft. Clear title work, defensible values, and a documented file for the court.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/estate-aircraft"
            className="flex items-center gap-2 px-7 py-3.5 rounded font-bold text-sm transition-all hover:brightness-110"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            Estate Aircraft Concierge <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="tel:+13862276840"
            className="flex items-center gap-2 px-7 py-3.5 rounded font-bold text-white text-sm border border-white/25 hover:bg-white/10 transition-all"
          >
            <Phone className="w-4 h-4" /> 386 227-6840
          </a>
        </div>
      </div>
    </section>
  );
}