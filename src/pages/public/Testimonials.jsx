import { Link } from "react-router-dom";
import { Quote, Phone, ArrowRight } from "lucide-react";
import useSeo from "@/hooks/useSeo";

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
      <section className="py-20 px-4 text-center" style={{ backgroundColor: NAVY }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
          Client stories
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-5 max-w-3xl mx-auto">
          Customer Testimonials
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          Hear from pilots and aircraft owners who trusted ClearBlue Aero with their aircraft journey.
        </p>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4" style={{ backgroundColor: LIGHT }}>
        <div className="max-w-3xl mx-auto space-y-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-xl p-8 border border-gray-100">
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