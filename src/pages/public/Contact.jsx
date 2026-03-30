import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Mail, Clock, MapPin, CheckCircle, Facebook } from "lucide-react";

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
    <div>
      <div className="py-20 text-white text-center" style={{ backgroundColor: '#0a1628' }}>
        <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Contact Us</h1>
        <p className="text-white/60 text-xl max-w-xl mx-auto">We're here to help with any questions about buying, selling, or appraising aircraft.</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Get in Touch</h2>
          <div className="space-y-6 mb-10">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#0a1628' }}>
                <Phone className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Phone</p>
                <a href="tel:+13862276840" className="text-amber-600 hover:text-amber-700 transition-colors">(386) 227-6840</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#0a1628' }}>
                <Mail className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <a href="mailto:sales@flyclearblue.com" className="text-amber-600 hover:text-amber-700 transition-colors">sales@flyclearblue.com</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#0a1628' }}>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Business Hours</p>
                <p className="text-gray-500 text-sm">Monday – Friday, 8:00 AM – 6:00 PM EST</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#0a1628' }}>
                <Facebook className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Social Media</p>
                <a href="https://www.facebook.com/clearblueaero/" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 transition-colors text-sm">facebook.com/clearblueaero</a>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
            <p className="text-sm text-amber-800 font-semibold mb-1">Veteran Owned Business</p>
            <p className="text-sm text-amber-700 leading-relaxed">ClearBlue Aero is proudly veteran owned and operated. We bring the same dedication and integrity we learned in service to every aircraft transaction.</p>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Send Us a Message</h3>
            {sent ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-green-500" />
                </div>
                <p className="font-semibold text-gray-800 text-lg mb-2">Message Sent!</p>
                <p className="text-gray-500 text-sm">Thank you for reaching out. We'll get back to you within 1 business day.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name *</label>
                    <input required type="text" value={form.name} onChange={e => update('name', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address *</label>
                    <input required type="email" value={form.email} onChange={e => update('email', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Subject</label>
                  <select value={form.subject} onChange={e => update('subject', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                    <option value="">Select a topic...</option>
                    <option>Buying an Aircraft</option>
                    <option>Selling an Aircraft</option>
                    <option>Aircraft Appraisal</option>
                    <option>Insurance & Financing</option>
                    <option>General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Message *</label>
                  <textarea required rows={5} value={form.message} onChange={e => update('message', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" placeholder="Tell us how we can help..." />
                </div>
                <button type="submit" disabled={sending} className="w-full py-3.5 rounded-xl text-white font-semibold transition-all disabled:opacity-60" style={{ backgroundColor: '#0a1628' }}>
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}