import { Phone, ArrowRight, FileText, FileDown, Plane, Clock, Landmark, Scale, FileCheck } from "lucide-react";
import useSeo from "@/hooks/useSeo";
import JsonLd from "@/components/JsonLd";
import EstateIntakeForm from "@/components/public/EstateIntakeForm";

const NAVY = "#1B365D";
const NAVY_DARK = "#142a47";
const GOLD = "#C4A35A";
const CREAM = "#f5f6f8";

const HERO_IMG = "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/237738413_generated_image.png";
const COURTHOUSE_IMG = "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/ecd20204d_generated_image.png";
const LOGBOOK_IMG = "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/debb3fb37_generated_image.png";

// Upload the two public PDFs to the project, then paste their served URLs here
// to convert the download cards from "Request file" to direct downloads (new tab).
const ATTORNEY_LEAVEBEHIND_URL = "";
const FAMILY_PR_ONEPAGER_URL = "";

const FAQS = [
{
  q: "Does a Florida PR need a court order to sell the airplane?",
  a: "Usually no. Aircraft is personal property. Counsel decides whether a given file still needs a court blessing."
},
{
  q: "Can someone sign FAA papers before Letters issue?",
  a: "Sometimes, in a narrow heir-at-law path, and only if no personal representative has been or will be appointed. The wrong signer comes back from Oklahoma City. We will say so in the Situation Report."
},
{
  q: "Will you fly it?",
  a: "Default is no, except a maintenance or ferry flight under written authority and insurance naming the estate."
},
{
  q: "Do you give legal or tax advice?",
  a: "No. We flag issues. Counsel and the CPA opine."
},
{
  q: "Who engages you?",
  a: "Typically the personal representative or trustee, copied to counsel. Joint retention is preferred in family-law matters."
}];


function SectionH2({ children, light = false }) {
  return <h2 className={`text-3xl md:text-4xl font-black mb-6 ${light ? "text-[#1B365D]" : "text-white"}`}>{children}</h2>;
}

function GoldRule() {
  return <div className="h-1 w-16 mb-6" style={{ backgroundColor: GOLD }} />;
}

