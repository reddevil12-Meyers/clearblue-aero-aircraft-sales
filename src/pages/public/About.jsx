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

export default function PublicAbout() {
  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-[#1a3a5c] py-12 text-center">
        <h1 className="text-4xl font-bold text-white">About</h1>
      </div>

      {/* Main Content */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#5b99cc] text-center mb-10 leading-snug">
            The ultimate success of your aircraft sale<br />is safe in our experienced hands.
          </h2>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              <strong>ClearBlue Aero, Inc.</strong> is both a traditional and a new specialized aviation and consulting brokerage firm. We aim to continually provide honest, straightforward, and experienced aviation brokerage solutions to our clients and industry partners, allowing for seamless, high-quality success.
            </p>
            <p>
              Selling your aircraft on your own can be a daunting task, filled with many pitfalls, wasted time, and effort. Here at ClearBlue Aero, we manage both our sellers and prospective buyers with the same personal one-on-one attention and ensure 24/7 availability to assist you.
            </p>
            <p>
              <strong>Our owner</strong> has been successful in balancing the right mix of personalized attention and professionalism to make you feel at home and at ease throughout the selling and buying processes. A commercial airline pilot, long-time aviator of both factory and experimental aircraft, and successful corporate business executive himself, He has created the right environment allowing both sellers and buyers to experience positive and long-lasting friendly experiences.
            </p>
            <p className="text-[#5b99cc] font-semibold">Give us a try, you'll be glad you did.</p>
          </div>
        </div>
      </section>

      {/* Contact CTA + Form */}
      <section className="py-14 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-xl font-bold text-[#5b99cc] mb-3">We work with you as a team.</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              If you are still reading, we're thrilled to have your undivided attention. Let us know how we can work together to get you what you're looking for and want.
            </p>
            <div className="space-y-3">
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
    </div>
  );
}