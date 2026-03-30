import { Link } from "react-router-dom";

const PARTNERS = [
  { name: "Lima Bravo Aviation", url: "https://limabravoaviation.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2016/06/LB-logo-2024-300x94.png" },
  { name: "Columbus Aero Service", url: "http://www.columbusaeroservice.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2016/06/Columbus-Aero_144x144.png" },
  { name: "Gann Aviation", url: "http://www.gannaviation.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2017/12/Gann-Logo.png" },
  { name: "Beechcraft Buyers", url: "http://www.beechcraftbuyersandsellers.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2017/12/large-color-logo.jpg" },
  { name: "Maule Aircraft", url: "http://mauleairinc.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2017/08/MAULE-STOL-AIRCRAFT-e1755096940708.png" },
  { name: "Banterra Aircraft Financing", url: "http://www.banterraaircraft.com/loans/overview", img: "https://www.flyclearblue.com/wp-content/uploads/2017/08/logo-aircraft.png" },
  { name: "Global Corporate Services", url: "http://www.global-inter.net/", img: "https://www.flyclearblue.com/wp-content/uploads/2016/06/Global.png" },
  { name: "Falcon Insurance", url: "http://www.falconinsurance.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2016/06/falcon-lrg.jpg" },
];

const STEPS = [
  { step: "01", title: "Submit Your Info", desc: "Fill out our quick aircraft entry form with your plane's details. Takes less than 5 minutes." },
  { step: "02", title: "We Assess & Price", desc: "We review your aircraft and provide a professional market valuation and pricing strategy." },
  { step: "03", title: "We Market It", desc: "Your aircraft is listed across our network, partner channels, and aviation marketplaces." },
  { step: "04", title: "You Get Paid", desc: "We handle negotiations, paperwork, and closing — you receive your funds with confidence." },
];

export default function PublicSellYourPlane() {
  return (
    <div>
      {/* Hero */}
      <div className="relative py-32 px-6 text-center overflow-hidden" style={{ backgroundColor: '#0a1628' }}>
        <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">Sell with Confidence</p>
        <h1 className="text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          Tell Us About Your Plane
        </h1>
        <p className="text-white/50 max-w-xl mx-auto leading-relaxed mb-10">
          Looking to upgrade, downgrade, or move on? Our experienced team handles everything — from appraisal to closing — so you don't have to.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/public/sell/single-engine" className="px-8 py-4 text-sm font-bold rounded-lg transition-colors" style={{ backgroundColor: '#c9a84c', color: '#0a1628' }}>
            Single Engine Entry Form
          </Link>
          <Link to="/public/sell/twin-engine" className="px-8 py-4 text-sm font-bold rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors">
            Twin Engine Entry Form
          </Link>
        </div>
      </div>

      {/* Process */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-600 text-xs font-semibold uppercase tracking-[0.2em] mb-4">The Process</p>
            <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>How It Works</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map(s => (
              <div key={s.step} className="relative">
                <p className="text-5xl font-black text-gray-100 mb-4 leading-none">{s.step}</p>
                <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img src="https://www.flyclearblue.com/wp-content/uploads/2017/10/right_front_low.png" alt="Aircraft" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-amber-600 text-xs font-semibold uppercase tracking-[0.2em] mb-4">Why ClearBlue Aero</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Superior Service. Experienced Aviators. Results.
            </h2>
            <div className="space-y-4 text-gray-500 leading-relaxed mb-8">
              <p>
                Most experienced airplane owners will tell you that selling an aircraft is no easy task. Let our professional staff — pilots and aircraft owners themselves — save you time and money.
              </p>
              <p>
                From appraisals and marketing to negotiations and closing, our team has you covered. We use well-developed communication networks to find the right buyer and bring the best sales opportunity to your door.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a href="tel:+13862276840" className="px-6 py-3 text-sm font-bold rounded-lg text-white transition-colors" style={{ backgroundColor: '#0a1628' }}>
                Call (386) 227-6840
              </a>
              <Link to="/public/contact" className="text-sm font-semibold text-gray-900 hover:text-amber-600 transition-colors">
                Or send a message →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-10">Trusted Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-10">
            {PARTNERS.map(p => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" title={p.name}>
                <img src={p.img} alt={p.name} className="h-10 object-contain grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}