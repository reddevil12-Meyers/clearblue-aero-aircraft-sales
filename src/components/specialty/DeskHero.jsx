import { Link } from "react-router-dom";
import { Phone, ArrowRight } from "lucide-react";

const NAVY = "#1B365D";
const GOLD = "#C4A35A";
const LIGHT = "#E8EEF5";
const SLATE = "#334155";

// Hero for the satellite desks. Each desk sets hero.layout so the four pages
// do not share one template:
//   photo-center (Cessna)  photo-left (Piper)
//   navy-center (Meyers)   light-left (Vintage)
export default function DeskHero({ desk, hero }) {
  const h1 = hero.h1 || desk.h1;
  const deck = hero.deck || desk.deck;
  const image = hero.heroImage || desk.heroImage;
  const layout = hero.layout || "photo-center";
  const left = layout.endsWith("-left");
  const light = layout === "light-left";

  return (
    <section
      className={`relative py-24 px-4 ${left ? "text-left" : "text-center"}`}
      style={{ backgroundColor: light ? LIGHT : NAVY }}
    >
      {image && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${image}')` }}
          />
          <div
            className="absolute inset-0"
            style={
              left
                ? { background: "linear-gradient(90deg, rgba(27,54,93,0.92) 0%, rgba(27,54,93,0.6) 55%, rgba(27,54,93,0.35) 100%)" }
                : { backgroundColor: "rgba(27,54,93,0.72)", mixBlendMode: "multiply" }
            }
          />
        </>
      )}
      <div className={`relative max-w-4xl mx-auto ${left ? "" : "flex flex-col items-center"}`}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: light ? NAVY : GOLD }}>
          {desk.kicker}
        </p>
        <p className="text-sm mb-6" style={{ color: light ? SLATE : "rgba(255,255,255,0.6)" }}>
          {hero.firmLine || "A practice of ClearBlue Aero."}
        </p>
        <h1 className="text-4xl md:text-5xl font-black mb-5" style={{ color: light ? NAVY : "#fff" }}>
          {h1}
        </h1>
        {layout === "navy-center" && <div className="w-16 h-0.5 mb-6" style={{ backgroundColor: GOLD }} />}
        <p className="text-lg mb-10 max-w-2xl" style={{ color: light ? SLATE : "rgba(255,255,255,0.7)" }}>
          {deck}
        </p>
        <div className={`flex flex-wrap gap-4 ${left ? "" : "justify-center"}`}>
          <Link
            to={hero.primaryCta?.to || "/contact"}
            className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            {hero.primaryCta?.label || "Start a buyer search"} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/sell"
            className={`flex items-center gap-2 px-8 py-4 rounded font-bold text-sm border transition-all ${light ? "hover:bg-white/70" : "text-white hover:bg-white/10"}`}
            style={light ? { color: NAVY, borderColor: NAVY } : { borderColor: "rgba(255,255,255,0.25)" }}
          >
            {desk.sellCtaLabel}
          </Link>
          <a
            href="tel:3862276840"
            className={`flex items-center gap-2 px-8 py-4 rounded font-bold text-sm border transition-all ${light ? "hover:bg-white/70" : "text-white hover:bg-white/10"}`}
            style={light ? { color: NAVY, borderColor: NAVY } : { borderColor: "rgba(255,255,255,0.25)" }}
          >
            <Phone className="w-4 h-4" /> 386 227-6840
          </a>
        </div>
      </div>
    </section>
  );
}