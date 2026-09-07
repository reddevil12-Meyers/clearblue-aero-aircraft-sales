import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CHARCOAL = "#0A1630";
const GOLD = "#C5A866";

const TESTIMONIAL = {
  quote:
    "The purchase of N512TM for our flight school was a seamless experience, and I couldn't be more grateful for John's guidance at ClearBlue Aero throughout the entire process. From day one, he was there for every step, helping us carefully navigate the pros and cons to make the best possible decision for our operation.",
  name: "Hugh Dollar",
  aircraft: "Southern Flight Aviation",
};

export default function HomeHero() {
  return (
    <section
      className="relative min-h-[75vh] flex items-center overflow-hidden"
      style={{ backgroundColor: CHARCOAL }}
    >
      {/* Desaturated hangar photo under a heavy charcoal veil */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/69a0819e0_generated_image.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "sepia(100%) hue-rotate(180deg) saturate(1.6) brightness(0.55)",
        }}
      />
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(10,22,55,0.6)" }} />

      {/* Faint vertical grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 1px, transparent 1px, transparent 96px)",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left column: label, headline, subline, CTAs */}
        <div className="lg:col-span-7">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-5">
            Aircraft Sales &amp; Acquisitions
          </h1>
          <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-xl mb-10">
            Give us a try and see why we are quickly becoming your aircraft brokerage firm of choice!
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/inventory"
              className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110"
              style={{ backgroundColor: GOLD, color: CHARCOAL }}
            >
              View Aircraft for Sale <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/40 hover:bg-white/10 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Right column: glassmorphic testimonial card */}
        <div className="lg:col-span-5">
          <div
            className="rounded-xl p-8 backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(13,35,84,0.65)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <p className="text-white/85 text-sm md:text-base leading-relaxed mb-6">
              &ldquo;{TESTIMONIAL.quote}&rdquo;
            </p>
            <p className="font-bold text-white text-sm">- {TESTIMONIAL.name}</p>
            <p className="text-white/50 text-sm mt-1">{TESTIMONIAL.aircraft}</p>
          </div>
        </div>
      </div>
    </section>
  );
}