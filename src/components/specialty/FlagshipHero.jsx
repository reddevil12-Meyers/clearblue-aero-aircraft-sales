import { Link } from "react-router-dom";
import { Phone, ArrowRight } from "lucide-react";

const NAVY = "#1B365D";
const GOLD = "#C4A35A";

export default function FlagshipHero({ flagship }) {
  return (
    <section className="relative py-24 px-4 text-center" style={{ backgroundColor: NAVY }}>
      {flagship.heroImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${flagship.heroImage}')` }}
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(27,54,93,0.72)", mixBlendMode: "multiply" }}
          />
        </>
      )}
      <div className="relative">
        <div
          className="w-16 h-16 mx-auto mb-6 border-2 flex items-center justify-center font-black text-xl tracking-wide"
          style={{ borderColor: GOLD, color: GOLD }}
        >
          {flagship.monogram}
        </div>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
          {flagship.kicker}
        </p>
        <p className="text-white/60 text-sm mb-6">{flagship.firmLine}</p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-5 max-w-3xl mx-auto">{flagship.h1}</h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">{flagship.deck}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to={flagship.primaryCta.to}
            className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            {flagship.primaryCta.label} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to={flagship.sellCta.to}
            className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/25 hover:bg-white/10 transition-all"
          >
            {flagship.sellCta.label}
          </Link>
          <a
            href="tel:3862276840"
            className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/25 hover:bg-white/10 transition-all"
          >
            <Phone className="w-4 h-4" /> 386 227-6840
          </a>
        </div>
      </div>
    </section>
  );
}