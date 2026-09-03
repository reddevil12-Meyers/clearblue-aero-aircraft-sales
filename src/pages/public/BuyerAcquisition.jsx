import { Link } from "react-router-dom";
import { Phone, ArrowRight, CheckCircle } from "lucide-react";
import useSeo from "@/hooks/useSeo";

const processSteps = [
  {
    num: 1,
    title: "Define Your Mission",
    paras: [
      "We start by understanding how you intend to use the aircraft, your experience level, operating requirements, budget, preferred aircraft types, geographic considerations, and ownership objectives.",
      "The goal is to identify the aircraft that fits your mission, not simply the aircraft that is currently available.",
    ],
  },
  {
    num: 2,
    title: "Market Search",
    paras: [
      "We search the market for suitable aircraft, including publicly listed aircraft and qualified opportunities that may not be prominently advertised.",
      "We evaluate potential candidates based on specifications, history, equipment, condition, asking price, location, and available records.",
    ],
  },
  {
    num: 3,
    title: "Aircraft Evaluation",
    paras: [
      "Once a candidate is identified, we help determine whether it deserves further consideration.",
      "Our evaluation may include aircraft specifications, maintenance history, logbooks, damage history, ownership history, engine and propeller time, avionics, modifications, AD compliance, recurring inspections, and known or anticipated maintenance requirements.",
    ],
  },
  {
    num: 4,
    title: "Market and Purchase Analysis",
    paras: [
      "An asking price is not necessarily a market value.",
      "We analyze the aircraft against comparable aircraft and its individual condition and equipment to help establish a reasonable purchase range. When appropriate, we identify items that should be addressed in negotiations.",
    ],
  },
  {
    num: 5,
    title: "Offer and Negotiation",
    paras: [
      "ClearBlue Aero can assist with the preparation and negotiation of the purchase offer.",
      "Our objective is not simply to get the seller to accept an offer. It is to help you structure a transaction that appropriately reflects the aircraft's condition, records, equipment, market position, and anticipated expenses.",
    ],
  },
  {
    num: 6,
    title: "Pre-Purchase Inspection",
    paras: [
      "The pre-purchase inspection is one of the most important steps in an aircraft acquisition.",
      "We help coordinate the inspection process and can assist with identifying appropriate inspection facilities and qualified aviation professionals. We do not substitute our judgment for that of a properly qualified mechanic or inspector. Instead, we help make sure the inspection process addresses the aircraft and the transaction appropriately.",
    ],
  },
  {
    num: 7,
    title: "Records and Due Diligence",
    paras: [
      "Aircraft records tell a story.",
      "We help organize and evaluate available aircraft records, including maintenance documentation, logbooks, AD compliance, major repairs, alterations, engine and propeller history, and other relevant documentation. When discrepancies or unanswered questions arise, we work with the appropriate aviation professionals to determine what additional information is required.",
    ],
  },
  {
    num: 8,
    title: "Transaction Management",
    paras: [
      "Once the aircraft has been selected, ClearBlue Aero helps coordinate the remaining steps toward closing.",
      "This may include communication between the buyer, seller, maintenance facility, escrow provider, title and registration professionals, insurance representatives, and other parties involved in the transaction. Our objective is a controlled, documented process with fewer surprises.",
    ],
  },
  {
    num: 9,
    title: "Closing and Delivery",
    paras: [
      "We help coordinate the final transaction requirements and delivery of the aircraft.",
      "The result should be more than simply buying an airplane. It should be taking ownership with a clear understanding of what you purchased and why.",
    ],
  },
];

const helpItems = [
  "Identify aircraft that fit your mission",
  "Evaluate aircraft before committing to a purchase",
  "Understand the significance of maintenance and ownership history",
  "Establish a reasonable purchase range",
  "Negotiate price and transaction terms",
  "Coordinate the pre-purchase inspection",
  "Identify questions that require further investigation",
  "Coordinate the professionals involved in the transaction",
  "Reduce avoidable surprises before closing",
  "Move from aircraft search to ownership with a structured process",
];

const honestyPoints = [
  "If it isn't, we will tell you.",
  "If the price doesn't make sense, we will tell you.",
  "If the records raise questions, we will identify them.",
  "If the aircraft survives the evaluation, we help you move forward with confidence.",
];

