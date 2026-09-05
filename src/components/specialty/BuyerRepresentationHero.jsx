const NAVY = "#1B365D";
const GOLD = "#C4A35A";

export default function BuyerRepresentationHero() {
  return (
    <section className="py-16 px-4" style={{ backgroundColor: NAVY }}>
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
          Buyer Representation
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-5">
          Buy the Right Beechcraft. The First Time.
        </h2>
        <p className="text-white/70 text-base leading-relaxed mb-4">
          Buying a Bonanza or Baron is a major investment. The challenge isn't finding airplanes for sale. It's knowing which aircraft are worth pursuing, what they are really worth, and what you may be getting into after the purchase.
        </p>
        <p className="text-white text-base font-semibold leading-relaxed">
          Beechcraft Buyers represents you, the buyer, throughout the acquisition process.
        </p>
      </div>
    </section>
  );
}