import { Link } from "react-router-dom";
import { ArrowRight, DollarSign, Search, Handshake, FileText, Phone, AlertTriangle, MapPin, Scale } from "lucide-react";
import ValuationForm from "@/components/public/ValuationForm";
import useSeo from "@/hooks/useSeo";

const NAVY = "#00447f";
const GOLD = "#C9A84C";
const COCKPIT_IMAGE = "https://images.unsplash.com/photo-1569939012617-bd8f156b934a?w=1600&q=80&auto=format&fit=crop";

const steps = [
  { icon: FileText, num: "01", title: "Conversation and value", desc: "Directional value on a call. No listing agreement yet. Bring year, model, total time, engine time, and whether the logs are complete." },
  { icon: Search, num: "02", title: "Prepare the file", desc: "Photos, spec sheet, log gaps named in plain language, AD status, and damage history stated once and correctly." },
  { icon: DollarSign, num: "03", title: "List and screen", desc: "Your site, Controller, Trade-A-Plane, and type-appropriate channels. We qualify funds, mission, and timeline before a showing." },
  { icon: Handshake, num: "04", title: "Offer to close", desc: "Negotiation, independent prebuy, discrepancies, title and escrow, ferry or pickup. We stay on the file after the accepted offer." },
];

const killers = [
  "Hope-pricing against last year\u2019s sold that had a fresh engine",
  "Phone photos and no spec sheet",
  "Logbooks that arrive as a surprise at prebuy",
  "Listing on one marketplace and nowhere else",
  "Owner taking every call, including the ones that will never close",
];

const faqs = [
  { q: "How long does a sale take?", a: "Accepted offer to close is usually weeks, driven by the prebuy shop more than the broker. Calendar time before an offer depends on price and how complete the file is." },
  { q: "Do I have to bring the airplane to EVB?", a: "No. We list and show where the airplane lives. New Smyrna Beach (EVB) is the operating base, not a requirement." },
  { q: "Can I keep flying it while it is listed?", a: "Usually yes, if insurance and the listing plan allow it. Hours added during the listing are disclosed." },
  { q: "What do you need for a first value?", a: "Year, model, total time, engine and prop time, avionics generation, damage history if any, and whether logs are complete." },
];

export default function PublicSellYourPlane() {
  useSeo({
    title: "Sell Your Aircraft | Florida Brokerage | ClearBlue Aero",
    description: "List with a Florida broker who prices to the market, screens buyers, and runs the sale through closing. Piston, complex, vintage, and estate airframes.",
    path: "/sell",
  });

  return (
    <div className=\"bg-white w-full\">
      <p>See repo artifacts if this escapes wrong</p>
    </div>
  );
}
