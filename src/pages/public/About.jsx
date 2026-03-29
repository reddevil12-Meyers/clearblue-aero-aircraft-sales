import { Link } from "react-router-dom";
import { Award, Users, Globe, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicAbout() {
  const stats = [
    { label: "Years of Experience", value: "20+" },
    { label: "Aircraft Sold", value: "500+" },
    { label: "Appraisals Completed", value: "1,200+" },
    { label: "States Served", value: "48" },
  ];

  const team = [
    { name: "James Mitchell", title: "Senior Aircraft Appraiser & Broker", bio: "FAA-certified appraiser with over 20 years in general aviation brokerage and valuation.", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80" },
    { name: "Sarah Chen", title: "Aviation Broker & Client Relations", bio: "Specializing in turboprop and light jet transactions, Sarah brings a decade of deal-making expertise.", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-20 px-6 text-center">
        <h1 className="font-display text-4xl font-bold mb-4">About Us</h1>
        <p className="text-primary-foreground/75 text-lg max-w-xl mx-auto">
          A trusted name in aircraft brokerage and appraisal for over two decades.
        </p>
      </div>

      {/* Stats */}
      <section className="py-16 px-6 bg-secondary/20">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ label, value }) => (
            <div key={label}>
              <p className="font-display text-4xl font-bold text-accent">{value}</p>
              <p className="text-muted-foreground text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Founded by pilots and aviation enthusiasts, our firm was built on the belief that buying and selling an aircraft should be a transparent, informed, and rewarding experience.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We combine deep market knowledge with rigorous appraisal methodology to deliver accurate valuations and successful transactions for our clients.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              From single-engine trainers to turbine-powered aircraft, we handle transactions of all sizes with the same level of professionalism and dedication.
            </p>
          </div>
          <img src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80" alt="Our team" className="rounded-xl shadow-lg w-full h-72 object-cover" />
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-foreground mb-10">Our Values</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Award, title: "Integrity", desc: "Honest, transparent dealings in every transaction." },
              { icon: TrendingUp, title: "Expertise", desc: "Deep market knowledge backed by data." },
              { icon: Users, title: "Client-First", desc: "Your goals drive every decision we make." },
              { icon: Globe, title: "Reach", desc: "Nationwide network of buyers and sellers." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <Icon className="h-8 w-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-center text-foreground mb-10">Meet the Team</h2>
        <div className="grid sm:grid-cols-2 gap-8">
          {team.map(({ name, title, bio, img }) => (
            <div key={name} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
              <img src={img} alt={name} className="w-full h-56 object-cover object-top" />
              <div className="p-6">
                <h3 className="font-semibold text-lg text-foreground">{name}</h3>
                <p className="text-accent text-sm font-medium mb-2">{title}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="pb-16 text-center">
        <Button asChild size="lg">
          <Link to="/public/contact">Work With Us</Link>
        </Button>
      </div>
    </div>
  );
}