export default function EstateAircraft() {
  useSeo({
    title: "Estate Aircraft Concierge | ClearBlue Aero",
    description: "When an estate or family-law matter includes an airplane. FAA coordination through sale. Situation Report in three business days.",
    path: "/estate-aircraft"
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  return (
    <div className="w-full" style={{ backgroundColor: NAVY }}>
      <JsonLd data={faqSchema} />

      {/* 1. Hero — dark */}
      <section className="relative px-4 py-24 md:py-32 text-center overflow-hidden" style={{ backgroundColor: NAVY_DARK }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(20,42,71,0.5), rgba(20,42,71,0.5)), url('${HERO_IMG}')`,
          backgroundSize: "cover", backgroundPosition: "center"
        }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="font-bold uppercase tracking-widest mb-5 text-sm" style={{ color: GOLD }}>Estate Aircraft Concierge</p>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
            When the estate includes an airplane, the clock is already running.
          </h1>
          <p className="text-white/85 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            A specialist aviation desk for probate, trust, and family-law counsel. You keep the legal file. We run the airplane.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#intake" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110"
            style={{ backgroundColor: GOLD, color: NAVY }}>
              Request a Situation Report <ArrowRight className="w-4 h-4" />
            </a>
            <a href="tel:+13862276840" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/30 hover:bg-white/10 transition-all">
              <Phone className="w-4 h-4" /> Call 386-227-6840
            </a>
          </div>
          <p className="text-white/60 text-xs mt-6">
            A service of ClearBlue Aero · Nationwide FAA coordination · Not a law firm
          </p>
        </div>
      </section>

      {/* 2. Who / What / Why — light cream */}
      <section className="px-4 py-20" style={{ backgroundColor: CREAM }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
            { icon: Landmark, label: "Who", copy: "CLEARBLUE AERO provides aircraft administrative assistance to law firms and independent attorneys involved with estate, probate, trust, and family-law matters." },
            { icon: Plane, label: "What", copy: "Registration, title, insurance, hangar, records, valuation — and sale if the estate directs it." },
            { icon: Clock, label: "Why", copy: "An airplane is a wasting, high-liability asset. Most law offices are not staffed to run it." }].
            map((c) =>
            <div key={c.label} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <c.icon className="w-7 h-7 mb-4" style={{ color: GOLD }} />
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>{c.label}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{c.copy}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. The clock — light white */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center mb-10">
            <div>
              <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center mb-4" style={{ borderColor: GOLD }}>
                <Plane className="w-8 h-8" style={{ color: GOLD }} />
              </div>
              <GoldRule />
              <SectionH2 light>It is not a car title.</SectionH2>
              <p className="text-gray-600 leading-relaxed">
                Civil aircraft are not titled at a Florida tax collector's office. Ownership evidence lives with the FAA in Oklahoma City. The Certificate of Aircraft Registration ends 30 days after the registered owner's death. Insurance written in the decedent's name does not automatically follow the estate. Missing logbooks and an uninsured airframe in a storm county are fiduciary problems, not paperwork footnotes.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <img src={COURTHOUSE_IMG} alt="Courthouse columns" loading="lazy"
              className="w-full h-full object-cover aspect-[4/3]" />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
            { num: "30 days", body: "Registration ends." },
            { num: "60 days", body: "FAA notice / return of the paper certificate." },
            { num: "No FL title", body: "Recorded at the FAA, not DHSMV." }].
            map((s) =>
            <div key={s.num} className="rounded-xl p-6 border border-gray-200 text-center" style={{ backgroundColor: CREAM }}>
                <p className="text-2xl md:text-3xl font-black mb-2" style={{ color: GOLD }}>{s.num}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{s.body}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Split of labor — light cream */}
      <section className="px-4 py-20" style={{ backgroundColor: CREAM }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <Plane className="w-7 h-7 mb-4" style={{ color: GOLD }} />
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>What We Handle</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Find out where the airplane stands; prepare the FAA package the Registry will accept; keep it insured and stored; sell it through aviation escrow if the estate decides to sell; report back to counsel.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <Scale className="w-7 h-7 mb-4" style={{ color: GOLD }} />
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>What You Keep</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Legal strategy, Letters, court work, tax elections, and every fiduciary decision — hold, distribute, or sell.
            </p>
          </div>
        </div>
      </section>

      {/* 5. How to start — light white */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm order-2 lg:order-1">
            <img src={LOGBOOK_IMG} alt="Aircraft logbook and documents on a desk" loading="lazy"
            className="w-full h-full object-cover aspect-[4/3]" />
          </div>
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <FileCheck className="w-8 h-8 mb-4 mx-auto lg:mx-0" style={{ color: GOLD }} />
            <GoldRule />
            <SectionH2 light>Start with a Situation Report.</SectionH2>
            <p className="text-gray-600 leading-relaxed">
              A short written briefing for counsel and the personal representative. What is urgent, what can wait, and whether the next step is holding the airplane or selling it. Returned within three business days of a complete intake.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Downloads — light cream */}
      <section className="px-4 py-20" style={{ backgroundColor: CREAM }}>
        <div className="max-w-5xl mx-auto">
          <GoldRule />
          <SectionH2 light>Put this on the file today.</SectionH2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
            { icon: FileText, title: "For counsel", desc: "Two-page leave-behind for the file.", url: ATTORNEY_LEAVEBEHIND_URL },
            { icon: FileDown, title: "For the family / PR", desc: "Plain-language one-pager for the personal representative.", url: FAMILY_PR_ONEPAGER_URL }].
            map((d) =>
            <div key={d.title} className="bg-white rounded-2xl p-7 border border-gray-200 shadow-sm flex flex-col">
                <d.icon className="w-8 h-8 mb-4" style={{ color: GOLD }} />
                <p className="text-[#1B365D] font-bold mb-1">{d.title}</p>
                <p className="text-gray-500 text-sm mb-5">{d.desc}</p>
                {d.url ?
              <a href={d.url} target="_blank" rel="noopener noreferrer" download
              className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all hover:brightness-110"
              style={{ backgroundColor: GOLD, color: NAVY }}>
                    <FileDown className="w-4 h-4" /> Download
                  </a> :

              <a href={`mailto:sales@flyclearblue.com?subject=${encodeURIComponent(d.title + ' — Estate Aircraft Concierge')}`}
              className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm border border-gray-300 text-[#1B365D] hover:bg-gray-50 transition-all">
                    Request file
                  </a>
              }
              </div>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-6">Working documents follow intake.</p>
        </div>
      </section>

      {/* 7. Intake — light white, dark form card */}
      <section id="intake" className="px-4 py-20 bg-white">
        <div className="max-w-2xl mx-auto">
          <GoldRule />
          <SectionH2 light>Send four facts.</SectionH2>
          <p className="text-gray-600 leading-relaxed mb-8">
            We return a Situation Report to counsel and the PR.
          </p>
          <div className="rounded-2xl p-8 border border-white/10" style={{ backgroundColor: NAVY }}>
            <EstateIntakeForm />
          </div>
        </div>
      </section>

      {/* 8. FAQ — dark */}
      <section className="px-4 py-20" style={{ backgroundColor: NAVY_DARK }}>
        <div className="max-w-3xl mx-auto">
          <GoldRule />
          <SectionH2>Questions counsel asks first.</SectionH2>
          <div className="divide-y divide-white/10">
            {FAQS.map((f) =>
            <div key={f.q} className="py-6">
                <p className="font-bold text-white mb-2">{f.q}</p>
                <p className="text-white/65 text-sm leading-relaxed">{f.a}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 9. Close — dark */}
      <section className="px-4 py-20 text-center" style={{ backgroundColor: NAVY_DARK }}>
        <div className="max-w-2xl mx-auto">
          <div className="h-1 w-16 mb-6 mx-auto" style={{ backgroundColor: GOLD }} />
          <SectionH2>Send the tail number.</SectionH2>
          <p className="text-white/70 leading-relaxed mb-8">
            N-number plus Letters status is enough to start.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#intake" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110"
            style={{ backgroundColor: GOLD, color: NAVY }}>
              Request a Situation Report <ArrowRight className="w-4 h-4" />
            </a>
            <a href="tel:+13862276840" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/30 hover:bg-white/10 transition-all">
              <Phone className="w-4 h-4" /> Call 386-227-6840
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="px-4 pb-16" style={{ backgroundColor: NAVY_DARK }}>
        <div className="max-w-3xl mx-auto border-t border-white/10 pt-8">
          <p className="text-white/35 text-xs leading-relaxed text-center">
            ClearBlue Aero does not practice law and does not provide tax advice. This page is not a solicitation of legal work.
          </p>
        </div>
      </div>
    </div>);

}