import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { HUB_CONTENT } from "@/lib/specialtyDesks";

const NAVY = "#00447f";
const GOLD = "#C9A84C";

export default function BuyerPageDesks() {
  return (
    <section className="py-20" style={{ backgroundColor: '#f5f6f8' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-3">Specialty Desks</p>
          <h2 className="text-3xl md:text-4xl font-black mb-5" style={{ color: NAVY }}>
            A Desk That Knows Your Airframe
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
            Searchers locate by aircraft type and make or by era. Each desk is a front door into ClearBlue Aero: the same
            buyer representation, the same records review, and the same closing, led by people who know that airframe.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HUB_CONTENT.cards.map((desk) => (
            <Link
              key={desk.slug}
              to={`/${desk.slug}`}
              className="group bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-black mb-2" style={{ color: NAVY }}>
                {desk.name}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{desk.blurb}</p>
              <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: GOLD }}>
                Visit the desk <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/specialty-desks"
            className="inline-flex items-center gap-2 px-8 py-4 rounded font-bold text-sm hover:brightness-110 transition-all"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            See all specialty desks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}