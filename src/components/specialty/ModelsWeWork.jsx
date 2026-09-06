import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plane, ArrowLeft, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NAVY = "#1B365D";
const GOLD = "#C4A35A";

// Owner-selected photos that override the automatic inventory pick
const PINNED_PHOTOS = {
  baron: {
    url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/e573fcf7e_image.png",
    caption: "Beechcraft Baron",
    position: "72% 50%",
  },
  kingair: {
    url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/ce736ca2b_image.png",
    caption: "Beechcraft King Air 200",
  },
  twin: {
    url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/b47c2db14_image.png",
    caption: "Beech A36 cockpit",
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
  // Cirrus
  sr20: (a) => /sr\s?20/i.test(a.model || ""),
  sr22: (a) => /sr\s?22(?!t)/i.test(a.model || ""),
  sr22t: (a) => /sr\s?22t/i.test(a.model || ""),
  vision: (a) => /vision|sf-?50/i.test(a.model || ""),
  // Cessna
  c172: (a) => /172/i.test(a.model || ""),
  c182: (a) => /182/i.test(a.model || ""),
  c206: (a) => /206/i.test(a.model || ""),
  c210: (a) => /210/i.test(a.model || ""),
  cessnatwin: (a) => a.num_engines === "Multi-Engine" && /310|340|337/i.test(a.model || ""),
  cabin: (a) => /(402|414|421|p210)/i.test(a.model || ""),
  // Piper
  pa28: (a) => /pa-?28|cherokee|archer|arrow|dakota|warrior/i.test(a.model || ""),
  pa32: (a) => /pa-?32|saratoga|cherokee six|6x/i.test(a.model || ""),
  pa44: (a) => /pa-?44|seminole/i.test(a.model || ""),
  pa46: (a) => /pa-?46|malibu|mirage|matrix|m350|m500|m600|meridian/i.test(a.model || ""),
  // Meyers
  meyers200: (a) => /200/i.test(a.model || ""),
  mac: (a) => true,
  // Vintage
  rag: (a) => /stinson|waco|taylorcraft|j-?3|cub|champ|swift/i.test(`${a.make || ""} ${a.model || ""}`),
  metal: (a) => /navion|mooney|luscombe|er coupe|ercoupe/i.test(`${a.make || ""} ${a.model || ""}`),
  warbird: (a) => true,
  orphan: (a) => true,
};

function findPhoto(pool, key, usedIds, deskKeys) {
  const clean = pool.filter((a) => (a.images || []).some(isClean));
  const match = clean.find((a) => !usedIds.has(a.id) && MATCHERS[key] && MATCHERS[key](a));
  if (match) {
    usedIds.add(match.id);
    const url = (match.images || []).find(isClean);
    return { url, caption: `${match.year || ""} ${match.make} ${match.model}`.replace(/\s+/g, " ").trim() };
  }
  if (FALLBACK_PHOTOS[key]) return FALLBACK_PHOTOS[key];
  // When a block has no inventory match, prefer an aircraft no other block on
  // this desk is looking for, so fallbacks never steal a block's own subject.
  const deskMatchers = deskKeys.map((k) => MATCHERS[k]).filter(Boolean);
  const chosen =
    clean.find((a) => !usedIds.has(a.id) && !deskMatchers.some((m) => m(a))) ||
    clean.find((a) => !usedIds.has(a.id));
  if (!chosen) return null;
  usedIds.add(chosen.id);
  const url = (chosen.images || []).find(isClean);
  return { url, caption: `${chosen.year || ""} ${chosen.make} ${chosen.model}`.replace(/\s+/g, " ").trim() };
}

function ContentCell({ block, arrow, wide }) {
  const Icon = arrow === "left" ? ArrowLeft : ArrowRight;
  return (
    <div
      className={`${wide ? "col-span-2" : "aspect-square"} overflow-hidden flex flex-col items-center justify-center text-center px-6 sm:px-10 py-8`}
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
    <div className="group relative aspect-square overflow-hidden bg-neutral-900">
      {photo?.url ? (
        <>
          <img
            src={photo.url}
            alt={photo.caption || "Subject aircraft"}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            style={photo.position ? { objectPosition: photo.position } : undefined}
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500"
            style={{ backgroundColor: NAVY }}
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

function LogoCell({ url }) {
  return (
    <div
      className="aspect-square flex items-center justify-center"
      style={{ backgroundColor: NAVY }}
    >
      <img src={url} alt="Cessna logo" loading="lazy" decoding="async" className="w-3/5 object-contain" />
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
        const all = res.data.aircraft || [];
        const slug = desk.slug.toLowerCase();
        // Vintage is an era, not a make: draw photos from the whole pool
        const pool =
          slug === "vintage" ? all : all.filter((a) => (a.make || "").toLowerCase() === slug);
        const usedIds = new Set();
        const deskKeys = (desk.modelBlocks || []).map((b) => b.photoKey).filter(Boolean);
        const result = {};
        (desk.modelBlocks || []).forEach((b) => {
          if (!b.photoKey) return;
          result[b.photoKey] = PINNED_PHOTOS[b.photoKey] || findPhoto(pool, b.photoKey, usedIds, deskKeys);
        });
        setPhotos(result);
      })
      .catch(() => {
        if (alive) {
          const result = {};
          (desk.modelBlocks || []).forEach((b) => {
            if (!b.photoKey) return;
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
    const reveal = (key, child, order) => (
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, delay: order * 0.1, ease: "easeOut" }}
      >
        {child}
      </motion.div>
    );
    if (block.logo) {
      cells.push(reveal(`l-${i}`, <LogoCell url={block.logo} />, i));
      return;
    }
    const photoFirst = block.photoFirst ?? i % 4 < 2;
    const content = reveal(
      `c-${i}`,
      <ContentCell
        block={block}
        arrow={block.arrow || (photoFirst ? "left" : "right")}
        wide={block.span === 2}
      />,
      i
    );
    if (block.hidePhoto) {
      cells.push(content);
      return;
    }
    const photoCell = reveal(`p-${i}`, <PhotoCell photo={photo} />, i);
    if (block.photoOnly) {
      cells.push(photoCell);
      return;
    }
    if (photoFirst) cells.push(photoCell, content);
    else cells.push(content, photoCell);
  });

  // Cessna carries six model families: smaller squares so the grid stays on screen
  const gridClass =
    desk.slug === "cessna"
      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
      : "grid grid-cols-2 lg:grid-cols-4";

  return (
    <section className="bg-black w-full">
      <div className="pt-16 pb-10 px-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
          {desk.kicker}
        </p>
        <h2 className="font-display text-3xl font-black text-white">Models we work</h2>
      </div>

      {!photos ? (
        <div className={gridClass}>
          {Array.from({
            length: (desk.modelBlocks || []).reduce(
              (n, b) => n + (b.logo || b.photoOnly ? 1 : b.hidePhoto ? b.span || 1 : 2),
              0
            ),
          }).map((_, i) => (
            <div key={i} className="aspect-square bg-neutral-900 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className={gridClass}>{cells}</div>
      )}

    </section>
  );
}