import useSeo from "@/hooks/useSeo";
import BuyerSpecialtyDesks from "@/components/public/BuyerSpecialtyDesks";
import { HUB_CONTENT, DESK_LINE } from "@/lib/specialtyDesks";

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

      {/* Desk grid — featured Beechcraft panel + satellite desks */}
      <BuyerSpecialtyDesks includeHeader={false} panelWide />

      <section className="py-14 px-4" style={{ backgroundColor: "#eef1f5" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm leading-relaxed text-gray-500">{HUB_CONTENT.footnote}</p>
        </div>
      </section>
    </div>
  );
}