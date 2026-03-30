import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const SLIDES = [
  "https://www.flyclearblue.com/wp-content/uploads/2017/10/right_front_low.png",
  "https://www.flyclearblue.com/wp-content/uploads/2018/01/home-page.png",
  "https://www.flyclearblue.com/wp-content/uploads/2025/08/1000014735-1-scaled.jpg",
];

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
  if (sent) return <p className="text-green-600 font-semibold py-8 text-center">Message sent! We'll be in touch soon.</p>;
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Name *" value={form.name} onChange={e => update("name", e.target.value)} />
      <input required type="email" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="E-mail *" value={form.email} onChange={e => update("email", e.target.value)} />
      <input required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Telephone *" value={form.phone} onChange={e => update("phone", e.target.value)} />
      <textarea required rows={5} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Message *" value={form.message} onChange={e => update("message", e.target.value)} />
      <div className="flex gap-3 items-center">
        <button type="submit" disabled={sending} className="bg-[#1a3a5c] text-white px-5 py-2 rounded text-sm font-medium hover:bg-[#14304d] transition-colors">{sending ? "Sending..." : "Send message"}</button>
        <button type="button" onClick={() => setForm({ name: "", email: "", phone: "", message: "" })} className="text-sm text-gray-500 underline">clear</button>
      </div>
    </form>
  );
}

export default function PublicHome() {
  const [slide, setSlide] = useState(0);
  const [aircraft, setAircraft] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    base44.entities.Aircraft.filter({ show_on_public: true }, '-created_date', 12)
      .then(setAircraft).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Slider */}
      <div className="relative w-full h-[500px] overflow-hidden bg-[#1a3a5c]">
        {SLIDES.map((src, i) => (
          <img key={i} src={src} alt="" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === slide ? 'opacity-100' : 'opacity-0'}`} />
        ))}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === slide ? 'bg-white' : 'bg-white/40'}`} />
          ))}
        </div>
      </div>

      {/* Intro Section */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1a3a5c] mb-4">Specialized Aviation Sales and Acquisitions</h2>
          <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto mb-4">
            ClearBlue Aero provides quality, honest, and safe aircraft sales and brokerage services to the general aviation community. With expertise in factory and experimental aircraft, we offer professional, efficient, and easy-to-understand aircraft sales and purchase experiences for both seller and buyer.
          </p>
          <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
            <strong>We are additionally closely partnered with Beechcraft Buyers,</strong> offering even wider aviation community outreach, knowledge, and availability. Give us a try and quickly see why we are quickly becoming your aircraft brokerage firm of choice!
          </p>
        </div>
      </section>

      {/* Inventory Snapshot */}
      {aircraft.length > 0 && (
        <section className="py-12 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-xl font-bold text-[#1a3a5c] mb-6 text-center">Inventory Snapshot</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {aircraft.slice(0, 8).map(ac => (
                <Link key={ac.id} to={`/public/inventory/${ac.id}`} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    {ac.images?.[0]
                      ? <img src={ac.images[0]} alt={`${ac.year} ${ac.make} ${ac.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Photo</div>
                    }
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-[#1a3a5c] truncate">{ac.year} {ac.make} {ac.model}</p>
                    {ac.asking_price && <p className="text-xs text-[#5b99cc] font-medium mt-0.5">${ac.asking_price.toLocaleString()}</p>}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/public/inventory" className="inline-block bg-[#1a3a5c] text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-[#14304d] transition-colors">View All Inventory</Link>
            </div>
          </div>
        </section>
      )}

      {/* We Work With You Section + Contact Form */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-xl font-bold text-[#1a3a5c] mb-2">We work with you as a team.</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              If you are still reading, we're thrilled to have your undivided attention. Let us know how we can work together to get you what you're looking for and want.
            </p>
            <div className="space-y-3 mb-6">
              <p className="text-gray-700"><strong>Want to Talk?</strong> Call us at <a href="tel:+13862276840" className="text-[#5b99cc] hover:underline">(386) 227-6840</a></p>
              <p className="text-gray-700"><strong>Rather E-mail?</strong> E-mail us at <a href="mailto:info@flyclearblue.com" className="text-[#5b99cc] hover:underline">info@flyclearblue.com</a></p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#1a3a5c] mb-5">We'd love to hear from you.</h3>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-12 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-lg font-bold text-[#1a3a5c] text-center mb-8 uppercase tracking-widest">Our Trusted Partners</h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {PARTNERS.map(p => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" title={p.name}>
                <img src={p.img} alt={p.name} className="h-14 object-contain grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}