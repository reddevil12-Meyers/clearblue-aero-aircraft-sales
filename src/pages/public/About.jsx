import { Link } from "react-router-dom";
import { Award, Shield, Users, Plane, ArrowRight, Phone } from "lucide-react";

const values = [
{ icon: Award, title: "Expert Knowledge", desc: "As pilot-brokers, we bring hands-on aviation experience to every transaction — not just sales experience." },
{ icon: Shield, title: "Integrity First", desc: "We represent our clients' interests with complete transparency and honest guidance throughout every deal." },
{ icon: Users, title: "Personal Service", desc: "We're not a high-volume operation. Every client gets direct access to an experienced broker from first call to closing." },
{ icon: Plane, title: "Pilot Operated", desc: "We fly what we sell. Our brokers are active pilots who understand aircraft from the cockpit perspective." }];


export default function PublicAbout() {
  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <div className="bg-[#00447f] py-24 px-4 text-center">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">About Us</p>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
          Veteran Owned.<br />Pilot Operated.
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
          ClearBlue Aero was founded on the principle that buying or selling an aircraft should be straightforward, transparent, and rewarding — guided by brokers who truly know aviation.
        </p>
      </div>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/d1ae025ab_baron.png"

              alt="ClearBlue Aero team" className="w-full h-full object-cover" />

              
            </div>
            <div className="absolute -bottom-4 -right-4 bg-[#00447f] text-white rounded-2xl p-5 shadow-2xl hidden md:block">
              <p className="text-3xl font-black text-[#C9A84C]">12+ Years</p>
              <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">SERVING THE COMMUNITY</p>
            </div>
          </div>
          <div>
            <p className="text-[#130e01] mb-4 text-lg font-bold uppercase tracking-widest">OUR STORY</p>
            <h2 className="text-4xl font-black text-[#00447f] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Built by Pilots,<br />For Pilots
            </h2>
            <div className="space-y-4 text-gray-500 leading-relaxed">
              <p>ClearBlue Aero was established in 2014 by aviation veterans with a passion for connecting pilots with the right aircraft. Based in Florida, we have been serving buyers and sellers across the country, specializing in single-engine, twin-engine, and turboprop aircraft.

              </p>
              <p>As a veteran-owned business, we bring the same discipline, attention to detail, and commitment to mission success that defined our service careers - now applied to every aircraft transaction we handle.

              </p>
              <p>
                Whether you're purchasing your first aircraft, upgrading to a turboprop, or selling an estate aircraft, ClearBlue Aero provides the expert guidance and personalized service you deserve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#f5f6f8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">What Drives Us</p>
            <h2 className="text-4xl font-black text-[#00447f]" style={{ fontFamily: "'Playfair Display', serif" }}>Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) =>
            <div key={title} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: '#00447f' }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-black text-[#00447f] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#00447f] text-center px-4">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">Work With Us</p>
        <h2 className="text-4xl font-black text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>Let's Find Your Aircraft</h2>
        <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">Reach out and let's talk about your aviation goals. We're here to help.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/public/contact" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm hover:brightness-110 transition-all" style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
            Contact Us <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="tel:+13862276840" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/20 hover:bg-white/10 transition-all">
            <Phone className="w-4 h-4" /> (386) 227-6840
          </a>
        </div>
      </section>
    </div>);

}