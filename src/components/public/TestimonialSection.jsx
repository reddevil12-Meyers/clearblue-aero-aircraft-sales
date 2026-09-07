import { Link } from "react-router-dom";
import { ArrowRight, Quote } from "lucide-react";

const NAVY = "#00447f";
const GOLD = "#C9A84C";

// Backdrop photo of a Beechcraft Bonanza
const BG_IMAGE =
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/e573fcf7e_image.png";

const TESTIMONIAL = {
  quote:
    "Once we made contact my previously ponderous process of buying an airplane became amazingly fluid and quick. Each moment with Darryl, I got to be a student in the best sense of the word. I learned about the aircraft business and economics, the mechanics of my Bonanza, and about flying it.",
  name: "Dr. David Shields",
  aircraft: "V35 Bonanza",
};

export default function TestimonialSection() {
  return (
    <section className="relative overflow-hidden py-16 px-4 text-center" style={{ backgroundColor: NAVY }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0,68,127,0.85), rgba(0,68,127,0.85)), url('${BG_IMAGE}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative max-w-3xl mx-auto">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: GOLD }}
        >
          <Quote className="w-5 h-5" style={{ color: NAVY }} />
        </div>
        <blockquote className="text-lg md:text-xl text-white leading-relaxed mb-6">
          "{TESTIMONIAL.quote}"
        </blockquote>
        <p className="font-bold text-white text-sm">
          {TESTIMONIAL.name}
        </p>
        <p className="text-xs uppercase tracking-widest mb-8" style={{ color: GOLD }}>
          {TESTIMONIAL.aircraft}
        </p>
        <Link
          to="/beechcraft/testimonials"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded font-bold text-sm transition-all hover:brightness-110"
          style={{ backgroundColor: GOLD, color: NAVY }}
        >
          Read more client stories <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}