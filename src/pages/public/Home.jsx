import { Link } from "react-router-dom";
import { Plane, Shield, TrendingUp, Search, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicHome() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="relative bg-cover bg-center bg-no-repeat py-32 px-6 text-white"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80')" }}
      >
        <div className="absolute inset-0 bg-primary/80" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Expert Aircraft Brokerage & Appraisal
          </h1>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Trusted valuations, seamless transactions, and a curated inventory of quality aircraft.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8">
              <Link to="/public/inventory">Browse Inventory</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-base px-8">
              <Link to="/public/sell">Sell Your Aircraft</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-foreground mb-12">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: "Aircraft Brokerage", desc: "We match buyers and sellers with precision, handling every detail from listing to closing.", link: "/public/inventory" },
              { icon: TrendingUp, title: "Professional Appraisals", desc: "FAA-compliant valuations for sale, insurance, estate, and financing purposes.", link: "/public/contact" },
              { icon: Shield, title: "Insurance Services", desc: "Competitive aviation insurance options tailored to your aircraft and flying profile.", link: "/public/insurance" },
            ].map(({ icon: Icon, title, desc, link }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-8 flex flex-col items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-accent/10 rounded-lg p-3">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                <Link to={link} className="text-primary text-sm font-medium flex items-center gap-1 mt-auto hover:underline">
                  Learn More <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 px-6 bg-secondary/40">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">Why Choose Us?</h2>
            <div className="space-y-4">
              {[
                "Decades of combined aviation industry experience",
                "Transparent, data-driven appraisal methodology",
                "End-to-end transaction support from listing to closing",
                "Access to a nationwide network of buyers and sellers",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <p className="text-foreground/80">{item}</p>
                </div>
              ))}
            </div>
            <Button asChild className="mt-8">
              <Link to="/public/about">About Us</Link>
            </Button>
          </div>
          <img
            src="https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&q=80"
            alt="Aircraft"
            className="rounded-xl shadow-lg w-full h-72 object-cover"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary text-primary-foreground text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Buy or Sell?</h2>
          <p className="text-primary-foreground/75 mb-8">Contact our team today and let us guide you through your next aircraft transaction.</p>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/public/contact">Get In Touch</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}