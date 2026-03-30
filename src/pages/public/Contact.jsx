import { useState } from "react";
import { Phone, Mail, Clock, MapPin, Send, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PublicContact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: "sales@flyclearblue.com",
      subject: `Website Contact: ${form.subject || 'General Inquiry'} — ${form.name}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nSubject: ${form.subject}\n\nMessage:\n${form.message}`,
    });
    setSending(false);
    setSent(true);
  };

  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <div className="bg-[#00447f] py-24 px-4 text-center">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Get in Touch</p>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
          Contact Us
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Ready to buy, sell, or just have questions? Our team is here to help.
        </p>
      </div>

      <section className="py-20 bg-[#f5f6f8]">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Reach Out</p>
              <h2 className="text-3xl font-black text-[#00447f] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>We'd Love to Hear from You</h2>
              <p className="text-gray-500 leading-relaxed">Whether you're looking to buy your first aircraft, sell your current one, or need an appraisal — our experienced team is ready to assist.</p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Phone, label: "Phone", value: "(386) 227-6840", href: "tel:+13862276840" },
                { icon: Mail, label: "Email", value: "sales@flyclearblue.com", href: "mailto:sales@flyclearblue.com" },
                { icon: Clock, label: "Hours", value: "Mon – Fri, 8 AM – 6 PM EST" },
                { icon: MapPin, label: "Location", value: "Florida, USA" },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#00447f' }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
                    {href
                      ? <a href={href} className="text-[#00447f] font-semibold hover:underline">{value}</a>
                      : <p className="text-gray-800 font-semibold">{value}</p>
                    }
                  </div>
                </div>
              ))}
            </div>
            <a href="https://www.facebook.com/clearblueaero/" target="_blank" rel="noopener noreferrer"
              className="inline-block text-sm font-semibold text-[#00447f] hover:underline mt-2">
              Follow us on Facebook →
            </a>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
                <CheckCircle className="w-14 h-14" style={{ color: '#00447f' }} />
                <h3 className="text-2xl font-black text-[#00447f]">Message Sent!</h3>
                <p className="text-gray-500">Thank you for reaching out. We'll be in touch within one business day.</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                  className="mt-2 px-6 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: '#00447f' }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-black text-[#00447f] mb-2">Send a Message</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name *</label>
                    <input required value={form.name} onChange={e => update('name', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors" placeholder="John Smith" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Email *</label>
                    <input required type="email" value={form.email} onChange={e => update('email', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                    <input value={form.phone} onChange={e => update('phone', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors" placeholder="(555) 123-4567" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Subject</label>
                    <input value={form.subject} onChange={e => update('subject', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors" placeholder="Buy / Sell / Appraisal" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Message *</label>
                  <textarea required value={form.message} onChange={e => update('message', e.target.value)} rows={5}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors resize-none"
                    placeholder="Tell us about the aircraft you're interested in, or how we can help…" />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white text-sm transition-all hover:brightness-110 disabled:opacity-60"
                  style={{ backgroundColor: '#00447f' }}>
                  <Send className="w-4 h-4" />
                  {sending ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}