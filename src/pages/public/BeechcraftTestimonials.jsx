import { Link } from "react-router-dom";
import { Quote, Phone, ArrowRight } from "lucide-react";
import useSeo from "@/hooks/useSeo";
import { BEECHCRAFT_TESTIMONIALS } from "@/lib/beechcraftTestimonials";

const NAVY = "#1B365D";
const GOLD = "#C4A35A";
const LIGHT = "#E8EEF5";
const SLATE = "#334155";

export default function BeechcraftTestimonials() {
  useSeo({
    title: "Beechcraft Buyer Testimonials | ClearBlue Aero",
    description:
      "Real client stories from Beechcraft Buyers — Bonanza and Baron owners on pre-buy help, pricing guidance, and purchase support.",
    path: "/beechcraft/testimonials",
  });

  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <section className="py-20 px-4 text-center" style={{ backgroundColor: NAVY }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
          Client stories
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-5 max-w-3xl mx-auto">
          Customer Testimonials
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          Hear from pilots and aircraft owners who trusted Beechcraft Buyers with their purchase.
        </p>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4" style={{ backgroundColor: LIGHT }}>
        <div className="max-w-3xl mx-auto space-y-6">
          {BEECHCRAFT_TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-xl p-8 border border-gray-100">
              <Quote className="w-6 h-6 mb-4" style={{ color: GOLD }} />
              <p className="text-base leading-relaxed mb-5" style={{ color: SLATE }}>
                "{t.quote}"
              </p>
              <p className="font-bold text-sm" style={{ color: NAVY }}>
                {t.name}
              </p>
              <p className="text-xs" style={{ color: SLATE }}>
                {t.aircraft}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center" style={{ backgroundColor: NAVY }}>
        <h2 className="text-3xl font-black text-white mb-4">
          Ready to join our satisfied clients?
        </h2>
        <p className="text-white/70 text-sm max-w-xl mx-auto mb-8">
          Start with a free consultation and discover why we're the most respected buyer service in aviation.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/beechcraft#intake"
            className="inline-flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            Get started <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="tel:+13862276840"
            className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/25 hover:bg-white/10 transition-all"
          >
            <Phone className="w-4 h-4" /> 386 227-6840
          </a>
        </div>
      </section>
    </div>
  );
}