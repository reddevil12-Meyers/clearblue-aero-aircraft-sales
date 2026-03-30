import { useState } from "react";
import { base44 } from "@/api/base44Client";

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
    <div className="text-center py-8">
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

export default function PublicAbout() {
  return (
    <div>
      {/* Hero */}
      <div className="relative py-32 px-6 text-center overflow-hidden" style={{ backgroundColor: '#0a1628' }}>
        <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">Our Story</p>
        <h1 className="text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>About ClearBlue Aero</h1>
        <p className="text-white/50 max-w-xl mx-auto leading-relaxed">Experienced aviators. Honest brokers. Your trusted aviation partner.</p>
      </div>

      {/* Main */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-amber-600 text-xs font-semibold uppercase tracking-[0.2em] mb-4">Who We Are</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              The ultimate success of your aircraft sale is in safe hands.
            </h2>
            <div className="space-y-4 text-gray-500 leading-relaxed">
              <p>
                <strong className="text-gray-800">ClearBlue Aero, Inc.</strong> is both a traditional and specialized aviation consulting and brokerage firm. We aim to continually provide honest, straightforward, and experienced aviation brokerage solutions to our clients and industry partners, allowing for seamless, high-quality success.
              </p>
              <p>
                Selling your aircraft on your own can be a daunting task, filled with many pitfalls, wasted time, and effort. Here at ClearBlue Aero, we manage both our sellers and prospective buyers with the same personal one-on-one attention and ensure 24/7 availability to assist you.
              </p>
              <p>
                Our owner has been successful in balancing the right mix of personalized attention and professionalism. A commercial airline pilot, long-time aviator of both factory and experimental aircraft, and successful corporate business executive — he's created an environment where both sellers and buyers experience positive, lasting outcomes.
              </p>
            </div>
            <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200">
              Give us a try — you'll be glad you did.
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img src="https://www.flyclearblue.com/wp-content/uploads/2025/08/1000014735-1-scaled.jpg" alt="ClearBlue Aero" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-600 text-xs font-semibold uppercase tracking-[0.2em] mb-4">What Drives Us</p>
            <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Our Core Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Integrity", desc: "Honest, transparent communication throughout every transaction — no surprises, no hidden agendas." },
              { title: "Expertise", desc: "Decades of aviation experience means we understand your aircraft and the market deeply." },
              { title: "Service", desc: "24/7 availability and personal attention for every client, every step of the way." },
            ].map(v => (
              <div key={v.title} className="p-8 bg-white rounded-2xl border border-gray-100">
                <div className="w-8 h-0.5 bg-amber-400 mb-5"></div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 px-6" style={{ backgroundColor: '#0a1628' }}>
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">Get in Touch</p>
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>We work with you as a team.</h2>
            <p className="text-white/50 leading-relaxed mb-8">Let us know how we can work together to get you what you're looking for.</p>
            <div className="space-y-3 text-sm text-white/60">
              <p><a href="tel:+13862276840" className="hover:text-white transition-colors">(386) 227-6840</a></p>
              <p><a href="mailto:info@flyclearblue.com" className="hover:text-white transition-colors">info@flyclearblue.com</a></p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h3>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}