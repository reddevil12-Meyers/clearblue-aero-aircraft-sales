import { Search, FileSearch, LineChart, Handshake, Wrench, ClipboardCheck } from "lucide-react";

const NAVY = "#1B365D";
const GOLD = "#C4A35A";
const LIGHT = "#E8EEF5";
const SLATE = "#334155";

const SERVICES = (slug) => [
  {
    icon: Search,
    title: "Aircraft Search",
    text:
      slug === "beechcraft"
        ? "We identify Bonanzas, Barons, and other Beechcraft that fit your mission, budget, specifications, and ownership goals."
        : "We identify aircraft that fit your mission, budget, specifications, and ownership goals.",
  },
  {
    icon: FileSearch,
    title: "Aircraft Evaluation",
    text: "We evaluate available information, maintenance history, equipment, records, ownership history, and known issues to determine whether an aircraft deserves a closer look.",
  },
  {
    icon: LineChart,
    title: "Market Value Analysis",
    text: "We use current market data and aircraft-specific factors to determine what an aircraft is actually worth, not simply what the seller is asking.",
  },
  {
    icon: Handshake,
    title: "Negotiation",
    text: "We help negotiate purchase price and transaction terms based on the aircraft's condition, history, equipment, and market position.",
  },
  {
    icon: Wrench,
    title: "Pre-Purchase Inspection",
    text: "We coordinate the pre-purchase inspection and work with qualified aviation professionals to identify issues that could affect the purchase decision.",
  },
  {
    icon: ClipboardCheck,
    title: "Transaction Management",
    text: "From offer through closing, we help coordinate the buyer, seller, maintenance facility, escrow, title, insurance, and other parties involved in the transaction.",
  },
];

export default function BuyerServices({ desk }) {
  return (
    <section className="py-16 px-4" style={{ backgroundColor: LIGHT }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-widest mb-2 text-center" style={{ color: GOLD }}>
          Buyer Services
        </p>
        <h2 className="text-3xl font-black mb-12 text-center" style={{ color: NAVY }}>
          What We Do
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES(desk?.slug).map((service) => (
            <div key={service.title} className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center mb-5">
                <service.icon className="w-6 h-6" style={{ color: GOLD }} />
              </div>
              <h3 className="font-display text-lg font-bold mb-3" style={{ color: NAVY }}>
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: SLATE }}>
                {service.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}