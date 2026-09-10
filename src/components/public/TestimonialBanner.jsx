import { Link } from "react-router-dom";
import { Quote, ArrowRight } from "lucide-react";

const NAVY = "#00447f";
const GOLD = "#C9A84C";

export default function TestimonialBanner() {
  return (
    <section className="relative py-16 px-4 text-center overflow-hidden" style={{ backgroundColor: NAVY }}>
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

      <div className="relative z-10 max-w-3xl mx-auto">
        <Quote className="w-10 h-10 mx-auto mb-5" style={{ color: GOLD }} strokeWidth={2.5} />
        <p className="text-xl md:text-3xl font-bold text-white leading-snug mb-6 drop-shadow-md">
          &ldquo;If I could use one word to describe him, it would be &lsquo;integrity.&rsquo;&nbsp;He is a rarity in the aviation world.&rdquo;
        </p>
        <p className="text-[#C9A84C] text-sm font-bold uppercase tracking-widest">Dave Pepitone</p>
        <p className="text-white/60 text-xs mb-7">Grumman Tiger Owner</p>
        <Link
          to="/testimonials"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition-colors"
        >
          Read more client stories <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Gold accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: GOLD }} />
    </section>
  );
}