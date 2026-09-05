import { Link } from "react-router-dom";
import { ArrowRight, Quote } from "lucide-react";
import { BEECHCRAFT_TESTIMONIALS } from "@/lib/beechcraftTestimonials";

const NAVY = "#1B365D";
const GOLD = "#C4A35A";

export default function BeechcraftTestimonialsBanner() {
  const featured = BEECHCRAFT_TESTIMONIALS.slice(0, 2);

  return (
    <section className="py-16 px-4" style={{ backgroundColor: NAVY }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-widest mb-2 text-center" style={{ color: GOLD }}>
          Buyer Representation
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-5 text-center max-w-2xl mx-auto">
          Buy the Right Beechcraft. The First Time.
        </h2>
        <p className="text-white/70 text-base leading-relaxed text-center max-w-2xl mx-auto mb-4">
          Buying a Bonanza or Baron is a major investment. The challenge isn't finding airplanes for sale. It's knowing which aircraft are worth pursuing, what they are really worth, and what you may be getting into after the purchase.
        </p>
        <p className="text-white text-base font-semibold leading-relaxed text-center max-w-2xl mx-auto mb-10">
          Beechcraft Buyers represents you, the buyer, throughout the acquisition process.
        </p>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {featured.map((t) => (
            <div
              key={t.name}
              className="rounded-xl p-6 flex flex-col"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              <Quote className="w-5 h-5 mb-3" style={{ color: GOLD }} />
              <p className="text-white/80 text-sm leading-relaxed flex-1">
                "{t.quote.length > 220 ? `${t.quote.slice(0, 220).trim()}…` : t.quote}"
              </p>
              <div className="mt-4">
                <p className="text-white font-bold text-sm">{t.name}</p>
                <p className="text-white/50 text-xs">{t.aircraft}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link
            to="/beechcraft/testimonials"
            className="inline-flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            Read all testimonials <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}