import { Link } from "react-router-dom";
import { Shield, CheckCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicInsurance() {
  const coverages = [
    { title: "Hull Coverage", desc: "Protects your aircraft from physical damage, whether in flight or on the ground." },
    { title: "Liability Coverage", desc: "Covers bodily injury and property damage to third parties caused by your aircraft." },
    { title: "Passenger Liability", desc: "Protection for passengers aboard your aircraft in the event of an accident." },
    { title: "In-Flight Coverage", desc: "All-risk coverage while airborne, including ground operations and taxi." },
    { title: "Hangar Coverage", desc: "Protects your aircraft while it is stored in a hangar from fire, theft, and more." },
    { title: "Non-Owned Aircraft", desc: "Liability coverage when you fly aircraft that you don't own." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-20 px-6 text-center">
        <Shield className="h-12 w-12 mx-auto mb-4 text-accent" />
        <h1 className="font-display text-4xl font-bold mb-4">Aviation Insurance</h1>
        <p className="text-primary-foreground/75 text-lg max-w-xl mx-auto">
          Comprehensive coverage options tailored to your aircraft and flying profile.
        </p>
      </div>

      {/* Coverage Types */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-center text-foreground mb-12">Coverage Options</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coverages.map(({ title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <CheckCircle className="h-6 w-6 text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section className="py-16 px-6 bg-secondary/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Why Get Insurance Through Us?</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            We work with multiple top-rated aviation insurance carriers to find you the best rates and coverage. As aviation specialists, we understand the nuances of aircraft insurance and advocate for our clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/public/contact">
                <Phone className="h-4 w-4 mr-2" />
                Request a Quote
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}