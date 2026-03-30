import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Mail, Clock, CheckCircle, Facebook, ArrowRight } from "lucide-react";

const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 bg-[#f5f6f8] text-[#050d1a] font-medium";

export default function PublicContact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: "sales@flyclearblue.com",
      subject: `Contact Form: ${form.subject || 'General Inquiry'}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`,
    });
    setSending(false);
    setSent(true);
  };

  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <div className="bg-[#050d1a] py-20 text-center px-4">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Get In Touch</p>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Contact Us
        </h1>
        <p className="text-white/40 text-lg max-w-xl mx-auto">
          Our brokers respond to all inquiries within one business day.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-5 gap-10 lg:gap-16">
        {/* Left */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-6">Direct Contact</p>
            <div className="space-y-5">
              {[
                { icon: Phone, label: "Phone", content: <a href="tel:+13862276840" className="text-[#050d1a] font-black text-lg hover:text-[#C9A84C] transition-colors">(386) 227-6840</a> },
                { icon: Mail, label: "Email", content: <a href="mailto:sales@flyclearblue.com" className="text-[#050d1a] font-bold hover:text-[#C9A84C] transition-colors break-all">sales@flyclearblue.com</a> },
                { icon: Clock, label: "Hours", content: <p className="text-gray-500 font-medium">Mon – Fri, 8 AM – 6 PM EST</p> },
                { icon: Facebook, label: "Social", content: <a href="https://www.facebook.com/clearblueaero/" target="_blank" rel="noopener noreferrer" className="text-[#050d1a] font-bold hover:text-[#C9A84C] transition-colors">Facebook →</a> },
              ].map(({ icon: Icon, label, content }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#050d1a' }}>
                    <Icon className="w-5 h-5 text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                    {content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#050d1a] rounded-2xl p-7">
            <div className="w-8 h-0.5 mb-5" style={{ backgroundColor: '#C9A84C' }} />
            <p className="font-black text-white text-lg mb-3">Veteran Owned Business</p>
            <p className="text-white/40 text-sm leading-relaxed">
              ClearBlue Aero was founded by veterans who bring military precision and unwavering integrity to every aircraft transaction.
            </p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-sm">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-3">Send a Message</p>
            <h2 className="text-2xl md:text-3xl font-black text-[#050d1a] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
              How Can We Help?
            </h2>
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#C9A84C' }}>
                  <CheckCircle className="w-8 h-8 text-[#050d1a]" />
                </div>
                <p className="text-xl font-black text-[#050d1a] mb-2">Message Sent</p>
                <p className="text-gray-400">We'll respond within one business day.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name *</label>
                    <input required type="text" value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email *</label>
                    <input required type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Topic</label>
                  <select value={form.subject} onChange={e => update('subject', e.target.value)} className={inputClass}>
                    <option value="">Select a topic...</option>
                    <option>Buying an Aircraft</option>
                    <option>Selling an Aircraft</option>
                    <option>Aircraft Appraisal</option>
                    <option>Aircraft Maintenance</option>
                    <option>Insurance & Financing</option>
                    <option>General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message *</label>
                  <textarea required rows={5} value={form.message} onChange={e => update('message', e.target.value)} className={`${inputClass} resize-none`} placeholder="Tell us how we can help..." />
                </div>
                <button type="submit" disabled={sending} className="w-full py-4 rounded-xl font-black text-[#050d1a] text-sm flex items-center justify-center gap-3 transition-all hover:brightness-110 disabled:opacity-60" style={{ backgroundColor: '#C9A84C' }}>
                  {sending ? "Sending..." : <><span>Send Message</span> <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}