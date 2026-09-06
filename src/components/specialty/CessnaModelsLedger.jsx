import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { findPhoto } from "./ModelsWeWork";

const GOLD = "#C4A35A";
const NAVY = "#1B365D";
const CESSNA_LOGO =
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/a27ece86e_cessna.jpeg";

const ROWS = [
  {
    groups: [["172", "172R", "172S"], ["182", "182RG", "T182"]],
    groupLayout: "stack",
    amp: true,
    heading: "172 & 182",
    text: "172, 172R, and 172S; 182, 182RG, and T182. The training and personal staple, and the useful-load workhorse of the Cessna line.",
    photoKeys: ["c172", "c182"],
  },
  {
    groups: [["206", "T206"], ["210", "T210"]],
    groupLayout: "stack",
    amp: true,
    heading: "206 & 210",
    text: "206 and T206; 210 and T210, with gear and spar considerations by serial. Six seats, fixed gear, big cabin.",
    photoKeys: ["c206", "c210"],
  },
  {
    groups: [["310", "340"]],
    groupLayout: "row",
    heading: "Piston Twins",
    text: "310, 340, and other piston twins by request.",
  },
  {
    groups: [["400", "414"], ["402", "421"]],
    groupLayout: "row",
    heading: "Cabin Class",
    text: "400-series and cabin-class Cessna when the file fits.",
  },
];

function NumbersColumn({ groups, layout }) {
  const container = layout === "stack" ? "flex flex-col gap-4" : "flex flex-row gap-10";
  return (
    <div className={container}>
      {groups.map((group, gi) => (
        <div
          key={gi}
          className={layout === "stack" && gi > 0 ? "border-t pt-4" : ""}
          style={layout === "stack" && gi > 0 ? { borderColor: `${GOLD}55` } : undefined}
        >
          {group.map((n) => (
            <p key={n} className="text-lg font-medium leading-snug" style={{ color: GOLD }}>
              {n}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

function LedgerPhoto({ url }) {
  if (!url) {
    return (
      <div className="aspect-[4/3] w-full animate-pulse" style={{ backgroundColor: NAVY }} />
    );
  }
  return (
    <img
      src={url}
      alt="Cessna aircraft"
      loading="lazy"
      decoding="async"
      className="aspect-[4/3] w-full object-cover"
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

  return (
    <section className="bg-black w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-16 pb-14">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
            {desk.kicker}
          </p>
          <h2 className="font-display text-3xl font-black text-white">Models we work</h2>
        </div>

        <div className="border-t" style={{ borderColor: `${GOLD}55` }}>
          {ROWS.map((row) => (
            <div
              key={row.heading}
              className="grid lg:grid-cols-[200px_90px_1fr_260px] gap-6 lg:gap-10 items-center py-8 lg:py-10 border-b"
              style={{ borderColor: `${GOLD}55` }}
            >
              <NumbersColumn groups={row.groups} layout={row.groupLayout} />

              <div className="hidden lg:block">
                {row.amp && (
                  <span className="font-serif text-6xl leading-none" style={{ color: GOLD }}>
                    &
                  </span>
                )}
              </div>

              <p className="text-sm text-white/75 leading-relaxed max-w-xl">
                <span className="font-bold text-white">{row.heading}:</span> {row.text}
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {(row.photoKeys || []).map((k) => (
                  <LedgerPhoto key={k} url={photos?.[k]} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-14 flex justify-center">
          <img src={CESSNA_LOGO} alt="Cessna" className="w-44" />
        </div>
      </div>
    </section>
  );
}