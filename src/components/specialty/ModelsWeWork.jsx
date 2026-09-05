import { useEffect, useState } from "react";
import { Plane, PlaneTakeoff, Gauge, Wind } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NAVY = "#1B365D";
const GOLD = "#C4A35A";

const ICONS = { plane: Plane, "plane-takeoff": PlaneTakeoff, gauge: Gauge, wind: Wind };

// Owner-selected photos that override the automatic inventory pick
const PINNED_PHOTOS = {
  baron: {
    url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/e573fcf7e_image.png",
    caption: "Beechcraft Baron",
    position: "72% 50%",
  },
};

// Static stand-in only for a model family not currently represented in inventory
const FALLBACK_PHOTOS = {
  twin: {
    url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/f6e4450ba_generated_image.png",
    caption: "Beechcraft Travel Air",
  },
};

// Skip listing-service photos that carry watermarks (base64-encoded filenames)
const isClean = (url) => {
  if (!url) return false;
  return !url.split("/").pop().includes("eyJ");
};

const MATCHERS = {
  kingair: (a) => /king\s?air|\b(c90|b200|b250|b300|b350)\b/i.test(a.model || ""),
  baron: (a) => /baron|b-?5[58]/i.test(a.model || ""),
  bonanza: (a) => /bonanza|a-?36|v-?35|f-?33|[jmg]35/i.test(a.model || ""),
  // A true "other Beech twin": multi-engine but not a King Air or Baron
  twin: (a) =>
    a.num_engines === "Multi-Engine" && !/king\s?air/i.test(a.model || "") && !/baron|b-?5[58]/i.test(a.model || ""),
};

function findPhoto(pool, key, usedIds) {
  const clean = pool.filter((a) => (a.images || []).some(isClean));
  const match = clean.find((a) => !usedIds.has(a.id) && MATCHERS[key] && MATCHERS[key](a));
  if (match) {
    usedIds.add(match.id);
    const url = (match.images || []).find(isClean);
    return { url, caption: `${match.year || ""} ${match.make} ${match.model}`.replace(/\s+/g, " ").trim() };
  }
  if (FALLBACK_PHOTOS[key]) return FALLBACK_PHOTOS[key];
  const chosen = clean.find((a) => !usedIds.has(a.id));
  if (!chosen) return null;
  usedIds.add(chosen.id);
  const url = (chosen.images || []).find(isClean);
  return { url, caption: `${chosen.year || ""} ${chosen.make} ${chosen.model}`.replace(/\s+/g, " ").trim() };
}

function ContentCell({ block }) {
  const Icon = ICONS[block.icon] || Plane;
  return (
    <div
      className="aspect-square flex flex-col items-center justify-center text-center px-6 sm:px-10 py-8"
      style={{ backgroundColor: NAVY }}
    >
      <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center mb-5">
        <Icon className="w-6 h-6" style={{ color: GOLD }} />
      </div>
      <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-[0.15em] text-white mb-1">
        {block.heading}
      </h3>
      <span className="block w-10 h-0.5 my-4" style={{ backgroundColor: GOLD }} />
      <p className="text-sm text-white/70 leading-relaxed max-w-xs">{block.text}</p>
    </div>
  );
}

function PhotoCell({ photo }) {
  return (
    <div className="relative aspect-square overflow-hidden bg-neutral-900">
      {photo?.url ? (
        <>
          <img
            src={photo.url}
            alt={photo.caption || "Subject aircraft"}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            style={photo.position ? { objectPosition: photo.position } : undefined}
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
          <p className="absolute bottom-3 left-4 right-4 text-xs font-semibold text-white/90">{photo.caption}</p>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Plane className="w-10 h-10 text-white/20" />
        </div>
      )}
    </div>
  );
}

export default function ModelsWeWork({ desk }) {
  const [photos, setPhotos] = useState(null);

  useEffect(() => {
    let alive = true;
    base44.functions
      .invoke("getPublicInventory", {})
      .then((res) => {
        if (!alive) return;
        const pool = (res.data.aircraft || []).filter(
          (a) => (a.make || "").toLowerCase() === desk.slug.toLowerCase()
        );
        const usedIds = new Set();
        const result = {};
        (desk.modelBlocks || []).forEach((b) => {
          result[b.photoKey] = PINNED_PHOTOS[b.photoKey] || findPhoto(pool, b.photoKey, usedIds);
        });
        setPhotos(result);
      })
      .catch(() => {
        if (alive) {
          const result = {};
          (desk.modelBlocks || []).forEach((b) => {
            result[b.photoKey] = FALLBACK_PHOTOS[b.photoKey] || null;
          });
          setPhotos(result);
        }
      });
    return () => {
      alive = false;
    };
  }, [desk]);

  // Checkerboard: photo boxes lead rows 1, content boxes lead row 2 (like the reference layout)
  const cells = [];
  (desk.modelBlocks || []).forEach((block, i) => {
    const photo = photos?.[block.photoKey];
    const content = <ContentCell key={`c-${i}`} block={block} />;
    const photoCell = <PhotoCell key={`p-${i}`} photo={photo} />;
    if (i < 2) cells.push(photoCell, content);
    else cells.push(content, photoCell);
  });

  return (
    <section className="bg-black w-full">
      <div className="pt-16 pb-10 px-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
          {desk.kicker}
        </p>
        <h2 className="font-display text-3xl font-black text-white">Models we work</h2>
      </div>

      {!photos ? (
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="aspect-square bg-neutral-900 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4">{cells}</div>
      )}

      {desk.outOfScope && (
        <p className="text-center text-xs text-white/40 py-6 px-4">{desk.outOfScope}</p>
      )}
    </section>
  );
}