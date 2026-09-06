import { Link } from "react-router-dom";
import { ArrowRight, Plane } from "lucide-react";
import { HUB_CONTENT } from "@/lib/specialtyDesks";

const NAVY = "#00447f";
const GOLD = "#C9A84C";

export default function BuyerPageDesks() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#f5f6f8] to-[#eef1f5]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
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
              className="group relative overflow-hidden bg-white rounded-2xl p-8 border border-gray-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <span
                className="absolute top-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                style={{ backgroundColor: GOLD }}
              />
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300"
                style={{ backgroundColor: "#eef1f5" }}
              >
                <Plane className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-12" style={{ color: NAVY }} />
              </div>
              <h3 className="text-lg font-black mb-2 transition-colors duration-300" style={{ color: NAVY }}>
                {desk.name}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{desk.blurb}</p>
              <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: GOLD }}>
                Visit the desk
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </span>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            to="/specialty-desks"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-sm hover:brightness-110 hover:shadow-lg transition-all"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            See all specialty desks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}