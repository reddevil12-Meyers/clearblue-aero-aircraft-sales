import { Phone, ArrowRight, FileText, FileDown, Presentation, ShieldCheck, Clock, Plane } from "lucide-react";
import useSeo from "@/hooks/useSeo";
import JsonLd from "@/components/JsonLd";
import EstateIntakeForm from "@/components/public/EstateIntakeForm";

const NAVY = "#1B365D";
const NAVY_DARK = "#142a47";
const GOLD = "#C4A35A";

// Upload the three files to the project, then paste their served URLs here to
// convert the download cards from "Request file" to direct downloads (new tab).
const ATTORNEY_LEAVEBEHIND_URL = "";
const FAMILY_PR_ONEPAGER_URL = "";
const FIRM_BRIEFING_URL = "";

const FAQS = [
  {
    q: "Does a Florida personal representative need a court order to sell the airplane?",
    a: "Usually no. Aircraft is personal property. Fla. Stat. § 733.612 generally authorizes the PR to sell personalty. Restricted Letters or a contested file may still justify a court blessing. That is counsel's call."
  },
  {
    q: "Can an heir sign the FAA bill of sale before Letters issue?",
    a: "Only in the narrow heir-at-law path under 14 CFR 47.11(f), and only if no PR has been or will be appointed. The wrong signature block comes back from Oklahoma City."
  },
  {
    q: "Is a sale by the estate taxable in Florida?",
    a: "A third-party sale by the PR is generally subject to sales-and-use tax. Distribution to an heir is typically not. Fly-away and nonresident exemptions are narrow. We flag this; we do not opine. Your CPA does."
  },
  {
    q: "Will you fly the airplane?",
    a: "Default is no, except a maintenance or ferry flight under written authority and insurance naming the estate."
  },
  {
    q: "Do you practice law?",
    a: "No. Counsel directs the legal file. We run the aviation workstream and report to counsel."
  }
];

function SectionH2({ children, light = false }) {
  return (
    <h2 className={`text-3xl md:text-4xl font-black mb-6 ${light ? "text-white" : "text-white"}`}>{children}</h2>
  );
}

function GoldRule() {
  return <div className="h-1 w-16 mb-6" style={{ backgroundColor: GOLD }} />;
}

