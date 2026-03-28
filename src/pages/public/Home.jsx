import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronRight, Phone, Mail } from 'lucide-react';

const HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1690944210909-9a97ba72a50b?w=1600&auto=format&fit=crop&q=80',
    caption: 'Cessna 172 · Cross-Country Ready',
  },
  {
    url: 'https://images.unsplash.com/photo-1604285861770-54cb117a3f5a?w=1600&auto=format&fit=crop&q=80',
    caption: 'General Aviation · Freedom to Fly',
  },
  {
    url: 'https://images.unsplash.com/photo-1593938346024-7ee982d8224b?w=1600&auto=format&fit=crop&q=80',
    caption: 'Quality Aircraft · Ready for New Owners',
  },
  {
    url: 'https://images.unsplash.com/photo-1592805145089-6066b407e342?w=1600&auto=format&fit=crop&q=80',
    caption: 'Piper & Beechcraft · Trusted Classics',
  },
];

export default function PublicHome() {
  const [slide, setSlide] = useState(0);
  const [aircraft, setAircraft] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    base44.entities.Aircraft.filter({ status: 'Available' }, '-created_date', 6)
      .then(setAircraft).catch(() => {});
  }, []);

  const prev = () => setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const next = () => setSlide(s => (s + 1) % HERO_SLIDES.length);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[520px] md:h-[640px] overflow-hidden bg-[#1a3a5c]">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={s.url} alt={s.caption} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
          </div>
        ))}

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 z-10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-200 mb-3">Aircraft Sales · Acquisitions · Leasing</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Find Your Perfect<br />Aircraft
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl">
            Veteran-owned brokerage specializing in quality general aviation aircraft throughout the Southeast.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/public/inventory" className="bg-[#c9a84c] hover:bg-[#b8973f] text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              View Inventory
            </Link>
            <Link to="/public/sell" className="bg-white/20 hover:bg-white/30 border border-white/50 text-white font-semibold px-8 py-3 rounded-lg transition-colors backdrop-blur-sm">
              Sell Your Plane
            </Link>
          </div>
        </div>

        {/* Slide caption */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10">
          <span className="text-white/70 text-sm italic">{HERO_SLIDES[slide].caption}</span>
        </div>

        {/* Arrows */}
        <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === slide ? 'bg-white' : 'bg-white/40'}`} />
          ))}
        </div>
      </div>

      {/* Featured Inventory */}
      {aircraft.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-[#1a3a5c] mb-2 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Featured Aircraft</h2>
            <p className="text-gray-500 text-center mb-10">Currently available in our inventory</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aircraft.map(ac => (
                <Link key={ac.id} to={`/public/inventory/${ac.id}`} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden group">
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    {ac.images?.[0]
                      ? <img src={ac.images[0]} alt={`${ac.year} ${ac.make} ${ac.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">✈</div>
                    }
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#1a3a5c] text-lg">{ac.year} {ac.make} {ac.model}</h3>
                    <p className="text-gray-500 text-sm mb-2">{ac.location}</p>
                    <p className="text-[#c9a84c] font-bold text-xl">
                      {ac.asking_price ? `$${ac.asking_price.toLocaleString()}` : 'Price on Request'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/public/inventory" className="inline-block bg-[#1a3a5c] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#15304d] transition-colors">
                View All Aircraft
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why ClearBlue */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1a3a5c] mb-2 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Why ClearBlue Aero?</h2>
          <p className="text-gray-500 text-center mb-12">A veteran-owned business dedicated to honest, transparent aircraft transactions</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🎖️', title: 'Veteran Owned', desc: 'Founded by veterans who bring discipline, integrity, and attention to detail to every transaction.' },
              { icon: '✈️', title: 'Aviation Expertise', desc: 'Deep knowledge of general aviation aircraft — from Cessna singles to complex Piper twins.' },
              { icon: '🤝', title: 'Full-Service Brokerage', desc: 'We handle everything from appraisal and listing to escrow, pre-buy inspection, and closing.' },
            ].map(item => (
              <div key={item.title} className="text-center p-6 rounded-xl bg-gray-50">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-[#1a3a5c] text-xl mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-[#1a3a5c] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Ready to Buy or Sell?</h2>
          <p className="text-blue-200 mb-8">Contact us today for a free aircraft valuation or to browse our current listings.</p>
          <div className="flex flex-wrap justify-center gap-6 text-blue-200 mb-8">
            <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> (850) 270-3331</span>
            <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> sales@flyclearblue.com</span>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/public/contact" className="bg-[#c9a84c] hover:bg-[#b8973f] text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Contact Us
            </Link>
            <Link to="/public/inventory" className="border border-white/50 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Browse Inventory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}