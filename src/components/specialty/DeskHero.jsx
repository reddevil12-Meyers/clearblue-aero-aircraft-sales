import { Link } from "react-router-dom";
import { Phone, ArrowRight } from "lucide-react";

const NAVY = "#0B3A66";
const GOLD = "#C4A35A";

// Hero for the satellite desks. hero.layout sets alignment so the pages are
// not identical templates:
//   photo-center (Cessna)   photo-left (Piper)
//   navy-center w/ gold rule (Meyers)   photo-left (Vintage)
export default function DeskHero({ desk, hero }) {
  const image = hero.heroImage || desk.heroImage;
  const layout = hero.layout || "photo-center";
  const left = layout.endsWith("-left");

  return (
    <section
      className={`relative min-h-[70vh] flex items-center px-4 py-20 ${left ? "text-left" : "text-center"}`}
      style={{ backgroundColor: NAVY }}
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
                ? { background: "linear-gradient(90deg, rgba(11,58,102,0.75) 0%, rgba(11,58,102,0.5) 60%, rgba(11,58,102,0.35) 100%)" }
                : { backgroundColor: "rgba(11,58,102,0.55)" }
            }
          />
        </>
      )}
      <div className={`relative max-w-4xl mx-auto w-full ${left ? "" : "flex flex-col items-center"}`}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
          {desk.kicker}
        </p>
        <p className="text-sm mb-6 text-white/60">{hero.firmLine || "A practice of ClearBlue Aero."}</p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-5 max-w-3xl">{desk.h1}</h1>
        {layout === "navy-center" && <div className="w-16 h-0.5 mb-6" style={{ backgroundColor: GOLD }} />}
        <p className="text-lg mb-10 max-w-2xl text-white/70">{desk.deck}</p>
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
            className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm text-white border border-white/25 hover:bg-white/10 transition-all"
          >
            {desk.sellCtaLabel}
          </Link>
          <a
            href="tel:3862276840"
            className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm text-white border border-white/25 hover:bg-white/10 transition-all"
          >
            <Phone className="w-4 h-4" /> 386 227-6840
          </a>
        </div>
      </div>
    </section>
  );
}