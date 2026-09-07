import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const NAVY = "#0B3A66";
const GOLD = "#C4A35A";
const GROUND = "#F4F6F8";
const BODY = "#4A5560";

// Real desk photos we own. Swap these URLs when the five desk-*.jpg assets arrive.
const SATELLITES = [
  {
    monogram: "CB",
    heading: "Cessna Buyers",
    subhead: "172–210 · twins · cabin class",
    body: "SID programs and gear-door play decide the price.",
    slug: "cessna",
    image: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/b2351df04_Cessna-1024x610.webp",
    alt: "Cessna high-wing strut and cowling on the ramp",
  },
  {
    monogram: "PB",
    heading: "Piper Buyers",
    subhead: "Cherokee through M-Class · PA-46",
    body: "A PA-28 spar conversation is not a Meridian engine program.",
    slug: "piper",
    image: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/6c16a9484_image.png",
    alt: "Piper Comanche on the ramp",
  },
  {
    monogram: "MB",
    heading: "Meyers Buyers",
    subhead: "200 series · scarce MAC serials",
    body: "Thin comps. Parts are tribal. Serials matter.",
    slug: "meyers",
    image: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/f0ae29118_IMG_4926.jpeg",
    alt: "Meyers 200 series nose and spinner",
  },
  {
    monogram: "VA",
    heading: "Vintage Aircraft",
    subhead: "Rag-and-tube · early metal · orphans",
    body: "Provenance is the product. A pretty restore can still be a bad story.",
    slug: "vintage",
    image: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/5a95d7b61_8b53a4f1b_IMG_4852.jpg",
    alt: "Vintage fabric wing rib and roundel",
  },
];

function Monogram({ letters, dark }) {
  return (
    <span
      className="inline-flex items-center justify-center font-black tracking-widest text-xs px-2 py-1 border rounded-sm"
      style={
        dark
          ? { color: "#FFFFFF", borderColor: "rgba(255,255,255,0.35)" }
          : { color: NAVY, borderColor: "rgba(11,58,102,0.35)" }
      }
    >
      {letters}
    </span>
  );
}

export default function HouseDesksIndex({ headingLevel = "h2" }) {
  const navigate = useNavigate();
  const Heading = headingLevel;

  return (
    <section className="py-20 px-4" style={{ backgroundColor: GROUND }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
            Specialty desks
          </p>
          <Heading className="text-3xl md:text-4xl font-black mb-4" style={{ color: NAVY }}>
            Five practices. One firm on your side of the table.
          </Heading>
          <p className="text-base leading-relaxed" style={{ color: BODY }}>
            Come in by type. The engagement is still ClearBlue Aero.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Featured house brand: Beechcraft Buyers */}
          <div
            role="link"
            tabIndex={0}
            onClick={() => navigate("/beechcraft")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/beechcraft")}
            className="lg:row-span-2 flex flex-col rounded-md p-8 cursor-pointer text-center lg:text-left"
            style={{ backgroundColor: NAVY, borderTop: `4px solid ${GOLD}` }}
          >
            <Monogram letters="BB" dark />
            <h3 className="text-2xl font-black text-white mt-6 mb-1">Beechcraft Buyers</h3>
            <p className="text-sm font-semibold mb-4" style={{ color: GOLD }}>
              Bonanza · Baron · King Air
            </p>
            <p className="text-sm leading-relaxed text-white/70 mb-8">
              Spar programs, IO-550 files, and the difference between a clean A36 and a project.
            </p>
            <div className="mt-auto">
              <Link
                to="/beechcraft"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded font-bold text-sm hover:brightness-110 transition-all"
                style={{ backgroundColor: GOLD, color: NAVY }}
              >
                Start a Bonanza search <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="mt-4">
                <Link
                  to="/sell"
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-semibold text-white/80 hover:text-white underline underline-offset-4 decoration-white/40"
                >
                  List a Beechcraft
                </Link>
              </div>
            </div>
          </div>

          {/* Satellites: Cessna, Piper, Meyers, Vintage */}
          {SATELLITES.map((s) => (
            <Link
              key={s.slug}
              to={`/${s.slug}`}
              className="block bg-white rounded-md overflow-hidden border border-[#0B3A66]/20 hover:border-2 hover:border-[#0B3A66] hover:-translate-y-0.5 transition-all"
            >
              <div className="aspect-video overflow-hidden" style={{ backgroundColor: NAVY }}>
                <img
                  src={s.image}
                  alt={s.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <Monogram letters={s.monogram} />
                <h3 className="text-lg font-black mt-3 mb-0.5" style={{ color: NAVY }}>
                  {s.heading}
                </h3>
                <p className="text-xs font-semibold mb-2" style={{ color: GOLD }}>
                  {s.subhead}
                </p>
                <p className="text-sm leading-relaxed mb-4" style={{ color: BODY }}>
                  {s.body}
                </p>
                <span className="text-sm font-semibold underline underline-offset-4" style={{ color: NAVY }}>
                  Open this desk
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}