import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { findPhoto } from "./ModelsWeWork";

const GOLD = "#C4A46F";
const NAVY_DEEP = "#1A304B";
const CESSNA_LOGO =
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/a27ece86e_cessna.jpeg";

const ROWS = [
  {
    groups: [["172", "172R", "172S"], ["182", "182RG", "T182"]],
    heading: "172 & 182",
    text: "172, 172R, and 172S; 182, 182RG, and T182. The training and personal staple, and the useful-load workhorse of the Cessna line.",
  },
  {
    groups: [["206", "T206"], ["210", "T210"]],
    heading: "206 & 210",
    text: "206 and T206; 210 and T210, with gear and spar considerations by serial. Six seats, fixed gear, big cabin.",
  },
  {
    groups: [["310", "340"]],
    heading: "Piston Twins",
    text: "310, 340, and other piston twins by request.",
  },
  {
    groups: [["400", "414"], ["402", "421"]],
    heading: "Cabin Class",
    text: "400-series and cabin-class Cessna when the file fits.",
  },
];

function NumbersColumn({ groups }) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-4">
      {groups.map((group, gi) => (
        <div
          key={gi}
          className={gi > 0 ? "border-l pl-8" : ""}
          style={gi > 0 ? { borderColor: `${GOLD}55` } : undefined}
        >
          {group.map((n) => (
            <p key={n} className="text-xl font-bold leading-snug" style={{ color: GOLD }}>
              {n}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

function FeaturePhoto({ url }) {
  if (!url) {
    return <div className="w-full h-full min-h-[160px] animate-pulse" style={{ backgroundColor: NAVY_DEEP }} />;
  }
  return (
    <img
      src={url}
      alt="Cessna aircraft"
      loading="lazy"
      decoding="async"
      className="w-full h-full min-h-[160px] lg:min-h-0 object-cover"
    />
  );
}

export default function CessnaModelsLedger({ desk }) {
  const [photos, setPhotos] = useState(null);

  useEffect(() => {
    let alive = true;
    base44.functions
      .invoke("getPublicInventory", {})
      .then((res) => {
        if (!alive) return;
        const pool = (res.data.aircraft || []).filter(
          (a) => (a.make || "").toLowerCase() === "cessna"
        );
        const usedIds = new Set();
        const keys = ["c172", "c182", "c206", "c210"];
        const result = {};
        keys.forEach((k) => {
          result[k] = findPhoto(pool, k, usedIds, keys)?.url || null;
        });
        setPhotos(result);
      })
      .catch(() => {
        if (alive) setPhotos({});
      });
    return () => {
      alive = false;
    };
  }, []);

  const stacked = ["c172", "c182", "c206", "c210"];

  return (
    <section className="w-full">
      <div className="flex flex-col lg:flex-row">
        {/* Photo column */}
        <div className="lg:w-[30%] grid grid-cols-2 lg:grid-cols-1">
          {stacked.map((k) => (
            <FeaturePhoto key={k} url={photos?.[k]} />
          ))}
        </div>

        {/* Navy ledger column */}
        <div className="lg:w-[70%] px-6 sm:px-10 lg:px-14 py-14" style={{ backgroundColor: NAVY_DEEP }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
            {desk.kicker}
          </p>
          <h2 className="font-display text-3xl font-black text-white mb-10">Models we work</h2>

          <div className="border-t" style={{ borderColor: `${GOLD}55` }}>
            {ROWS.map((row) => (
              <div
                key={row.heading}
                className="grid sm:grid-cols-[240px_1fr] gap-4 sm:gap-8 items-center py-8 border-b"
                style={{ borderColor: `${GOLD}55` }}
              >
                <NumbersColumn groups={row.groups} />
                <p className="text-sm text-white/75 leading-relaxed">
                  <span className="block text-xl font-bold text-white mb-1">{row.heading}</span>
                  {row.text}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-10 flex justify-end">
            <img src={CESSNA_LOGO} alt="Cessna" className="w-36" />
          </div>
        </div>
      </div>
    </section>
  );
}