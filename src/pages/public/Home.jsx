import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowRight, ChevronRight } from "lucide-react";

const STATUS_BADGE = {
  "Available": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Under Contract": "bg-amber-50 text-amber-700 border border-amber-200",
  "Sold": "bg-gray-100 text-gray-500 border border-gray-200",
  "Off Market": "bg-red-50 text-red-600 border border-red-200",
};
const STATUS_ORDER = { "Available": 0, "Under Contract": 1, "Sold": 2, "Off Market": 3 };

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

const SLIDES = [
  "https://www.flyclearblue.com/wp-content/uploads/2025/08/1000014735-1-scaled.jpg",
  "https://www.flyclearblue.com/wp-content/uploads/2017/10/right_front_low.png",
  "https://www.flyclearblue.com/wp-content/uploads/2018/01/home-page.png",
];

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "info@flyclearblue.com",
        subject: `Contact Form from ${form.name}`,
        body: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`
      });
    } catch {}
    setSending(false);
    setSent(true);
  };
  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 bg-white transition-colors";
  if (sent) return (
    <div className="text-center py-12">
      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      </div>
      <p className="font-semibold text-gray-800">Message sent!</p>
      <p className="text-sm text-gray-500 mt-1">We'll be in touch shortly.</p>
    </div>
  );
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input required className={inputClass} placeholder="Your name" value={form.name} onChange={e => update("name", e.target.value)} />
      <input required type="email" className={inputClass} placeholder="Email address" value={form.email} onChange={e => update("email", e.target.value)} />
      <input required className={inputClass} placeholder="Phone number" value={form.phone} onChange={e => update("phone", e.target.value)} />
      <textarea required rows={4} className={inputClass} placeholder="How can we help?" value={form.message} onChange={e => update("message", e.target.value)} />
      <button type="submit" disabled={sending} className="w-full py-3 text-sm font-semibold text-white rounded-lg transition-colors" style={{ backgroundColor: '#0a1628' }}>
        {sending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

export default function PublicHome() {
  const [slide, setSlide] = useState(0);
  const [aircraft, setAircraft] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    base44.entities.Aircraft.filter({ show_on_public: true }, '-created_date', 50)
      .then(data => {
        setAircraft([...data].sort((a, b) => (STATUS_ORDER[a.status] ?? 4) - (STATUS_ORDER[b.status] ?? 4)));
      }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <div className="relative w-full h-[88vh] min-h-[560px] overflow-hidden" style={{ backgroundColor: '#0a1628' }}>
        {SLIDES.map((src, i) => (
          <img key={i} src={src} alt="" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1500 ${i === slide ? 'opacity-30' : 'opacity-0'}`} />
        ))}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">Aircraft Sales · Acquisitions · Leasing</p>
          <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 max-w-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Aircraft.<br />Our Expertise.
          </h1>
          <p className="text-white/60 text-lg max-w-xl mb-10 leading-relaxed">
            Experienced aviators helping pilots buy and sell aircraft with confidence, transparency, and care.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/public/inventory" className="px-8 py-3.5 text-sm font-semibold text-white rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
              Browse Inventory
            </Link>
            <Link to="/public/sell" className="px-8 py-3.5 text-sm font-semibold rounded-lg transition-colors" style={{ backgroundColor: '#c9a84c', color: '#0a1628' }}>
              Sell My Plane
            </Link>
          </div>
        </div>
        {/* Slide dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === slide ? 'bg-amber-400 w-5' : 'bg-white/30'}`} />
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-amber-50 border-y border-amber-100">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-3 divide-x divide-amber-200 text-center">
          {[
            { value: "20+", label: "Years Experience" },
            { value: "500+", label: "Aircraft Sold" },
            { value: "100%", label: "Client Focus" },
          ].map(s => (
            <div key={s.label} className="px-6">
              <p className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{s.value}</p>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Intro */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-amber-600 text-xs font-semibold uppercase tracking-[0.2em] mb-4">Who We Are</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Specialized Aviation Brokerage
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              ClearBlue Aero provides quality, honest, and safe aircraft sales and brokerage services to the general aviation community. With expertise in factory and experimental aircraft, we deliver professional, transparent experiences for both sellers and buyers.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              Our owner is a commercial airline pilot, long-time aviator, and corporate business executive — bringing the ideal mix of aviation knowledge and business acumen to every transaction.
            </p>
            <Link to="/public/about" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-amber-600 transition-colors">
              Learn more about us <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden aspect-[3/4]">
              <img src="https://www.flyclearblue.com/wp-content/uploads/2017/10/right_front_low.png" alt="Aircraft" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-[3/4] mt-8">
              <img src="https://www.flyclearblue.com/wp-content/uploads/2018/01/home-page.png" alt="Aircraft" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Inventory Snapshot */}
      {aircraft.length > 0 && (
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
              <div>
                <p className="text-amber-600 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Current Listings</p>
                <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Featured Aircraft</h2>
              </div>
              <Link to="/public/inventory" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-amber-600 transition-colors whitespace-nowrap">
                View all inventory <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {aircraft.slice(0, 8).map(ac => (
                <Link key={ac.id} to={`/public/inventory/${ac.id}`} className="bg-white rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                    {ac.images?.[0]
                      ? <img src={ac.images[0]} alt={`${ac.year} ${ac.make} ${ac.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Photo</div>
                    }
                    {ac.status && (
                      <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[ac.status] || 'bg-gray-100 text-gray-600'}`}>
                        {ac.status}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="font-bold text-gray-900 truncate mb-1">{ac.year} {ac.make} {ac.model}</p>
                    {ac.registration && <p className="text-xs text-gray-400 mb-2">{ac.registration}</p>}
                    {ac.asking_price && ac.status !== 'Sold' && (
                      <p className="text-amber-600 font-bold text-lg">${ac.asking_price.toLocaleString()}</p>
                    )}
                    {ac.status === 'Sold' && <p className="text-gray-400 font-medium text-sm">Sold</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <p className="text-amber-600 text-xs font-semibold uppercase tracking-[0.2em] mb-4">What We Offer</p>
          <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Full-Service Brokerage</h2>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { title: "Aircraft Sales", desc: "We connect motivated sellers with qualified buyers using our extensive network and proven marketing approach.", icon: "✈️" },
            { title: "Acquisitions", desc: "Looking for a specific aircraft? We leverage our industry connections to locate the right plane at the right price.", icon: "🔍" },
            { title: "Appraisals", desc: "Professional aircraft valuations for sales, insurance, financing, estate planning, and legal purposes.", icon: "📋" },
          ].map(s => (
            <div key={s.title} className="text-center p-8 rounded-2xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
              <div className="text-4xl mb-5">{s.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-6" style={{ backgroundColor: '#0a1628' }}>
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">Let's Talk</p>
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Ready to Buy or Sell?
            </h2>
            <p className="text-white/50 leading-relaxed mb-10">
              Whether you're ready to list your aircraft or searching for your next one, we're here to make the process seamless. Reach out and let's get started.
            </p>
            <div className="space-y-5">
              <a href="tel:+13862276840" className="flex items-center gap-4 text-white/70 hover:text-white transition-colors">
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <span className="text-sm">(386) 227-6840</span>
              </a>
              <a href="mailto:sales@flyclearblue.com" className="flex items-center gap-4 text-white/70 hover:text-white transition-colors">
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-sm">sales@flyclearblue.com</span>
              </a>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h3>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 px-6 bg-gray-50 border-t border-gray-100">
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