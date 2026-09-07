import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import useSeo from "@/hooks/useSeo";
import { HUB_CONTENT, SPECIALTY_DESKS, DESK_LINE } from "@/lib/specialtyDesks";

const NAVY = "#1B365D";
const GOLD = "#C4A35A";
const LIGHT = "#E8EEF5";
const SLATE = "#334155";

export default function SpecialtyDesks() {
  useSeo({ title: HUB_CONTENT.seoTitle, description: HUB_CONTENT.meta, path: "/specialty-desks" });

  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <section className="py-20 px-4 text-center" style={{ backgroundColor: NAVY }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
          ClearBlue Aero Specialty Desks
        </p>
        <p className="text-white/60 text-sm mb-6">{DESK_LINE}</p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-5 max-w-3xl mx-auto">{HUB_CONTENT.h1}</h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">{HUB_CONTENT.deck}</p>
      </section>

      {/* Desk cards */}
      <section className="py-16 px-4" style={{ backgroundColor: LIGHT }}>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HUB_CONTENT.cards.map((card) => (
            <Link
              key={card.slug}
              to={`/${card.slug}`}
              className="bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-lg transition-shadow block border-t-4"
              style={{ borderTopColor: GOLD }}
            >
              <h2 className="text-xl font-black mb-2" style={{ color: NAVY }}>
                {card.name}
              </h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: SLATE }}>
                {card.blurb}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-bold hover:underline" style={{ color: NAVY }}>
                Visit the desk <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
        <div className="max-w-3xl mx-auto mt-12 text-center">
          <p className="text-sm leading-relaxed text-gray-500">{HUB_CONTENT.footnote}</p>
        </div>
      </section>
    </div>
  );
}