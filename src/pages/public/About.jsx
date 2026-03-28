import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Shield, Users, Star } from 'lucide-react';

export default function PublicAbout() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <div>
      <div className="bg-[#1a3a5c] text-white py-12 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>About</h1>
      </div>

      <section className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#2a6aad] mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            The ultimate success of your aircraft sale<br />is safe in our experienced hands.
          </h2>
          <div className="text-gray-600 text-base leading-relaxed space-y-4 text-left max-w-3xl mx-auto">
            <p>
              <strong>ClearBlue Aero, Inc.</strong> is both a traditional and a new specialized aviation and consulting brokerage firm. We aim to continually provide honest, straightforward, and experienced aviation brokerage solutions to our clients and industry partners, allowing for seamless, high-quality success.
            </p>
            <p>
              Selling your aircraft on your own can be a daunting task, filled with many pitfalls, wasted time, and effort. Here at ClearBlue Aero, we manage both our sellers and prospective buyers with the same personal one-on-one attention and ensure 24/7 availability to assist you.
            </p>
            <p>
              <strong>Our owner</strong> has been successful in balancing the right mix of personalized attention and professionalism to make you feel at home and at ease throughout the selling and buying processes. A commercial airline pilot, long-time aviator of both factory and experimental aircraft, and successful corporate business executive himself, he has created the right environment allowing both sellers and buyers to experience positive and long-lasting friendly experiences.
            </p>
            <p className="text-[#2a6aad] font-semibold italic text-center">Give us a try, you'll be glad you did.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 px-4 bg-[#f5f8fc]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Integrity First', desc: 'Honest, straightforward dealings with every client — sellers and buyers alike.' },
            { icon: Users, title: 'Pilot-Owned', desc: 'Our team are pilots and aircraft owners just like you. We understand your needs.' },
            { icon: Star, title: '24/7 Availability', desc: 'We ensure round-the-clock availability to assist you throughout the entire process.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl p-6 shadow-sm text-center border border-gray-100">
              <div className="w-12 h-12 bg-[#e8f0f8] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-[#1a3a5c]" />
              </div>
              <h3 className="font-bold text-[#1a3a5c] mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#1a3a5c] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>We work with you as a team.</h2>
              <p className="text-gray-600">If you are still reading, we're thrilled to have your undivided attention. Let us know how we can work together to get you what you're looking for and want.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#e8f0f8] rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#1a3a5c]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1a3a5c]">Want to Talk?</p>
                  <a href="tel:8502703331" className="text-[#2a6aad] hover:underline">(850) 270-3331</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#e8f0f8] rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#1a3a5c]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1a3a5c]">Rather E-mail?</p>
                  <a href="mailto:info@flyclearblue.com" className="text-[#2a6aad] hover:underline">info@flyclearblue.com</a>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#1a3a5c] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>We'd love to hear from you.</h2>
            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center text-green-700">
                <p className="font-semibold">Message sent! We'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-3">
                <input required placeholder="Name *" value={form.name} onChange={set('name')} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#2a6aad]" />
                <input required type="email" placeholder="E-mail *" value={form.email} onChange={set('email')} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#2a6aad]" />
                <input required placeholder="Telephone *" value={form.phone} onChange={set('phone')} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#2a6aad]" />
                <textarea required placeholder="Message *" rows={4} value={form.message} onChange={set('message')} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#2a6aad] resize-none" />
                <button type="submit" className="bg-[#2a6aad] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#1a5a9d] transition">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}