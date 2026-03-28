import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plane, Star, Shield, Users, Phone, Mail } from 'lucide-react';
// Note: Icon is used as a dynamic component from the array below

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=1400&q=80',
  'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1400&q=80',
  'https://images.unsplash.com/photo-1583246681139-c5f0a4fcf23e?w=1400&q=80',
];

const PARTNERS = [
  { name: 'Lima Bravo Aviation', url: 'https://limabravoaviation.com' },
  { name: 'Columbus Aero Service', url: 'http://www.columbusaeroservice.com' },
  { name: 'Gann Aviation', url: 'http://www.gannaviation.com' },
  { name: 'Beechcraft Buyers', url: 'http://www.beechcraftbuyersandsellers.com' },
  { name: 'Banterra Aircraft Financing', url: 'http://www.banterraaircraft.com' },
  { name: 'Falcon Insurance', url: 'http://www.falconinsurance.com' },
];

export default function PublicHome() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [aircraft, setAircraft] = useState([]);
  const [contact, setContact] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setHeroIndex(i => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    base44.entities.Aircraft.filter({ status: 'Available' }, '-created_date', 8)
      .then(setAircraft).catch(() => {});
  }, []);

  const handleContact = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div>
      {/* Hero Slider */}
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        {HERO_IMAGES.map((src, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIndex ? 'opacity-100' : 'opacity-0'}`}>
            <img src={src} alt="Aircraft" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#1a3a5c]/50" />
          </div>
        ))}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            ClearBlue Aero
          </h1>
          <p className="text-xl md:text-2xl mb-2 text-blue-100">Aircraft Sales | Acquisitions | Leasing</p>
          <p className="text-base md:text-lg mb-8 text-blue-200 max-w-2xl">
            Quality, honest, and safe aircraft sales and brokerage services for the general aviation community.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/public/inventory" className="bg-white text-[#1a3a5c] font-semibold px-6 py-3 rounded-md hover:bg-blue-50 transition">
              View Aircraft for Sale
            </Link>
            <Link to="/public/sell" className="bg-[#2a6aad] text-white font-semibold px-6 py-3 rounded-md hover:bg-[#1a5a9d] transition border border-white/30">
              Sell Your Plane
            </Link>
          </div>
        </div>
        {/* Slider dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button key={i} onClick={() => setHeroIndex(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === heroIndex ? 'bg-white' : 'bg-white/40'}`} />
          ))}
        </div>
      </div>

      {/* Intro Section */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1a3a5c] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Specialized Aviation Sales and Acquisitions
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            ClearBlue Aero provides quality, honest, and safe aircraft sales and brokerage services to the general aviation community. With expertise in factory and experimental aircraft, we offer professional, efficient, and easy-to-understand aircraft sales and purchase experiences for both seller and buyer.
          </p>
          <p className="text-gray-600 leading-relaxed">
            <strong>We are additionally closely partnered with Beechcraft Buyers,</strong> offering even wider aviation community outreach, knowledge, and availability. Give us a try and quickly see why we are quickly becoming your aircraft brokerage firm of choice!
          </p>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Star, title: 'Quality Service', desc: 'Professional, efficient, and easy-to-understand aircraft brokerage experiences.' },
            { icon: Shield, title: 'Trusted Partners', desc: 'Closely connected with top industry partners for insurance, financing, and maintenance.' },
            { icon: Users, title: 'Experienced Team', desc: 'Our team are pilots and aircraft owners — we speak your language and understand your needs.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-[#e8f0f8] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-7 h-7 text-[#1a3a5c]" />
              </div>
              <h3 className="font-semibold text-[#1a3a5c] text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inventory Snapshot */}
      <section className="py-14 px-4 bg-[#f5f8fc]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1a3a5c] text-center mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            Inventory Snapshot
          </h2>
          {aircraft.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No aircraft currently listed. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {aircraft.slice(0, 8).map(ac => (
                <Link key={ac.id} to={`/public/inventory/${ac.id}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100">
                  <div className="h-40 bg-gradient-to-br from-[#1a3a5c] to-[#2a6aad] flex items-center justify-center">
                    {ac.images?.[0] ? (
                      <img src={ac.images[0]} alt={ac.model} className="w-full h-full object-cover" />
                    ) : (
                      <Plane className="w-12 h-12 text-white/50" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#1a3a5c] text-sm">{ac.year} {ac.make} {ac.model}</h3>
                    <p className="text-xs text-gray-500 mt-1">{ac.registration} • {ac.location || 'Location TBD'}</p>
                    {ac.asking_price && (
                      <p className="text-[#2a6aad] font-bold mt-2">
                        ${new Intl.NumberFormat('en-US').format(ac.asking_price)}
                      </p>
                    )}
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${ac.status === 'Available' ? 'bg-green-50 text-green-700' : ac.status === 'Under Contract' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ac.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/public/inventory" className="bg-[#1a3a5c] text-white px-8 py-3 rounded-md font-semibold hover:bg-[#0f2a45] transition inline-block">
              View All Aircraft
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 bg-[#1a3a5c] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            We work with you as a team.
          </h2>
          <p className="text-blue-200 mb-8 text-lg">
            If you are still reading, we're thrilled to have your undivided attention. Let us know how we can work together to get you what you're looking for.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-blue-100">
              <Phone className="w-5 h-5" />
              <span>Want to Talk? Call us at <strong className="text-white">(850) 270-3331</strong></span>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <Mail className="w-5 h-5" />
              <span>Rather E-mail? <a href="mailto:info@flyclearblue.com" className="text-white underline">info@flyclearblue.com</a></span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1a3a5c] text-center mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            We'd love to hear from you.
          </h2>
          {sent ? (
            <div className="text-center py-10 text-green-700 bg-green-50 rounded-xl border border-green-200">
              <p className="text-lg font-semibold">Thank you for reaching out!</p>
              <p className="text-sm mt-1">We'll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleContact} className="space-y-4">
              <input required placeholder="Name *" value={contact.name} onChange={e => setContact(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#2a6aad]" />
              <input required type="email" placeholder="E-mail *" value={contact.email} onChange={e => setContact(p => ({ ...p, email: e.target.value }))} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#2a6aad]" />
              <input required placeholder="Telephone *" value={contact.phone} onChange={e => setContact(p => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#2a6aad]" />
              <textarea required placeholder="Message *" rows={5} value={contact.message} onChange={e => setContact(p => ({ ...p, message: e.target.value }))} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#2a6aad] resize-none" />
              <button type="submit" className="bg-[#2a6aad] text-white px-8 py-3 rounded-md font-semibold hover:bg-[#1a5a9d] transition w-full">
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Partners */}
      <section className="py-10 px-4 bg-[#f5f8fc] border-t border-gray-200">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-lg font-bold text-[#1a3a5c] mb-6 tracking-wider uppercase">Our Trusted Partners</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {PARTNERS.map(p => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-[#1a3a5c]/20 rounded-lg text-sm font-medium text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white transition">
                {p.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}