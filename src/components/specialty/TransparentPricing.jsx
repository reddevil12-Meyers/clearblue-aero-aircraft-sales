const NAVY = "#1B365D";
const GOLD = "#C4A35A";
const LIGHT = "#E8EEF5";
const SLATE = "#334155";

const FEE_TIERS = [
  { price: "Under $100,000", fee: "$6,000 minimum" },
  { price: "$100,000 to $199,999", fee: "7%" },
  { price: "$200,000 to $399,999", fee: "6%" },
  { price: "$400,000 to $749,999", fee: "5%" },
  { price: "$750,000 to $1,499,999", fee: "4%" },
  { price: "$1,500,000 to $2,999,999", fee: "3%" },
  { price: "$3,000,000 and above", fee: "2.5%, subject to engagement terms" },
];

export default function TransparentPricing() {
  return (
    <section className="py-16 px-4" style={{ backgroundColor: LIGHT }}>
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-widest mb-2 text-center" style={{ color: GOLD }}>
          Transparent Pricing
        </p>
        <h2 className="text-3xl font-black mb-4 text-center" style={{ color: NAVY }}>
          Our Buyer Consulting Fee
        </h2>
        <p className="text-sm leading-relaxed text-center mb-2" style={{ color: SLATE }}>
          Our goal is to make our compensation straightforward and transparent.
        </p>
        <p className="text-sm leading-relaxed text-center mb-10" style={{ color: SLATE }}>
          Buyer acquisition fees are based on the purchase price of the aircraft.
        </p>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-2 text-xs font-bold uppercase tracking-wider px-6 py-3" style={{ backgroundColor: NAVY }}>
            <span className="text-white">Aircraft Purchase Price</span>
            <span className="text-white text-right">Buyer Acquisition Fee</span>
          </div>
          {FEE_TIERS.map((tier, i) => (
            <div
              key={tier.price}
              className="grid grid-cols-2 px-6 py-3.5 text-sm"
              style={{ backgroundColor: i % 2 === 1 ? "#F6F9FC" : "#FFFFFF" }}
            >
              <span className="font-semibold" style={{ color: NAVY }}>{tier.price}</span>
              <span className="text-right font-bold" style={{ color: SLATE }}>{tier.fee}</span>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-center mt-6" style={{ color: SLATE }}>
          The applicable fee is established in the buyer consulting agreement before we begin the acquisition process.
        </p>
      </div>
    </section>
  );
}