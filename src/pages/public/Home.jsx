import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Plane, Shield, Award, PhoneCall } from "lucide-react";
import { formatCurrency } from "../../components/FormatCurrency";

export default function PublicHome() {
  const [featuredAircraft, setFeaturedAircraft] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Aircraft.filter({ show_on_public: true, featured: true, status: "Available" }, '-created_date', 6)
      .then(data => { setFeaturedAircraft(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section
        className="relative flex items-center justify-center min-h-[90vh] bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=1800&q=80')" }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(10,22,40,0.72)' }} />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">Aircraft Sales · Acquisitions · Leasing</p>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Find Your Perfect Aircraft
          </h1>
          <p className="text-xl text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed">
            ClearBlue Aero connects buyers and sellers of quality general aviation aircraft. Veteran owned, pilot operated.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/public/inventory" className="px-8 py-4 rounded-lg font-semibold text-white transition-all" style={{ backgroundColor: '#d97706' }}>
              Browse Inventory
            </Link>
            <Link to="/public/contact" className="px-8 py-4 rounded-lg font-semibold border-2 border-white/40 text-white hover:bg-white/10 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Why ClearBlue */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-2">Why ClearBlue Aero</p>
            <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>The Right Team for Your Transaction</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Plane, title: "Experienced Brokers", desc: "Our pilots and brokers have decades of experience across single-engine, multi-engine, and turbine aircraft." },
              { icon: Shield, title: "Veteran Owned", desc: "Proudly veteran owned and operated. We bring the same dedication and integrity to every deal." },
              { icon: Award, title: "Full Service", desc: "From pre-purchase inspections to title, escrow, and financing — we guide you through the entire process." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: '#0a1628' }}>
                  <Icon className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Aircraft */}
      <section className="py-20" style={{ backgroundColor: '#f8f9fb' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-2">Hand-Selected Listings</p>
              <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Featured Aircraft</h2>
            </div>
            <Link to="/public/inventory" className="hidden md:flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors">
              View All Inventory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : featuredAircraft.length === 0 ? (
            <div className="text-center py-16">
              <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">No featured aircraft at this time. Check back soon.</p>
              <Link to="/public/inventory" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700">
                Browse All Inventory <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredAircraft.map(a => (
                <Link key={a.id} to={`/public/inventory/${a.id}`} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="h-52 bg-gray-100 overflow-hidden relative">
                    {a.images?.[0] ? (
                      <img src={a.images[0]} alt={`${a.year} ${a.make} ${a.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#0a1628' }}>
                        <Plane className="w-12 h-12 text-white/20" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Featured</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{a.year} {a.make} {a.model}</h3>
                    <p className="text-sm text-gray-400 mb-4">{a.registration} {a.location ? `· ${a.location}` : ''}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-400 space-y-0.5">
                        {a.total_time && <p>{a.total_time.toLocaleString()} TT</p>}
                        {a.engine_type && <p>{a.engine_type}</p>}
                      </div>
                      <p className="text-xl font-bold" style={{ color: '#0a1628' }}>{formatCurrency(a.asking_price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-10 md:hidden">
            <Link to="/public/inventory" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600">
              View All Inventory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 text-white text-center" style={{ backgroundColor: '#0a1628' }}>
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Ready to Buy or Sell?</h2>
          <p className="text-white/60 mb-8 text-lg">We make aircraft transactions straightforward and stress-free. Get in touch with our team today.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/public/sell" className="px-8 py-4 rounded-lg font-semibold text-white transition-all" style={{ backgroundColor: '#d97706' }}>
              Sell Your Plane
            </Link>
            <a href="tel:+13862276840" className="px-8 py-4 rounded-lg font-semibold border-2 border-white/30 hover:bg-white/10 transition-all flex items-center gap-2">
              <PhoneCall className="w-4 h-4" /> (386) 227-6840
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}