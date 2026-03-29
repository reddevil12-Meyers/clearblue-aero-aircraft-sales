import { Link } from "react-router-dom";
import { Plane, ClipboardList, TrendingUp, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicSellYourPlane() {
  const steps = [
    { icon: ClipboardList, title: "Submit Your Aircraft", desc: "Fill out our simple listing form with your aircraft details. Takes just a few minutes." },
    { icon: TrendingUp, title: "Professional Valuation", desc: "Our appraisers provide a market-based valuation to price your aircraft competitively." },
    { icon: Handshake, title: "We Handle the Rest", desc: "We market your aircraft, qualify buyers, and guide the transaction through to closing." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-20 px-6 text-center">
        <h1 className="font-display text-4xl font-bold mb-4">Sell Your Aircraft</h1>
        <p className="text-primary-foreground/75 text-lg max-w-xl mx-auto">
          Let our experienced team handle your sale from valuation to closing, so you can focus on what matters.
        </p>
      </div>

      {/* Process */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-center text-foreground mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="text-center">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="bg-accent/10 rounded-full p-5">
                  <Icon className="h-7 w-7 text-accent" />
                </div>
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{i + 1}</span>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Options */}
      <section className="py-16 px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-foreground mb-10">Choose Your Listing Type</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm flex flex-col gap-4">
              <Plane className="h-8 w-8 text-accent" />
              <h3 className="font-semibold text-xl text-foreground">Single-Engine Aircraft</h3>
              <p className="text-muted-foreground text-sm flex-1">Piston singles, turboprops, light sport aircraft, and more.</p>
              <Button asChild className="w-full mt-2">
                <Link to="/public/sell/single-engine">List Single-Engine</Link>
              </Button>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm flex flex-col gap-4">
              <div className="flex gap-1">
                <Plane className="h-8 w-8 text-accent" />
                <Plane className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold text-xl text-foreground">Twin-Engine Aircraft</h3>
              <p className="text-muted-foreground text-sm flex-1">Piston twins, turboprops, light jets, and multi-engine aircraft.</p>
              <Button asChild className="w-full mt-2">
                <Link to="/public/sell/twin-engine">List Twin-Engine</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <p className="text-muted-foreground mb-4">Have questions before listing? We'd love to chat.</p>
        <Button asChild variant="outline">
          <Link to="/public/contact">Contact Us First</Link>
        </Button>
      </section>
    </div>
  );
}