import { useState } from 'react';
import { Phone, Mail } from 'lucide-react';

export default function PublicContact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <div>
      <div className="bg-[#1a3a5c] text-white py-12 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Contact Us</h1>
      </div>

      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1a3a5c] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>We work with you as a team.</h2>
              <p className="text-gray-600 leading-relaxed">
                If you are still reading, we're thrilled to have your undivided attention. Let us know how we can work together to get you what you're looking for and want.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#e8f0f8] rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-[#1a3a5c]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1a3a5c] mb-0.5">Want to Talk?</p>
                  <p className="text-sm text-gray-600">Call us at</p>
                  <a href="tel:8502703331" className="text-[#2a6aad] font-bold text-lg hover:underline">(850) 270-3331</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#e8f0f8] rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-[#1a3a5c]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1a3a5c] mb-0.5">Rather E-mail?</p>
                  <p className="text-sm text-gray-600">E-mail us at</p>
                  <a href="mailto:info@flyclearblue.com" className="text-[#2a6aad] font-bold hover:underline">info@flyclearblue.com</a>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#1a3a5c] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>We'd love to hear from you.</h2>
            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <p className="text-green-700 font-semibold text-lg">Thank you for reaching out!</p>
                <p className="text-green-600 text-sm mt-1">We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
                <input required placeholder="Name *" value={form.name} onChange={set('name')} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#2a6aad]" />
                <input required type="email" placeholder="E-mail *" value={form.email} onChange={set('email')} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#2a6aad]" />
                <input required placeholder="Telephone *" value={form.phone} onChange={set('phone')} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#2a6aad]" />
                <textarea required placeholder="Message *" rows={5} value={form.message} onChange={set('message')} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#2a6aad] resize-none" />
                <button type="submit" className="bg-[#2a6aad] text-white px-8 py-3 rounded-md font-semibold hover:bg-[#1a5a9d] transition w-full">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}