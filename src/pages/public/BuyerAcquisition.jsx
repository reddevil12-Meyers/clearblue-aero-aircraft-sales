import { Link } from "react-router-dom";
import { Phone, ArrowRight, CheckCircle, Search, ClipboardCheck, BarChart3, Handshake, Wrench, FileCheck } from "lucide-react";
import useSeo from "@/hooks/useSeo";

const NAVY = "#00447f";
const GOLD = "#C9A84C";

const services = [
{
  icon: Search,
  title: "Aircraft Search",
  text: "We identify aircraft that match your mission, budget, specifications, and ownership goals."
},
{
  icon: ClipboardCheck,
  title: "Aircraft Evaluation",
  text: "We help you assess condition, maintenance history, records, equipment, and potential future costs."
},
{
  icon: BarChart3,
  title: "Market & Price Analysis",
  text: "We evaluate comparable aircraft and market conditions to help determine what the aircraft is really worth."
},
{
  icon: Handshake,
  title: "Negotiation",
  text: "We negotiate purchase price and transaction terms with your interests in mind."
},
{
  icon: Wrench,
  title: "Pre-Purchase Coordination",
  text: "We help coordinate the pre-buy inspection and communication with qualified aviation professionals."
},
{
  icon: FileCheck,
  title: "Transaction Management",
  text: "We help manage the details between offer and closing, keeping the transaction organized and moving forward."
}];


const processSteps = [
{
  num: 1,
  title: "Define Your Mission",
  text: "We determine what you need in an aircraft."
},
{
  num: 2,
  title: "Find the Right Aircraft",
  text: "We search the market and identify qualified candidates."
},
{
  num: 3,
  title: "Evaluate & Negotiate",
  text: "We analyze the aircraft, coordinate due diligence, and negotiate the transaction."
},
{
  num: 4,
  title: "Close With Confidence",
  text: "We help coordinate the final steps through closing and delivery."
}];


const faqs = [
{
  q: "What does a buyer representative cost?",
  a: "Buyer representation is provided on a consulting basis. Fees are determined by aircraft value, transaction complexity, and the scope of services required. Contact us to receive a customized engagement proposal."
},
{
  q: "Do you only show aircraft that ClearBlue Aero has listed?",
  a: "No. We search the entire market, including aircraft that are not prominently advertised. Our objective is the right aircraft for you, not a specific listing."
},
{
  q: "Do you replace a pre-purchase inspection?",
  a: "No. The pre-buy inspection is performed by a properly qualified mechanic or inspector. We help coordinate the process and make sure it addresses the aircraft and the transaction appropriately."
},
{
  q: "Can you help me after I have already found an aircraft?",
  a: "Yes. Many buyers engage us after identifying a candidate. We can evaluate the aircraft, analyze the market, and assist with the negotiation, inspection coordination, and closing."
}];


export default function PublicBuyerAcquisition() {
  useSeo({
    title: "Aircraft Buyer Acquisition Services | ClearBlue Aero",
    description: "ClearBlue Aero represents aircraft buyers from search and evaluation through negotiation, pre-buy inspection, due diligence, and closing. We work for you, not the seller.",
    path: "/buyer"
  });

  return (
    <div className="bg-white w-full">
      {/* 1. Hero — strong headline + positioning */}
      <div
        className="bg-cover bg-center py-24 md:py-32 px-4 text-center"
        style={{
          backgroundImage:
          "linear-gradient(rgba(0,34,68,0.55), rgba(0,34,68,0.55)), url('https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/7faed5b9e_82EA3D53-5A45-4F89-8E94-32BD723D4728.png')"
        }}>
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Aircraft Acquisitions and Buyer Representation</p>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
          Buy the Right Aircraft.<br />With Someone in Your Corner.
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-6">
          Finding an aircraft is easy. Knowing whether it is the right aircraft, at the right price, is where experience matters.
        </p>
        <p className="text-white/50 text-base max-w-2xl mx-auto leading-relaxed mb-8">
          ClearBlue Aero represents buyers throughout the aircraft acquisition process, from identifying qualified aircraft to negotiating the purchase, coordinating the pre-buy, reviewing records, and managing the transaction through closing.
        </p>
        <p className="text-[#C9A84C] text-xl font-bold">We work for you, not the seller.</p>
      </div>

      {/* 2. What We Do — 6 icon cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-3">What We Do</p>
            <h2 className="text-3xl md:text-4xl font-black" style={{ color: NAVY }}>What We Do</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, text }) =>
            <div key={title} className="bg-[#f5f6f8] rounded-2xl p-7 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: NAVY }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-black mb-2" style={{ color: NAVY }}>{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{text}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Our Process — 4 steps */}
      <section className="py-20" style={{ backgroundColor: '#f5f6f8' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-3">Simple by Design</p>
            <h2 className="text-3xl md:text-4xl font-black" style={{ color: NAVY }}>Our Process</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map(({ num, title, text }) =>
            <div key={num} className="bg-white rounded-2xl p-7 border border-gray-100 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: NAVY }}>
                  <span className="text-lg font-black" style={{ color: GOLD }}>{num}</span>
                </div>
                <h3 className="text-base font-black mb-2" style={{ color: NAVY }}>{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{text}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Why Use a Buyer Representative? */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">On Your Side</p>
          <h2 className="text-3xl md:text-4xl font-black mb-8" style={{ color: NAVY }}>Why Use a Buyer Representative?</h2>
          <div className="space-y-5 text-gray-600 text-base leading-relaxed">
            <p>An aircraft purchase can involve hundreds of thousands of dollars and decades of maintenance history.</p>
            <p>ClearBlue Aero provides an independent perspective throughout the process, helping you identify risks, understand the aircraft you are considering, and make a better-informed purchase decision.</p>
          </div>
        </div>
      </section>

      {/* 5. Key message */}
      <section className="py-20" style={{ backgroundColor: NAVY }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-6">
            We Don't Sell You an Airplane.
            <span className="block mt-2" style={{ color: GOLD }}>We Help You Buy the Right One.</span>
          </h2>
          <div className="flex items-center justify-center gap-3 text-white/60 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
            <span>You're not hiring us to find an airplane. You're hiring us to help you buy one.</span>
          </div>
        </div>
      </section>

      {/* 6. CTA */}
      <section className="py-20 bg-[#f5f6f8] text-center px-4">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Your Search Starts Here</p>
        <h2 className="text-3xl md:text-4xl font-black mb-5" style={{ color: NAVY }}>Ready to Start Your Search?</h2>
        <p className="text-gray-600 text-base max-w-xl mx-auto mb-10 leading-relaxed">
          Tell us what you're looking for. We'll help you determine what makes sense for your mission and your budget.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/contact" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm hover:brightness-110 transition-all" style={{ backgroundColor: GOLD, color: NAVY }}>
            Start Your Aircraft Search <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="tel:+13862276840" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm border transition-all hover:bg-white" style={{ color: NAVY, borderColor: NAVY }}>
            <Phone className="w-4 h-4" /> 386 227-6840
          </a>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-3">Questions</p>
            <h2 className="text-3xl font-black" style={{ color: NAVY }}>Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-gray-100 border-y border-gray-100">
            {faqs.map(({ q, a }) =>
            <details key={q} className="group py-5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-bold text-gray-800 text-sm">
                  {q}
                  <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-open:rotate-90" style={{ color: NAVY }} />
                </summary>
                <p className="text-gray-500 text-sm leading-relaxed mt-3">{a}</p>
              </details>
            )}
          </div>
        </div>
      </section>
    </div>);

}