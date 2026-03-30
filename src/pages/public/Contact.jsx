import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function PublicContact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 bg-white transition-colors";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "info@flyclearblue.com",
        subject: `Contact Form Submission from ${form.name}`,
        body: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`
      });
    } catch {}
    setSending(false);
    setSent(true);
  };

  return (
    <div>
      {/* Hero */}
      <div className="relative py-32 px-6 text-center" style={{ backgroundColor: '#0a1628' }}>
        <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">Let's Connect</p>
        <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Get in Touch</h1>
        <p className="text-white/50 max-w-md mx-auto">Whether you're buying, selling, or just exploring — we'd love to hear from you.</p>
      </div>

      {/* Contact cards */}
      <section className="py-16 px-6 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-5">
          <a href="tel:+13862276840" className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#0a1628' }}>
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Phone</p>
              <p className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">(386) 227-6840</p>
              <p className="text-xs text-gray-400 mt-0.5">Mon – Fri, 8 AM – 6 PM</p>
            </div>
          </a>
          <a href="mailto:info@flyclearblue.com" className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#0a1628' }}>
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Email</p>
              <p className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">info@flyclearblue.com</p>
              <p className="text-xs text-gray-400 mt-0.5">We respond within 24 hours</p>
            </div>
          </a>
        </div>
      </section>

      {/* Form */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-600 text-xs font-semibold uppercase tracking-[0.2em] mb-4">Send a Message</p>
            <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>We'd love to hear from you.</h2>
          </div>

          {sent ? (
            <div className="text-center py-16 border border-gray-100 rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-500 mb-8">We'll be in touch shortly.</p>
              <button className="text-sm font-medium text-amber-600 hover:underline" onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: "" }); }}>
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input required className={inputClass} placeholder="Your name" value={form.name} onChange={e => update("name", e.target.value)} />
                <input required type="email" className={inputClass} placeholder="Email address" value={form.email} onChange={e => update("email", e.target.value)} />
              </div>
              <input required className={inputClass} placeholder="Phone number" value={form.phone} onChange={e => update("phone", e.target.value)} />
              <textarea required rows={6} className={inputClass} placeholder="How can we help you?" value={form.message} onChange={e => update("message", e.target.value)} />
              <button type="submit" disabled={sending} className="w-full py-4 text-sm font-bold text-white rounded-xl transition-colors" style={{ backgroundColor: '#0a1628' }}>
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}