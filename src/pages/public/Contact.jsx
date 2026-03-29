import { useState } from 'react';
import { Phone, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PublicContact() {
  const [form, setForm] = useState({ name: '', email: '', telephone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: 'sales@flyclearblue.com',
      subject: `Contact Form: ${form.name}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.telephone}\n\nMessage:\n${form.message}`,
    });
    setSending(false);
    setSubmitted(true);
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-[#1a3a5c] text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Contact Us</h1>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-16">
        {/* Left */}
        <div>
          <h2 className="text-2xl font-bold text-[#1a3a5c] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>We work with you as a team.</h2>
          <p className="text-gray-600 mb-8">
            If you are still reading, we're thrilled to have your undivided attention. Let us know how we can work together to get you what you're looking for and want.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#e8f0f8] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-[#1a3a5c]" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Want to Talk?</p>
                <p className="text-gray-500 text-sm">Call us at</p>
                <a href="tel:8502276840" className="text-[#1a3a5c] font-semibold hover:underline">(850) 227-6840</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#e8f0f8] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#1a3a5c]" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Rather E-mail?</p>
                <p className="text-gray-500 text-sm">E-mail us at</p>
                <a href="mailto:info@flyclearblue.com" className="text-[#1a3a5c] font-semibold hover:underline">info@flyclearblue.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div>
          <h2 className="text-2xl font-bold text-[#1a3a5c] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>We'd love to hear from you.</h2>
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-700 font-semibold text-lg">Message Sent!</p>
              <p className="text-green-600 text-sm mt-1">We'll get back to you as soon as possible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name *"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
              <input
                type="email"
                placeholder="E-mail *"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
              <input
                type="tel"
                placeholder="Telephone *"
                required
                value={form.telephone}
                onChange={e => setForm({ ...form, telephone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
              <textarea
                placeholder="Message *"
                required
                rows={6}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] resize-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-[#1a3a5c] text-white py-3 rounded-md font-semibold hover:bg-[#152f4a] transition-colors disabled:opacity-60"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}