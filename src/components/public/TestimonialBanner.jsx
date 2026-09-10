import { Link } from "react-router-dom";
import { Quote, ArrowRight } from "lucide-react";

const NAVY = "#00447f";
const GOLD = "#C9A84C";

const TESTIMONIALS = [
  {
    quote:
      "John made the process of purchasing my Cessna 172 feel effortless — answering every question and walking me through each step. A genuinely great experience.",
    name: "Kyle",
    aircraft: "N281RA Cessna 172 Skyhawk",
  },
  {
    quote:
      "The purchase of N512TM for our flight school was seamless. From day one, John was there for every step, helping us navigate the pros and cons for our operation.",
    name: "Hugh Dollar",
    aircraft: "Southern Flight Aviation",
  },
  {
    quote:
      "If I could use one word to describe him, it would be \u2018integrity.\u2019 He is a rarity in the aviation world — skillful, responsive, and true to his word.",
    name: "Dave Pepitone",
    aircraft: "Grumman Tiger Owner",
  },
];

function Card({ t }) {
  return (
    <div
      className="shrink-0 rounded-xl p-5 mx-3 border border-white/15 shadow-lg"
      style={{ backgroundColor: "rgba(0,68,127,0.55)", width: "300px" }}
    >
      <Quote className="w-5 h-5 mb-3" style={{ color: GOLD }} strokeWidth={2.5} />
      <p className="text-white/90 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
      <p className="font-bold text-xs mb-0.5" style={{ color: GOLD }}>
        {t.name}
      </p>
      <p className="text-white/60 text-[11px]">{t.aircraft}</p>
    </div>
  );
}

export default function TestimonialBanner() {
  return (
    <section className="relative py-10 overflow-hidden" style={{ backgroundColor: NAVY }}>
      {/* Background photo under a navy veil */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/49f664764_linkedin-edb96cf8-302c-487d-bfb6-dbb1852d0d2e.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,68,127,0.72)" }} />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex items-end justify-between mb-5">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest">
            What our clients say
          </p>
          <Link
            to="/testimonials"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold transition-colors"
          >
            Read more <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Scrolling row — three cards visible at a time */}
        <div
          className="flex w-max"
          style={{ animation: "marquee-scroll 60s linear infinite" }}
        >
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <Card key={i} t={t} />
          ))}
        </div>
      </div>

      {/* Gold accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: GOLD }} />
    </section>
  );
}