const NAVY = "#1B365D";
const GOLD = "#C4A35A";

const HERO_BG =
  "url('https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1a1c1912a_image.png')";

export default function BuyerRepresentationHero({ desk }) {
  const slug = desk?.slug || "beechcraft";
  const isBeechcraft = slug === "beechcraft";
  const makeLabel = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <section
      className="relative py-24 px-4 bg-cover bg-center"
      style={{
        backgroundImage: isBeechcraft ? HERO_BG : undefined,
        backgroundColor: NAVY,
      }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(16,26,43,0.65)" }} />
      <div className="relative max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
          Buyer Representation
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-5">
          Buy the Right {makeLabel}. The First Time.
        </h2>
        <p className="text-white/70 text-base leading-relaxed mb-4">
          {isBeechcraft
            ? "Buying a Bonanza or Baron is a major investment. The challenge isn't finding airplanes for sale. It's knowing which aircraft are worth pursuing, what they are really worth, and what you may be getting into after the purchase."
            : "Buying an aircraft is a major investment. The challenge isn't finding airplanes for sale. It's knowing which aircraft are worth pursuing, what they are really worth, and what you may be getting into after the purchase."}
        </p>
        <p className="text-white text-base font-semibold leading-relaxed">
          {desk?.name || "ClearBlue Aero"} represents you, the buyer, throughout the acquisition process.
        </p>
      </div>
    </section>
  );
}