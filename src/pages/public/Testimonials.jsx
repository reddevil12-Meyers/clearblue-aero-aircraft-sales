import { Link } from "react-router-dom";
import { Quote, Phone, ArrowRight } from "lucide-react";
import useSeo from "@/hooks/useSeo";
import { BEECHCRAFT_TESTIMONIALS } from "@/lib/beechcraftTestimonials";
import TestimonialMarquee from "@/components/public/TestimonialMarquee";

const NAVY = "#00447f";
const GOLD = "#C9A84C";
const LIGHT = "#f5f6f8";
const SLATE = "#334155";

const TESTIMONIALS = [
  {
    quote:
      "I've spent years around aircraft, but buying my own was uncharted territory. John at ClearBlue Aero made the process of purchasing my Cessna 172 feel effortless, answering every question, walking me through each step, and making sure I felt confident in the decision. His guidance turned what could have been an overwhelming process into a genuinely great experience.",
    name: "Kyle",
    aircraft: "N281RA Cessna 172 Skyhawk",
  },
  {
    quote:
      "The purchase of N512TM for our flight school was a seamless experience, and I couldn't be more grateful for John's guidance at ClearBlue Aero throughout the entire process. From day one, he was there for every step, helping us carefully navigate the pros and cons to make the best possible decision for our operation.",
    name: "Hugh Dollar",
    aircraft: "Southern Flight Aviation",
  },
];

const ALL_TESTIMONIALS = [
  ...TESTIMONIALS,
  ...BEECHCRAFT_TESTIMONIALS.map((t) => ({ ...t, desk: true })),
];
const FIRST_BEECHCRAFT_INDEX = ALL_TESTIMONIALS.findIndex((t) => t.desk);

const TestimonialCard = ({ t }) => (
  <div className="bg-white rounded-xl p-8 border border-gray-100">
    <Quote className="w-6 h-6 mb-4" style={{ color: GOLD }} />
    <p className="text-base leading-relaxed mb-5" style={{ color: SLATE }}>
      &ldquo;{t.quote}&rdquo;
    </p>
    <p className="font-bold text-sm" style={{ color: NAVY }}>
      - {t.name}
    </p>
    <p className="text-xs" style={{ color: SLATE }}>
      {t.aircraft}
    </p>
  </div>
);

export default function Testimonials() {
  useSeo({
    title: "Client Testimonials | ClearBlue Aero",
    description:
      "Hear from pilots and aircraft owners who trusted ClearBlue Aero with their aircraft purchase, sale, and acquisition.",
    path: "/testimonials",
  });

  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <section className="relative py-28 px-4 text-center overflow-hidden" style={{ backgroundColor: NAVY }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/49f664764_linkedin-edb96cf8-302c-487d-bfb6-dbb1852d0d2e.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,68,127,0.55)" }} />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
            Client stories
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5 max-w-3xl mx-auto drop-shadow-md">
            Customer Testimonials
          </h1>
          <p className="text-white/85 text-lg max-w-2xl mx-auto">
            Hear from pilots and aircraft owners who trusted ClearBlue Aero with their aircraft journey.
          </p>
        </div>
      </section>

      {/* Testimonials — first 3 rows */}
      <section className="py-16 px-4" style={{ backgroundColor: LIGHT }}>
        <div className="max-w-3xl mx-auto space-y-6">
          {ALL_TESTIMONIALS.slice(0, 3).map((t, i) => (
            <div key={t.name}>
              {i === FIRST_BEECHCRAFT_INDEX && (
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 text-center pt-8">
                  Beechcraft Buyers
                </p>
              )}
              <TestimonialCard t={t} />
            </div>
          ))}
        </div>
      </section>

      {/* Moving photo banner */}
      <TestimonialMarquee />

      {/* Testimonials — continued */}
      <section className="pt-10 pb-16 px-4" style={{ backgroundColor: LIGHT }}>
        <div className="max-w-3xl mx-auto space-y-6">
          {ALL_TESTIMONIALS.slice(3).map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center" style={{ backgroundColor: NAVY }}>
        <h2 className="text-3xl font-black text-white mb-4">
          Ready to join our satisfied clients?
        </h2>
        <p className="text-white/70 text-sm max-w-xl mx-auto mb-8">
          Start with a free consultation and see why pilots choose ClearBlue Aero.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            Get in Touch <ArrowRight className="w-4 h-4" />
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