const GOLD = "#C4A35A";

const HERO_BG =
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1a1c1912a_image.png";

export default function BuyerRepresentationHero() {
  return (
    <section className="relative py-24 px-4">
      <img
        src={HERO_BG}
        alt="Beechcraft Baron flying above the clouds at sunset"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-[#1B365D]/70" />
      <div className="relative max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
          Buyer Representation
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-5">
          Buy the Right Beechcraft. The First Time.
        </h2>
        <p className="text-white/80 text-base leading-relaxed mb-4">
          Buying a Bonanza or Baron is a major investment. The challenge isn't finding airplanes for sale. It's knowing which aircraft are worth pursuing, what they are really worth, and what you may be getting into after the purchase.
        </p>
        <p className="text-white text-base font-semibold leading-relaxed">
          Beechcraft Buyers represents you, the buyer, throughout the acquisition process.
        </p>
      </div>
    </section>
  );
}