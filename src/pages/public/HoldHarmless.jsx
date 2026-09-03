import { Link } from "react-router-dom";
import { ShieldCheck, Phone, ArrowRight } from "lucide-react";
import useSeo from "@/hooks/useSeo";

const sections = [
  {
    title: "Indemnification & Hold Harmless",
    text: "Client agrees to indemnify, defend, and hold Consultant harmless from and against any and all claims, demands, actions, liabilities, damages, losses, costs, and expenses, including reasonable attorneys' fees and court costs, arising out of or relating to Client's ownership, possession, operation, use, or attempted operation of any aircraft acquired by Client through Consultant's services, including any injury, death, property damage, or other loss arising from Client's acts, omissions, negligence, lack of experience, lack of proficiency, or failure to comply with applicable laws, regulations, aircraft operating limitations, or insurance requirements."
  },
  {
    title: "Consultant's Limited Role",
    text: "Client acknowledges and agrees that Consultant is acting solely as an aircraft sourcing and consulting service and is not acting as Client's flight instructor, pilot, flight standards evaluator, insurance underwriter, or aviation safety representative. Consultant makes no representation or warranty regarding Client's ability, experience, proficiency, judgment, or qualifications to safely operate any aircraft identified, recommended, sourced, or acquired through Consultant's services."
  },
  {
    title: "Flight Training Requirement",
    text: "As a material and non-negotiable condition of Consultant's engagement, Client agrees that, prior to acting as Pilot in Command of any aircraft acquired through Consultant's services, Client shall complete a minimum of twenty-five (25) hours of flight training in the specific make and model of aircraft with an FAA-certificated flight instructor who is acceptable to and approved by Client's aircraft insurance carrier. Client shall also complete any additional training, checkout, transition training, or proficiency training required by Client's insurance carrier or reasonably recommended by the applicable flight instructor."
  },
  {
    title: "Training Minimum Does Not Certify Competency",
    text: "The twenty-five (25) hour minimum is a contractual minimum only and shall not be construed as a representation or determination by Consultant that twenty-five (25) hours of training is sufficient for Client to safely or competently operate the aircraft. Client is solely responsible for determining, in consultation with appropriately qualified aviation professionals, when Client has achieved the knowledge, proficiency, and competency necessary to safely operate the aircraft."
  },
  {
    title: "Client's Sole Responsibility",
    text: "Client shall be solely responsible for obtaining and maintaining all required flight training, endorsements, certifications, qualifications, medical qualifications, and aircraft insurance necessary for the operation of the aircraft. Nothing contained in this Agreement shall be construed as Consultant providing, approving, or authorizing flight training or determining that Client is qualified or competent to operate any aircraft."
  },
  {
    title: "Material Breach",
    text: "Client's failure to satisfy the foregoing training and insurance requirements shall not create any liability or responsibility on the part of Consultant and shall constitute a material breach of this Agreement."
  },
];

export default function HoldHarmless() {
  useSeo({
    title: "Hold Harmless & Flight Training Requirement — ClearBlue Aero",
    description: "ClearBlue Aero clients agree to indemnify the consultant and complete a minimum of 25 hours of make-and-model flight training with an FAA-certificated instructor approved by their insurance carrier.",
    path: "/hold-harmless"
  });

  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <div className="bg-[#00447f] py-24 px-4 text-center">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Client Agreement</p>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-5">
          Hold Harmless &<br />Flight Training Requirement
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          The following provisions apply to every client engagement with ClearBlue Aero.
        </p>
        <div className="flex items-center justify-center gap-2 text-[#C9A84C]">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Safety First · Pilot Responsibility</span>
        </div>
      </div>

      {/* Legal Content */}
      <section className="py-20 bg-[#f5f6f8]">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {sections.map(({ title, text }, i) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-8">
              <h2 className="text-lg font-black text-[#00447f] mb-3 uppercase tracking-wide flex items-baseline gap-3">
                <span className="text-[#C9A84C]">{String(i + 1).padStart(2, '0')}</span>
                {title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#00447f] text-center px-4">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">Questions?</p>
        <h2 className="text-4xl font-black text-white mb-5">Talk to a Broker</h2>
        <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">
          If you have questions about these requirements or how they apply to your purchase, we're happy to walk you through them.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="tel:+13862276840" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm hover:brightness-110 transition-all" style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
            <Phone className="w-4 h-4" /> 386 227-6840
          </a>
          <Link to="/contact" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/20 hover:bg-white/10 transition-all">
            Contact Us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}