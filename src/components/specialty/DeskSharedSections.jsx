import { Link } from "react-router-dom";
import { ArrowRight, Plane } from "lucide-react";
import { HOW_WE_WORK_STEPS, DESK_FAQ, SPECIALTY_DESKS } from "@/lib/specialtyDesks";
import DeskListings from "./DeskListings";

const NAVY = "#1B365D";
const GOLD = "#C4A35A";
const LIGHT = "#E8EEF5";
const SLATE = "#334155";

function SisterDesks() {
  return (
    <section className="py-16 px-4" style={{ backgroundColor: LIGHT }}>
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="font-display text-3xl font-black mb-4" style={{ color: NAVY }}>
          Sister desks
        </h2>
        <span className="block w-16 h-0.5 mx-auto mb-10" style={{ backgroundColor: GOLD }} />
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {SPECIALTY_DESKS.map((d, i) => (
            <span key={d.slug} className="flex items-center gap-3">
              <Link to={`/${d.slug}`} className="text-sm font-semibold hover:underline" style={{ color: NAVY }}>
                {d.name}
              </Link>
              {i < SPECIALTY_DESKS.length - 1 && <span className="text-gray-300">·</span>}
            </span>
          ))}
          <span className="text-gray-300">·</span>
          <Link to="/specialty-desks" className="text-sm font-semibold hover:underline" style={{ color: GOLD }}>
            All desks
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HowWeWork() {
  return (
    <section className="py-16 px-4" style={{ backgroundColor: NAVY }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-white mb-10 text-center">Our Acquisition Process</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_WE_WORK_STEPS.map((step, i) => (
            <div key={i} className="rounded-xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-3xl font-black mb-3" style={{ color: GOLD }}>
                {i + 1}
              </p>
              <h3 className="text-white font-bold text-sm mb-2">{step.heading}</h3>
              <p className="text-white/80 text-sm leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ListingsCta({ slug }) {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GOLD }}>
          Aircraft for Sale
        </p>
        <h2 className="text-3xl font-black mb-4" style={{ color: NAVY }}>
          Current and Sold listings
        </h2>
        <p className="text-sm leading-relaxed mb-8" style={{ color: SLATE }}>
          The full ClearBlue Aero inventory, every make we work, lives in one place.
        </p>
      </div>
      {slug && <DeskListings slug={slug} />}
    </section>
  );
}


export function DeskFaq() {
  return (
    <section className="py-16 px-4" style={{ backgroundColor: LIGHT }}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-black mb-8 text-center" style={{ color: NAVY }}>
          Common questions
        </h2>
        <div className="space-y-4">
          {DESK_FAQ.map((item) => (
            <div key={item.q} className="bg-white rounded-xl p-6 border border-gray-100">
              <p className="font-bold mb-2" style={{ color: NAVY }}>
                {item.q}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: SLATE }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DeskDisclaimer({ deskName }) {
  return (
    <section className="py-10 px-4" style={{ backgroundColor: SLATE }}>
      <div className="max-w-3xl mx-auto flex items-start gap-3">
        <Plane className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
        <p className="text-xs text-white/50 leading-relaxed">
          ClearBlue Aero is an aviation brokerage. We do not practice law. Fees are set in a written engagement before work
          starts. {deskName} is a brand of ClearBlue Aero.
        </p>
      </div>
    </section>
  );
}

export default SisterDesks;