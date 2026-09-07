import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const NAVY = "#0B3A66";
const GOLD = "#C4A35A";
const BODY = "#4A5560";
const GROUND = "#F4F6F8";

const BEECHCRAFT_PHOTO = "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/e573fcf7e_image.png";

const SATELLITES = [
  {
    slug: "cessna",
    name: "Cessna Buyers",
    monogram: "CB",
    subhead: "172–210 · twins · cabin class",
    body: "SID programs and gear-door play decide the price.",
    photo: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/b2351df04_Cessna-1024x610.webp",
    alt: "Cessna high-wing on the ramp",
  },
  {
    slug: "piper",
    name: "Piper Buyers",
    monogram: "PB",
    subhead: "Cherokee through M-Class · PA-46",
    body: "A PA-28 spar conversation is not a Meridian engine program.",
    photo: "https://base44.app/api/apps/69c80400f629e8d863dc8b6c/files/mp/public/69c80400f629e8d863dc8b6c/c558e43f6_ffcfb1cc9_2001PiperArcherIII-1.png",
    alt: "Piper Archer III on the ramp",
  },
  {
    slug: "meyers",
    name: "Meyers Buyers",
    monogram: "MB",
    subhead: "200 series · scarce MAC serials",
    body: "Thin comps. Parts are tribal. Serials matter.",
    photo: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/f0ae29118_IMG_4926.jpeg",
    alt: "Meyers 200 series nose and spinner",
  },
  {
    slug: "vintage",
    name: "Vintage Aircraft",
    monogram: "VA",
    subhead: "Rag-and-tube · early metal · orphans",
    body: "Provenance is the product. A pretty restore can still be a bad story.",
    photo: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/5a95d7b61_8b53a4f1b_IMG_4852.jpg",
    alt: "Vintage fabric wing and roundel",
  },
];

function Monogram({ letters, dark }) {
  return (
    <div
      className="w-14 h-14 border-2 flex items-center justify-center font-black text-lg tracking-wide"
      style={{ borderColor: dark ? GOLD : NAVY, color: dark ? GOLD : NAVY }}
    >
      {letters}
    </div>
  );
}

function BeechcraftPanel() {
  return (
    <div
      className="relative rounded-md overflow-hidden flex flex-col text-white p-8 lg:p-10"
      style={{ backgroundColor: NAVY }}
    >
      <span className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: GOLD }} />
      <Monogram letters="BB" dark />
      <h3 className="text-2xl font-black mt-6 mb-2">Beechcraft Buyers</h3>
      <p className="text-sm font-bold mb-4" style={{ color: GOLD }}>
        Bonanza · Baron · King Air
      </p>
      <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-md">
        Spar programs, IO-550 files, and the difference between a clean A36 and a project.
      </p>
      <div className="aspect-video w-full max-w-md rounded overflow-hidden mb-8">
        <img src={BEECHCRAFT_PHOTO} alt="Beechcraft Baron on the ramp" loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="mt-auto space-y-4">
        <Link
          to="/beechcraft"
          className="inline-flex items-center gap-2 px-6 py-3 rounded font-bold text-sm hover:brightness-110 transition-all"
          style={{ backgroundColor: GOLD, color: NAVY }}
        >
          Start a Bonanza search <ArrowRight className="w-4 h-4" />
        </Link>
        <div>
          <Link to="/sell" className="text-sm font-semibold underline underline-offset-4 hover:opacity-80" style={{ color: GOLD }}>
            List a Beechcraft
          </Link>
        </div>
      </div>
    </div>
  );
}

function SatelliteCard({ desk }) {
  return (
    <Link
      to={`/${desk.slug}`}
      className="group flex flex-col bg-white rounded-md p-5 border border-[rgba(11,58,102,0.2)] hover:border-2 hover:border-[#0B3A66] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="aspect-video w-full rounded overflow-hidden mb-4" style={{ backgroundColor: GROUND }}>
        <img
          src={desk.photo}
          alt={desk.alt}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div
        className="w-11 h-11 border-2 flex items-center justify-center font-black text-base tracking-wide mb-3"
        style={{ borderColor: NAVY, color: NAVY }}
      >
        {desk.monogram}
      </div>
      <h3 className="text-lg font-black mb-1" style={{ color: NAVY }}>
        {desk.name}
      </h3>
      <p className="text-xs font-bold tracking-wide mb-2" style={{ color: GOLD }}>
        {desk.subhead}
      </p>
      <p className="text-sm leading-relaxed mb-4" style={{ color: BODY }}>
        {desk.body}
      </p>
      <span className="mt-auto text-sm font-bold underline underline-offset-4" style={{ color: NAVY }}>
        Open this desk
      </span>
    </Link>
  );
}

export default function BuyerSpecialtyDesks({ includeHeader = true }) {
  return (
    <section className="py-20" style={{ backgroundColor: GROUND }}>
      <div className="max-w-7xl mx-auto px-4">
        {includeHeader && (
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
              Specialty desks
            </p>
            <h2 className="text-3xl md:text-4xl font-black mb-5" style={{ color: NAVY }}>
              Five practices. One firm on your side of the table.
            </h2>
            <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: BODY }}>
              Come in by type. The engagement is still ClearBlue Aero.
            </p>
          </div>
        )}
        <div className="grid gap-6 items-stretch lg:grid-cols-[1.15fr_1fr]">
          <BeechcraftPanel />
          <div className="grid sm:grid-cols-2 gap-6">
            {SATELLITES.map((desk) => (
              <SatelliteCard key={desk.slug} desk={desk} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}