export default function PublicBuyerAcquisition() {
  useSeo({
    title: "Aircraft Buyer Acquisition Services — ClearBlue Aero",
    description: "ClearBlue Aero represents aircraft buyers from search and evaluation through negotiation, pre-purchase inspection, due diligence, and closing. We work for you, not the seller.",
    path: "/buyer-acquisition",
  });

  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <div className="bg-[#00447f] py-24 px-4 text-center">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Buyer Acquisition Services</p>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-5">
          The Right Aircraft. The Right Price. The Right Process.
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
          Buying an aircraft is a significant investment. Finding an aircraft is only the beginning.
        </p>
        <p className="text-white/50 text-base max-w-2xl mx-auto leading-relaxed mt-5">
          ClearBlue Aero represents buyers throughout the aircraft acquisition process, from defining the right aircraft and identifying qualified candidates to negotiating the purchase, coordinating the pre-purchase inspection, reviewing records, and helping bring the transaction to closing.
        </p>
        <p className="text-[#C9A84C] text-lg font-bold mt-6">Our role is simple. We work for you, not the seller.</p>
      </div>

      {/* A Better Way to Buy */}
      <section className="py-20 bg-[#f5f6f8]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Why It Matters</p>
          <h2 className="text-4xl font-black text-[#00447f] mb-8">A Better Way to Buy an Aircraft</h2>
          <div className="space-y-5 text-gray-600 text-base leading-relaxed text-left">
            <p>The aircraft that looks best in an advertisement is not necessarily the aircraft that makes the best purchase.</p>
            <p>Aircraft condition, maintenance history, ownership history, damage history, engine and propeller status, avionics, modifications, logbooks, market value, and upcoming maintenance can materially affect what an aircraft is actually worth.</p>
            <p className="font-semibold text-[#00447f]">ClearBlue Aero helps you evaluate the entire picture before you commit your money.</p>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Step by Step</p>
            <h2 className="text-4xl font-black text-[#00447f]">Our Acquisition Process</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processSteps.map(({ num, title, paras }) => (
              <div key={num} className="bg-[#f5f6f8] rounded-2xl p-7 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: '#00447f' }}>
                  <span className="text-lg font-black text-[#C9A84C]">{num}</span>
                </div>
                <h3 className="text-lg font-black text-[#00447f] mb-3">{title}</h3>
                {paras.map((p, i) => (
                  <p key={i} className="text-gray-500 text-sm leading-relaxed mb-2 last:mb-0">{p}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Use a Buyer Representative */}
      <section className="py-20 bg-[#f5f6f8]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">On Your Side</p>
            <h2 className="text-4xl font-black text-[#00447f] mb-6">Why Use a Buyer Representative?</h2>
            <p className="text-gray-600 text-base max-w-3xl mx-auto leading-relaxed">
              Aircraft transactions can create conflicts of interest when the person presenting an aircraft to you is compensated by the seller.
            </p>
            <p className="text-gray-600 text-base max-w-3xl mx-auto leading-relaxed mt-4">
              ClearBlue Aero's buyer acquisition service is designed around the buyer's interests. We help you:
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-14">
            {helpItems.map(item => (
              <div key={item} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100">
                <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#00447f' }} />
                <span className="text-gray-600 text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* Honesty block */}
          <div className="bg-[#00447f] rounded-2xl p-10 md:p-14 text-center">
            <h3 className="text-2xl md:text-3xl font-black text-white mb-8">We Don't Sell You an Airplane. We Help You Buy the Right One.</h3>
            <p className="text-white/60 text-base max-w-2xl mx-auto leading-relaxed mb-8">
              Our objective is not to convince you that a particular aircraft is the right aircraft. Our objective is to determine whether the aircraft is right for you.
            </p>
            <div className="space-y-3 max-w-xl mx-auto">
              {honestyPoints.map(point => (
                <p key={point} className="text-[#C9A84C] font-semibold text-base">{point}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fees */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Engagement Terms</p>
          <h2 className="text-4xl font-black text-[#00447f] mb-8">Buyer Acquisition Fees</h2>
          <p className="text-gray-600 text-base leading-relaxed mb-4">
            Buyer representation is provided on a consulting basis. Fees are determined by aircraft value, transaction complexity, and the scope of services required.
          </p>
          <p className="text-gray-600 text-base leading-relaxed">
            Contact ClearBlue Aero to discuss your acquisition requirements and receive a customized engagement proposal.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#00447f] text-center px-4">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">Ready to Buy?</p>
        <h2 className="text-4xl font-black text-white mb-5">Ready to Buy?</h2>
        <p className="text-white/50 text-lg max-w-xl mx-auto mb-4 leading-relaxed">
          Before you start negotiating with a seller, let ClearBlue Aero help you establish what you should be looking for.
        </p>
        <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">Contact us to begin your aircraft acquisition.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/contact" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm hover:brightness-110 transition-all" style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
            Contact Us <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="tel:+13862276840" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/20 hover:bg-white/10 transition-all">
            <Phone className="w-4 h-4" /> 386 227-6840
          </a>
        </div>
      </section>
    </div>
  );
}