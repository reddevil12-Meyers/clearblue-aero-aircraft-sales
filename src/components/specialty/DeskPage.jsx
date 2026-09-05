import { Link } from "react-router-dom";
import { Phone, ArrowRight, Check, X, Briefcase, Search, HandCoins } from "lucide-react";
import useSeo from "@/hooks/useSeo";
import DeskIntakeForm from "./DeskIntakeForm";
import ModelsWeWork from "./ModelsWeWork";
import BeechcraftTestimonialsBanner from "./BeechcraftTestimonialsBanner";
import BuyerRepresentationHero from "./BuyerRepresentationHero";
import TransparentPricing from "./TransparentPricing";
import SisterDesks, { HowWeWork, ListingsCta, DeskFaq, DeskDisclaimer } from "./DeskSharedSections";
import { DESK_LINE } from "@/lib/specialtyDesks";

const NAVY = "#1B365D";
const GOLD = "#C4A35A";
const LIGHT = "#E8EEF5";
const SLATE = "#334155";

export default function DeskPage({ desk }) {
  const {
    slug,
    name,
    seoTitle,
    meta,
    kicker,
    h1,
    deck,
    what,
    heritage,
    modelsHeading,
    models,
    outOfScope,
    outOfScopeHeading,
    outOfScopeItems,
    buySide,
    sellSide,
    estateNote,
    sellCtaLabel,
  } = desk;

  useSeo({ title: seoTitle, description: meta, path: `/${slug}` });

  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <section className="py-20 px-4 text-center" style={{ backgroundColor: NAVY }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
          {kicker}
        </p>
        <p className="text-white/60 text-sm mb-6">{DESK_LINE}</p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-5 max-w-3xl mx-auto">{h1}</h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">{deck}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="#intake"
            className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            Start a buyer search <ArrowRight className="w-4 h-4" />
          </a>
          <Link
            to="/sell"
            className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/25 hover:bg-white/10 transition-all"
          >
            {sellCtaLabel}
          </Link>
          <a
            href="tel:+13862276840"
            className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/25 hover:bg-white/10 transition-all"
          >
            <Phone className="w-4 h-4" /> 386 227-6840
          </a>
        </div>
      </section>

      {/* What this desk is */}
      <section className="py-16 px-4" style={{ backgroundColor: LIGHT }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-6" style={{ color: NAVY }}>
            What this desk is
          </h2>
          {what.map((p, i) => (
            <p key={i} className="text-base leading-relaxed mb-4" style={{ color: SLATE }}>
              {p}
            </p>
          ))}
          {heritage && (
            <p className="text-sm leading-relaxed text-gray-500 italic mt-6">{heritage}</p>
          )}
        </div>
      </section>

      {/* Models we work */}
      {desk.modelBlocks ? (
        <ModelsWeWork desk={desk} />
      ) : (
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black mb-8 text-center" style={{ color: NAVY }}>
            Models we work
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <p className="font-bold text-sm mb-4" style={{ color: NAVY }}>
              {modelsHeading}
            </p>
            <ul className="space-y-3">
              {models.map((m) => (
                <li key={m} className="flex items-start gap-3">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: GOLD }} />
                  <span className="text-sm leading-relaxed" style={{ color: SLATE }}>
                    {m}
                  </span>
                </li>
              ))}
            </ul>
            {(outOfScope || outOfScopeItems) && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                {outOfScopeHeading && (
                  <p className="font-bold text-sm mb-3" style={{ color: SLATE }}>
                    {outOfScopeHeading}
                  </p>
                )}
                {outOfScope && (
                  <p className="text-sm leading-relaxed flex items-start gap-3" style={{ color: SLATE }}>
                    <X className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    {outOfScope}
                  </p>
                )}
                {outOfScopeItems && (
                  <ul className="space-y-2">
                    {outOfScopeItems.map((m) => (
                      <li key={m} className="flex items-start gap-3">
                        <X className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                        <span className="text-sm leading-relaxed" style={{ color: SLATE }}>
                          {m}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {slug === "beechcraft" && <BuyerRepresentationHero />}

      {/* How an engagement works */}
      <section className="py-16 px-4" style={{ backgroundColor: LIGHT }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black mb-8 text-center" style={{ color: NAVY }}>
            How an engagement works
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="relative w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center mb-5">
                <Briefcase className="w-7 h-7" style={{ color: GOLD }} />
                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                  <Search className="w-4 h-4" style={{ color: GOLD }} />
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold mb-3" style={{ color: NAVY }}>
                Buy side
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: SLATE }}>
                {buySide}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center mb-5">
                <HandCoins className="w-8 h-8" style={{ color: GOLD }} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3" style={{ color: NAVY }}>
                Sell side
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: SLATE }}>
                {sellSide}
              </p>
              {estateNote && (
                <Link to="/estate-aircraft" className="inline-flex items-center gap-1 mt-4 text-sm font-semibold hover:underline" style={{ color: NAVY }}>
                  {estateNote} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {slug === "beechcraft" && <BeechcraftTestimonialsBanner />}
      <HowWeWork />
      {slug === "beechcraft" && <TransparentPricing />}
      <ListingsCta slug={slug} />
      <SisterDesks />

      {/* Intake */}
      <section id="intake" className="py-16 px-4 bg-white scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-3 text-center" style={{ color: NAVY }}>
            Start the conversation
          </h2>
          <p className="text-sm mb-8 text-center" style={{ color: SLATE }}>
            {name} is a {DESK_LINE.toLowerCase().replace("a specialty", "specialty")} Tell us the mission, the budget, and the make.
          </p>
          <DeskIntakeForm slug={slug} />
        </div>
      </section>

      <DeskFaq />
      <DeskDisclaimer deskName={name} />
    </div>
  );
}