import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Plane, ChevronDown } from "lucide-react";
import { formatCurrency } from "../../components/FormatCurrency";

export default function PublicHome() {
  const [featuredAircraft, setFeaturedAircraft] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Aircraft.filter({ show_on_public: true, featured: true }, '-created_date', 6)
      .then(data => {
        setFeaturedAircraft(data.filter(a => a.status !== 'Sold'));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white w-full">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=2000&q=85')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#00447f]/80 via-[#00447f]/60 to-[#00447f]/90" />
        <div className="relative z-10 text-center text-white px-4 w-full max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            Veteran Owned · Pilot Operated
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-none mb-6 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Own the Sky.
            <br />
            <span className="text-[#C9A84C]">Own It Right.</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/60 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            ClearBlue Aero delivers world-class aircraft acquisition, sales, maintenance, and appraisal services to discerning buyers and sellers nationwide.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/public/inventory"
              className="group flex items-center gap-3 px-6 py-3.5 rounded font-bold text-white text-sm tracking-wide transition-all hover:brightness-110"
              style={{ backgroundColor: '#C9A84C', color: '#00447f' }}
            >
              Browse Inventory
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/public/sell"
              className="flex items-center gap-3 px-6 py-3.5 rounded font-bold text-white text-sm tracking-wide border border-white/20 hover:bg-white/10 transition-all"
            >
              Sell Your Aircraft
            </Link>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <section className="bg-[#00447f] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4">
          {[
            { num: "20+", label: "Years Experience" },
            { num: "500+", label: "Transactions Closed" },
            { num: "100%", label: "Veteran Owned" },
            { num: "50+", label: "States Served" },
          ].map(({ num, label }) => (
            <div key={label} className="px-4 py-8 text-center border-r border-white/10 last:border-r-0">
              <p className="text-3xl font-black text-[#C9A84C] mb-1">{num}</p>
              <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED AIRCRAFT ─────────────────────────────────── */}
      <section className="py-20 bg-[#f5f6f8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-3">Current Listings</p>
              <h2 className="text-4xl md:text-5xl font-black text-[#00447f] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Featured Aircraft
              </h2>
            </div>
            <Link
              to="/public/inventory"
              className="hidden md:flex items-center gap-2 text-sm font-bold text-[#00447f] hover:text-[#C9A84C] transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-10 h-10 border-4 border-[#C9A84C]/20 border-t-[#C9A84C] rounded-full animate-spin" />
            </div>
          ) : featuredAircraft.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
              <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No featured listings at this time.</p>
              <Link to="/public/inventory" className="text-sm font-bold text-[#C9A84C] hover:underline">Browse All Aircraft →</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAircraft.map((a) => (
                <Link
                  key={a.id}
                  to={`/public/inventory/${a.id}`}
                  className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden bg-[#00447f]">
                    {a.images?.[0] ? (
                      <img src={a.images[0]} alt={`${a.year} ${a.make} ${a.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Plane className="w-16 h-16 text-white/10" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded text-[#00447f] uppercase tracking-wide" style={{ backgroundColor: '#C9A84C' }}>Featured</span>
                    </div>
                    {a.status === 'Under Contract' && (
                      <div className="absolute top-3 right-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded bg-orange-500 text-white uppercase tracking-wide">Under Contract</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-black text-[#00447f] mb-1">{a.year} {a.make} {a.model}</h3>
                    <p className="text-sm text-gray-400 mb-4">{a.registration}{a.location ? ` · ${a.location}` : ''}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {a.engine_type && <span className="text-xs bg-[#f5f6f8] text-gray-600 px-2.5 py-1 rounded-full font-medium">{a.engine_type}</span>}
                      {a.total_time && <span className="text-xs bg-[#f5f6f8] text-gray-600 px-2.5 py-1 rounded-full font-medium">{a.total_time.toLocaleString()} TT</span>}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs font-bold text-[#C9A84C] uppercase tracking-wide flex items-center gap-1">
                        View Details <ArrowRight className="w-3 h-3" />
                      </span>
                      <p className="text-xl font-black text-[#00447f]">{formatCurrency(a.asking_price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link to="/public/inventory" className="inline-flex items-center gap-2 text-sm font-bold text-[#00447f]">
              View All Inventory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY CLEARBLUE ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">The ClearBlue Difference</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#00447f] leading-tight mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Built for Buyers.<br />Proven for Sellers.
            </h2>
            <p className="text-gray-500 leading-relaxed text-lg mb-8">
              We're not a listing platform — we're your brokers. Pilot-operated and veteran-owned, ClearBlue Aero brings deep market knowledge and unwavering integrity to every transaction.
            </p>
            <div className="space-y-4">
              {[
                "End-to-end transaction management",
                "Pre-purchase inspection coordination",
                "Title, escrow & financing assistance",
                "Aircraft appraisals & valuations",
                "Nationwide buyer & seller network",
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#C9A84C' }}>
                    <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
                      <path d="M1 5l3 3 7-7" stroke="#00447f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium text-sm md:text-base">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link
                to="/public/about"
                className="inline-flex items-center gap-2 px-6 py-3.5 font-bold text-sm text-white rounded transition-all hover:brightness-110"
                style={{ backgroundColor: '#00447f' }}
              >
                Learn About Us <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="relative mt-6 lg:mt-0">
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200&q=85" alt="Aircraft" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-[#00447f] text-white rounded-2xl p-5 shadow-2xl">
              <p className="text-3xl font-black text-[#C9A84C]">A+</p>
              <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">Service Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES STRIP ────────────────────────────────────── */}
      <section className="py-20 bg-[#00447f]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">What We Do</p>
            <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Full-Service Aviation</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {[
              { num: "01", title: "Aircraft Acquisitions", desc: "Find the right aircraft for your mission — we handle search, vetting, and negotiation.", link: "/public/inventory" },
              { num: "02", title: "Aircraft Sales", desc: "Strategic pricing and expert representation to maximize your aircraft's value.", link: "/public/sell" },
              { num: "03", title: "Appraisals", desc: "Certified desktop and on-site appraisals for insurance, financing, and estate purposes.", link: "/public/contact" },
              { num: "04", title: "Maintenance", desc: "Pre-buy inspections, AD compliance, engine analysis — backed by brokerage insight.", link: "/public/maintenance" },
            ].map((s) => (
              <Link
                key={s.title}
                to={s.link}
                className="group p-8 bg-white/5 hover:bg-[#C9A84C]/10 border border-white/5 hover:border-[#C9A84C]/30 transition-all duration-300 block"
              >
                <div className="text-5xl font-black text-white/5 group-hover:text-[#C9A84C]/10 transition-colors mb-5 select-none">{s.num}</div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-5">{s.desc}</p>
                <span className="text-[#C9A84C] text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  Learn More <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section
        className="relative py-24 text-center text-white overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1583395838144-0aad98b2e3f3?w=1800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#00447f]/85" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">Ready to Take the Next Step?</p>
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Aircraft Deal<br />Starts Here.
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Whether you're buying, selling, or need a pre-buy inspection, our brokers are ready to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/public/contact" className="px-8 py-4 font-bold rounded text-sm tracking-wide transition-all hover:brightness-110" style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
              Contact Our Team
            </Link>
            <a href="tel:+13862276840" className="px-8 py-4 font-bold text-white rounded text-sm tracking-wide border border-white/20 hover:bg-white/10 transition-all">
              (386) 227-6840
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}