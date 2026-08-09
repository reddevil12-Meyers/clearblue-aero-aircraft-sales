import { Link } from "react-router-dom";
import { Award, Shield, Users, Plane, ArrowRight, Phone, Quote } from "lucide-react";

const values = [
  { icon: Award, title: "Expert Knowledge", desc: "As pilot-brokers, we bring hands-on aviation experience to every transaction — not just sales experience." },
  { icon: Shield, title: "Integrity First", desc: "We represent our clients' interests with complete transparency and honest guidance throughout every deal." },
  { icon: Users, title: "Personal Service", desc: "We're not a high-volume operation. Every client gets direct access to an experienced broker from first call to closing." },
  { icon: Plane, title: "Pilot Operated", desc: "We fly what we sell. Our brokers are active pilots who understand aircraft from the cockpit perspective." }
];

export default function PublicAbout() {
  return (
    <div className="bg-white w-full">
      {/* Hero — full-width feature banner */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/347ae674c_home--07.png"
            alt="ClearBlue Aero cockpit at twilight"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#00447f]/70 via-[#00447f]/55 to-[#001a33]/70" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 py-32 md:py-44 text-center">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-[0.3em] mb-6">About Us</p>
          <h1 className="text-4xl md:text-7xl font-black text-white mb-6 leading-tight">
            Veteran Owned.<br />Pilot Operated.
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            ClearBlue Aero was founded on the principle that buying or selling an aircraft should be straightforward, transparent, and rewarding — guided by brokers who truly know aviation.
          </p>
          <div className="mt-12 flex items-center justify-center gap-6 text-white/40 text-xs uppercase tracking-widest">
            <span>Est. 2014</span>
            <span className="w-1 h-1 rounded-full bg-[#C9A84C]" />
            <span>Florida Based</span>
            <span className="w-1 h-1 rounded-full bg-[#C9A84C]" />
            <span>Nationwide</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#C9A84C]" />
      </section>

      {/* Story — full-width split feature */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden aspect-[4/3] shadow-xl">
              <img
                src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/72cf9886f_IMG_3075.jpeg"
                alt="ClearBlue Aero team"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -right-5 bg-[#00447f] text-white rounded-2xl p-6 shadow-2xl hidden md:block">
              <p className="text-4xl font-black text-[#C9A84C] leading-none">12+</p>
              <p className="text-xs text-white/60 mt-2 uppercase tracking-wider">Years Serving<br/>the Community</p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-[#C9A84C] mb-4 text-sm font-bold uppercase tracking-[0.25em]">Our Story</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#00447f] mb-8 leading-tight">
              Built by Pilots,<br />For Pilots
            </h2>
            <div className="space-y-5 text-gray-600 leading-relaxed">
              <p>ClearBlue Aero provides quality, honest, and safe aircraft sales and brokerage services to the general aviation community. Established in 2014 by aviation veterans with a passion for connecting pilots with the right aircraft, we are based in Florida and serve buyers and sellers across the country. We specialize in single-engine, twin-engine, and turboprop aircraft, with deep expertise in both factory and experimental types.</p>
              <p>As a veteran-owned business, we apply the same discipline, attention to detail, and commitment to mission success that defined our service careers to every aircraft transaction we handle. Our experienced staff are pilots and aircraft owners just like you. We understand the process from both sides of the deal and deliver professional, efficient, and easy-to-understand sales and purchase experiences that save you time and money.</p>
              <p>From appraisals and targeted marketing through to closing, our team has you covered. We maintain strong industry connections and a proven ability to match the right aircraft with the right buyer, bringing strong opportunities to the table and maximizing successful outcomes. With the combined strengths of Beechcraft Buyers and Gardner Aircraft Sales now under the ClearBlue Aero umbrella, your search just got easier. Whether you are buying your first aircraft, stepping up to a turboprop, or selling an estate aircraft, we provide the expert guidance and personalized service you deserve.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Our Founder — editorial feature */}
      <section className="py-20 md:py-28 bg-[#f5f6f8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Portrait */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden aspect-[4/5] shadow-xl">
                  <img
                    src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1119551d7_image.png"
                    alt="John Secord, Founder & Principal of ClearBlue Aero"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-5 left-5 right-5 bg-[#00447f] rounded-2xl px-6 py-5 shadow-2xl">
                  <p className="text-2xl font-black text-[#C9A84C] leading-none">John Secord</p>
                  <p className="text-xs text-white/60 mt-2 uppercase tracking-wider">Founder &amp; Principal</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="lg:col-span-7 lg:pt-8">
              <p className="text-[#C9A84C] mb-4 text-sm font-bold uppercase tracking-[0.25em]">About Our Founder</p>
              <h2 className="text-4xl md:text-5xl font-black text-[#00447f] mb-3">John Secord</h2>
              <p className="text-gray-400 text-sm font-semibold mb-8 uppercase tracking-widest">Founder &amp; Principal, ClearBlue Aero Aircraft Sales</p>

              <div className="relative bg-white rounded-2xl border-l-4 border-[#C9A84C] p-7 mb-8 shadow-sm">
                <Quote className="absolute -top-3 left-6 w-7 h-7 text-[#C9A84C]/30" />
                <p className="text-gray-700 italic leading-relaxed">
                  "As a pilot-owner and veteran, I built ClearBlue Aero to bring discipline, transparency, and genuine aviation expertise to every aircraft transaction we handle."
                </p>
              </div>

              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p>John Secord is the founder and principal of ClearBlue Aero and Avigint, Inc., and principal of Beechcraft Buyers. A proud disabled military veteran with 20+ years of experience in both general aviation and professional airlines. An ATP and Commercial-rated pilot, John has accumulated thousands of hours across a wide range of factory, experimental, and transport-category aircraft, including his last on the B767 & B757. A passionate aircraft owner and active pilot, John combines hands-on enthusiasm for general aviation with the discipline of professional crew operations. His expertise spans aircraft acquisition, brokerage, and consulting, making him a trusted guide for buyers and sellers navigating the aviation private and corporate markets.</p>
                <p>In addition to his aviation accomplishments, John is a dedicated husband to an airline pilot and a proud father and grandfather. Together with his family and supported by a highly professional and experienced aviation team, he brings a personal passion for aviation that drives ClearBlue Aero's commitment to exceptional client service, integrity, and long-term relationships in the aviation community.</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-[#C9A84C] mb-4 text-sm font-bold uppercase tracking-[0.25em]">What Drives Us</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#00447f]">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) =>
              <div key={title} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
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
      <section className="py-20 md:py-28 bg-[#00447f] text-center px-4">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-[0.3em] mb-5">Work With Us</p>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-5">Let's Find Your Aircraft</h2>
        <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">Reach out and let's talk about your aviation goals. We're here to help.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/contact" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm hover:brightness-110 transition-all" style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
            Contact Us <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="tel:+13862276840" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/20 hover:bg-white/10 transition-all">
            <Phone className="w-4 h-4" /> (386) 227-6840
          </a>
        </div>
      </section>
    </div>
  );
}