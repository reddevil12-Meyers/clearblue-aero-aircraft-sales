import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const NAVY = "#00447f";
const GOLD = "#C9A84C";

const BEECHCRAFT_PHOTO = "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/e573fcf7e_image.png";

const SATELLITES = [
  {
    slug: "cessna",
    name: "Cessna Buyers",
    monogram: "CB",
    blurb: "172 through 210, twins, and the cabin class.",
    photo: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/b2351df04_Cessna-1024x610.webp",
    alt: "Cessna single-engine aircraft",
  },
  {
    slug: "piper",
    name: "Piper Buyers",
    monogram: "PB",
    blurb: "Cherokee through M-class, twins, and the PA-46 line.",
    photo: "https://base44.app/api/apps/69c80400f629e8d863dc8b6c/files/mp/public/69c80400f629e8d863dc8b6c/c558e43f6_ffcfb1cc9_2001PiperArcherIII-1.png",
    alt: "Piper Archer III",
  },
  {
    slug: "meyers",
    name: "Meyers Buyers",
    monogram: "MB",
    blurb: "Meyers 200 series and scarce MAC airframes.",
    photo: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/f0ae29118_IMG_4926.jpeg",
    alt: "1964 Meyers 200C",
  },
  {
    slug: "vintage",
    name: "Vintage Aircraft",
    monogram: "VA",
    blurb: "Rag-and-tube, early metal, warbird-adjacent, and orphan types.",
    photo: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/5a95d7b61_8b53a4f1b_IMG_4852.jpg",
    alt: "1932 Waco UBF-2",
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
      className="relative rounded-2xl overflow-hidden flex flex-col text-white p-8 lg:p-10"
      style={{ backgroundColor: NAVY }}
    >
      <span className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: GOLD }} />
      <Monogram letters="BB" dark />
      <h3 className="text-2xl font-black mt-6 mb-2">Beechcraft Buyers</h3>
      <p className="text-sm font-bold mb-4" style={{ color: GOLD }}>
        Bonanza, Baron, King Air.
      </p>
      <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-md">
        Buyer representation and brokerage for the Bonanza, Baron, and King Air lines. Same firm, same expertise, different attention.
      </p>
      <div className="aspect-video w-full max-w-md rounded-lg overflow-hidden mb-8">
        <img src={BEECHCRAFT_PHOTO} alt="Beechcraft Baron" loading="lazy" className="w-full h-full object-cover" />
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
      className="group flex flex-col bg-white rounded-2xl p-6 border border-gray-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <Monogram letters={desk.monogram} />
      <h3 className="text-lg font-black mt-4 mb-3" style={{ color: NAVY }}>
        {desk.name}
      </h3>
      <div className="aspect-video w-full rounded-lg overflow-hidden mb-4 bg-[#eef1f5]">
        <img
          src={desk.photo}
          alt={desk.alt}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p className="text-gray-500 text-sm leading-relaxed mb-4">{desk.blurb}</p>
      <span className="mt-auto text-sm font-bold underline underline-offset-4" style={{ color: NAVY }}>
        Open this desk
      </span>
    </Link>
  );
}

export default function BuyerSpecialtyDesks() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#f5f6f8] to-[#eef1f5]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-3">Specialty desks</p>
          <h2 className="text-3xl md:text-4xl font-black mb-5" style={{ color: NAVY }}>
            Five practices. One firm on your side of the table.
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
            Come in by type. The engagement is still ClearBlue Aero.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
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