export default function EstateAircraft() {
  useSeo({
    title: "Estate Aircraft Concierge | ClearBlue Aero",
    description: "Turn-key FAA coordination through sale for aircraft held in Florida estates, trusts, and family-law matters. Situation Report in three business days.",
    path: "/estate-aircraft"
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  return (
    <div className="w-full" style={{ backgroundColor: NAVY }}>
      <JsonLd data={faqSchema} />

      {/* 1. Hero */}
      <section className="relative px-4 py-24 md:py-32 text-center" style={{ backgroundColor: NAVY_DARK }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: GOLD }}>Estate Aircraft Concierge</p>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
            When the estate includes an airplane, the clock is already running.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            The turn-key aviation desk for probate, trust, and family-law counsel — FAA coordination through sale. You keep the legal file. We run the airplane.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#intake" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110"
              style={{ backgroundColor: GOLD, color: NAVY }}>
              Request a Situation Report <ArrowRight className="w-4 h-4" />
            </a>
            <a href="tel:+13862276840" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/20 hover:bg-white/10 transition-all">
              <Phone className="w-4 h-4" /> Call 386-227-6840
            </a>
          </div>
          <p className="text-white/40 text-xs mt-6">
            A service of ClearBlue Aero · Nationwide FAA coordination · Not a law firm
          </p>
        </div>
      </section>

      {/* 2. Who / What / Why */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Who", copy: "Estate, probate, trust, and family-law counsel; personal representatives; professional fiduciaries." },
              { label: "What", copy: "One aviation desk: registration clock, title, insurance, hangar, logs, valuation, and — if directed — sale and closing." },
              { label: "Why", copy: "Aircraft are wasting, high-liability assets on a 30-day FAA clock most law offices are not staffed to run." }
            ].map(c => (
              <div key={c.label} className="rounded-2xl p-8 border border-white/10" style={{ backgroundColor: NAVY_DARK }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>{c.label}</p>
                <p className="text-white/75 text-sm leading-relaxed">{c.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The 30-day clock */}
      <section className="px-4 py-20" style={{ backgroundColor: NAVY_DARK }}>
        <div className="max-w-4xl mx-auto">
          <GoldRule />
          <SectionH2>The car-title instinct fails.</SectionH2>
          <p className="text-white/70 leading-relaxed mb-10">
            Civil aircraft are not cars. Florida does not issue a DHSMV-style aircraft title. Evidence of ownership lives at the FAA Aircraft Registration Branch in Oklahoma City under 14 CFR Part 47. By regulation, the Certificate of Aircraft Registration ends 30 days after the registered owner's death. Counsel must still give notice and account for the paper certificate. Hull insurance written in the decedent's name does not automatically follow the estate. Logbooks and airworthiness-directive compliance drive market value more than paint. Recorded security agreements, orphaned lenders, and Florida Chapter 329 artisan liens kill closings. An uninsured airframe in a hurricane county is a fiduciary problem.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { num: "30", unit: "Days", body: "Certificate of Aircraft Registration ends after the holder's death (14 CFR 47.41)." },
              { num: "60", unit: "Days", body: "Notice to the FAA, and return of the paper certificate if one exists." },
              { num: "0", unit: "FL title", body: "Instruments affecting aircraft title are recorded with the FAA, not a county tax collector (Fla. Stat. § 329.01)." }
            ].map(s => (
              <div key={s.stat} className="rounded-xl p-6 border border-white/10 text-center" style={{ backgroundColor: NAVY }}>
                <p className="text-4xl font-black" style={{ color: GOLD }}>{s.num}</p>
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">{s.unit}</p>
                <p className="text-white/65 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Split of labor */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          <div>
            <GoldRule />
            <SectionH2>What we handle so your office does not have to.</SectionH2>
            <ul className="space-y-3">
              {[
                "72-hour Situation Report: registration status and the 30-day clock, insurance, location, public-record liens, log custody, immediate risks, 30-day action calendar.",
                "FAA estate package — AC Forms 8050-1 / 8050-2 — with the signature block the Registry will accept (\"Estate of [Name] by [PR], Personal Representative\") plus certified Letters.",
                "Professional FAA title and chain-of-title search; International Registry when the airframe is in scope; lien-clearance workstream.",
                "Appraisal coordination and a records audit (airframe, engine, propeller, ADs, 337s).",
                "Hangar, insurance endorsement, and ferry as needed. Default recommendation: do not fly it except for maintenance or ferry under written authority.",
                "If the estate is selling: exclusive listing, buyer management, aviation escrow, estate-signed bill of sale, 14 CFR 91.417 records transfer, Closing Memorandum back to counsel."
              ].map((t, i) => (
                <li key={i} className="flex gap-3 text-white/75 text-sm leading-relaxed">
                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GOLD }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <GoldRule />
            <SectionH2>What you keep.</SectionH2>
            <ul className="space-y-3">
              {[
                "Legal strategy, petitions, Letters, creditor process, homestead and tax elections, and advice to the personal representative.",
                "Every fiduciary decision: hold, distribute in kind, or sell; accept or reject offers; approve spend above a stated cap.",
                "The attorney-client relationship. ClearBlue is a vendor to the estate or the authorized party — not counsel, and not a substitute for counsel."
              ].map((t, i) => (
                <li key={i} className="flex gap-3 text-white/75 text-sm leading-relaxed">
                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GOLD }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Four tiers */}
      <section className="px-4 py-20" style={{ backgroundColor: NAVY_DARK }}>
        <div className="max-w-5xl mx-auto">
          <GoldRule />
          <SectionH2>How firms use the desk.</SectionH2>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead style={{ backgroundColor: NAVY }}>
                <tr>
                  <th className="px-5 py-4 font-bold text-white" style={{ color: GOLD }}>Tier</th>
                  <th className="px-5 py-4 font-bold text-white">When and what</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { tier: "A · Triage", what: "First 10 days. Situation Report only. Fee credited if the file continues within 60 days." },
                  { tier: "B · Concierge", what: "Stabilize and prepare. FAA package, title search, insurance/hangar, records, appraisal, report every 14 days. Sale optional." },
                  { tier: "C · Concierge + Sale", what: "Everything above plus exclusive listing through escrow and the FAA closing package." },
                  { tier: "Family-law module", what: "Valuation or hold-in-place under injunction; buyout vs. sale; joint retention preferred." }
                ].map(r => (
                  <tr key={r.tier} style={{ backgroundColor: NAVY }}>
                    <td className="px-5 py-4 align-top font-bold text-white whitespace-nowrap" style={{ color: GOLD }}>{r.tier}</td>
                    <td className="px-5 py-4 text-white/75 leading-relaxed">{r.what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-white/40 text-xs mt-4">Fees quoted per engagement. We do not share legal fees with counsel.</p>
        </div>
      </section>

      {/* 6. Family-law strip */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <GoldRule />
          <SectionH2>Same aviation toolkit. Different file posture.</SectionH2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { title: "Valuation", body: "Market letter or coordinated certified appraisal on a discovery calendar. Distinguish asking price from equitable-distribution value." },
              { title: "Hold-in-place", body: "Temporary injunction freezes sale or flight. Insurance, hangar, and registration still have to be maintained." },
              { title: "Who can sign", body: "Individual vs. LLC vs. joint registration. An 8050-2 signed by the wrong spouse does not convey." },
              { title: "Buyout vs. sale", body: "One party keeps the airplane; the other needs a defensible number and a clean transfer — or the court orders a sale under the MSA." },
              { title: "Retention", body: "Joint retention or stipulation whenever possible. If only one party hires us, that limit is in writing. We do not take sides." }
            ].map(c => (
              <div key={c.title} className="rounded-xl p-5 border border-white/10" style={{ backgroundColor: NAVY_DARK }}>
                <p className="font-bold text-sm mb-2" style={{ color: GOLD }}>{c.title}</p>
                <p className="text-white/65 text-xs leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Downloads */}
      <section className="px-4 py-20" style={{ backgroundColor: NAVY_DARK }}>
        <div className="max-w-6xl mx-auto">
          <GoldRule />
          <SectionH2>Put this on the file today.</SectionH2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: "For counsel", desc: "Two-page leave-behind. Clock, tiers, statutory flags.", url: ATTORNEY_LEAVEBEHIND_URL },
              { icon: FileDown, title: "For the family / PR", desc: "Plain-language one-pager the lawyer can hand the personal representative.", url: FAMILY_PR_ONEPAGER_URL },
              { icon: Presentation, title: "Firm briefing", desc: "10-slide lunch-and-learn for the trusts-and-estates or family-law group.", url: FIRM_BRIEFING_URL }
            ].map(d => (
              <div key={d.title} className="rounded-2xl p-7 border border-white/10 flex flex-col" style={{ backgroundColor: NAVY }}>
                <d.icon className="w-8 h-8 mb-4" style={{ color: GOLD }} />
                <p className="text-white font-bold mb-1">{d.title}</p>
                <p className="text-white/50 text-sm mb-5">{d.desc}</p>
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" download
                    className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all hover:brightness-110"
                    style={{ backgroundColor: GOLD, color: NAVY }}>
                    <FileDown className="w-4 h-4" /> Download
                  </a>
                ) : (
                  <a href={`mailto:sales@flyclearblue.com?subject=${encodeURIComponent(d.title + ' — Estate Aircraft Concierge')}`}
                    className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm border border-white/20 text-white hover:bg-white/10 transition-all">
                    Request file
                  </a>
                )}
              </div>
            ))}
          </div>
          <p className="text-white/40 text-sm mt-6">
            Engagement letter sent after intake. Not posted for public download.
          </p>
        </div>
      </section>

      {/* 8. Intake */}
      <section id="intake" className="px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <GoldRule />
          <SectionH2>Three business days from a complete intake.</SectionH2>
          <p className="text-white/70 leading-relaxed mb-8">
            Send four facts. We return a Situation Report to counsel and the PR.
          </p>
          <div className="rounded-2xl p-8 border border-white/10" style={{ backgroundColor: NAVY_DARK }}>
            <EstateIntakeForm />
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="px-4 py-20" style={{ backgroundColor: NAVY_DARK }}>
        <div className="max-w-3xl mx-auto">
          <GoldRule />
          <SectionH2>Questions counsel asks first.</SectionH2>
          <div className="divide-y divide-white/10">
            {FAQS.map(f => (
              <div key={f.q} className="py-6">
                <p className="font-bold text-white mb-2">{f.q}</p>
                <p className="text-white/65 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Close */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <GoldRule />
          <SectionH2>Send the tail number.</SectionH2>
          <p className="text-white/70 leading-relaxed mb-8">
            N-number plus Letters status is enough to start. If you do not have a file yet, we will walk a trusts-and-estates or family-law group through a sample Situation Report.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#intake" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110"
              style={{ backgroundColor: GOLD, color: NAVY }}>
              Request a Situation Report <ArrowRight className="w-4 h-4" />
            </a>
            <a href="tel:+13862276840" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/20 hover:bg-white/10 transition-all">
              <Phone className="w-4 h-4" /> Call 386-227-6840
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="px-4 pb-16">
        <div className="max-w-3xl mx-auto border-t border-white/10 pt-8">
          <p className="text-white/35 text-xs leading-relaxed text-center">
            ClearBlue Aero does not practice law and does not provide tax advice. This page is not a solicitation of legal work. Engagement is typically with the personal representative or trustee, copied to counsel of record. Joint retention is preferred in family-law matters.
          </p>
        </div>
      </div>
    </div>
  );
}