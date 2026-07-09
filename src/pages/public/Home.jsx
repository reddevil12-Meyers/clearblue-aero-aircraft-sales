import { Link } from "react-router-dom";
import { ArrowRight, Phone, Star, Shield, Award, Plane, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import NewsletterSignup from "@/components/public/NewsletterSignup";

export default function PublicHome() {
  const [featured, setFeatured] = useState([]);
  const [featuredLoaded, setFeaturedLoaded] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    base44.functions.invoke('getPublicFeatured', {}).
    then((res) => {
      setFeatured(res.data.aircraft || []);
      setFeaturedLoaded(true);
    }).
    catch(() => setFeaturedLoaded(true));

    base44.entities.Announcement.list('sort_order', 200)
      .then(data => setAnnouncements(data.filter(a => a.active)))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <div
        className="relative min-h-[70vh] md:min-h-[75vh] flex flex-col items-center justify-center text-center px-4"
        style={{
          background: "linear-gradient(to bottom, #00447f 0%, #2a6faa 60%, #2a6faa 100%)"
        }}>
        
        <div className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/69a0819e0_generated_image.png')",
          backgroundSize: "cover", backgroundPosition: "center"
        }} />
        
        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="text-[hsl(var(--background))] mb-10 mx-auto leading-tight opacity-100 max-w-2xl">
            <span className="block font-black mb-3 pt-10 text-[2.8rem]">Receive More From Aircraft Ownership Through Our Specialized, Trusted Services</span>
            <span className="block mt-3">Give us a try and quickly see why we are quickly becoming your aircraft brokerage firm of choice!</span>
          </p>
          <div className="flex flex-wrap justify-center gap-4 pb-12">
            <Link to="/inventory"
            className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110"
            style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
              View Aircraft for Sale <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/20 hover:bg-white/10 transition-all">
              <Phone className="w-4 h-4" /> Contact Us
            </Link>
          </div>
        </div>

      </div>

      {/* Announcement */}
      <section className="py-16 bg-[#00447f]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Latest Info and more</p>
          {announcements.length > 0 && (
            <div className="max-w-4xl mx-auto mb-10 space-y-6">
              {announcements.map((ann) => {
                const teaser = ann.body && ann.body.length > 160 ? ann.body.slice(0, 160).trim() + '…' : ann.body;
                return (
                  <div key={ann.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 flex flex-col sm:flex-row">
                    {ann.image_url && (
                      <div className="sm:w-48 shrink-0 bg-gray-100 flex items-center justify-center p-3">
                        <img src={ann.image_url} alt={ann.title} className="w-full aspect-video object-contain" />
                      </div>
                    )}
                    <div className="p-5 text-left flex-1">
                      <h3 className="font-black text-[#00447f] text-lg mb-2">{ann.title}</h3>
                      {teaser && (
                        <p className="text-gray-600 text-sm leading-relaxed">{teaser}</p>
                      )}
                      <Link to="/news" className="inline-flex items-center gap-1 mt-3 text-[#00447f] font-bold text-sm hover:text-[#2a6faa] transition-colors">
                        Read more <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/inventory" className="flex items-center gap-2 px-7 py-3.5 rounded font-bold text-sm transition-all hover:brightness-110" style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
              Explore Our Listings <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="flex items-center gap-2 px-7 py-3.5 rounded font-bold text-sm border border-white text-white hover:bg-white hover:text-[#00447f] transition-all">
              <Phone className="w-4 h-4" /> Contact Us Today
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Aircraft */}
      {featuredLoaded && featured.length > 0 &&
      <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-12">
              <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-3">Hand-Selected</p>
              <h2 className="text-4xl font-black text-[#00447f]">Featured Aircraft</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featured.map((a) =>
            <Link key={a.id} to={`/inventory/${a.id}`} className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow block">
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    {a.images?.[0] ?
                <img src={a.images[0]} alt={`${a.year} ${a.make} ${a.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> :
                <div className="w-full h-full flex items-center justify-center"><Plane className="w-12 h-12 text-gray-300" /></div>
                }
                  </div>
                  <div className="p-5">
                    <p className="font-black text-[#00447f] text-lg">{a.year} {a.make} {a.model}</p>
                    <p className="text-gray-400 text-sm">{a.registration}</p>
                    {a.asking_price && <p className="text-[#C9A84C] font-bold mt-2">${a.asking_price.toLocaleString()}</p>}
                  </div>
                </Link>
            )}
            </div>
            <div className="flex justify-center mt-10">
              <Link
              to="/inventory"
              className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110"
              style={{ backgroundColor: '#00447f', color: '#fff' }}>
                View All Aircraft <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      }

      {/* Services */}
      <section className="py-20 bg-[#f5f6f8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#0a0700] mb-4 text-lg font-bold uppercase tracking-widest">WHAT WE DO</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#00447f]">Our Services</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
            { icon: Plane, title: "Aircraft Sales", desc: "Representing buyers and sellers with integrity and expertise.", link: "/inventory" },
            { icon: Shield, title: "Appraisals", desc: "Accurate and customized aircraft valuations for any purpose.", link: "/contact" },
            { icon: Star, title: "Acquisitions", desc: "We source the right aircraft for your mission and budget.", link: "/sell" },
            { icon: Award, title: "Leasing", desc: "Flexible aircraft leasing solutions tailored to your needs.", link: "/contact" }].
            map(({ icon: Icon, title, desc, link }) =>
            <Link key={title} to={link} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg transition-shadow group block">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: '#00447f' }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-black text-[#00447f] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSignup />

      {/* CTA */}
      <section className="py-20 bg-[#00447f] text-center px-4">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">Let's Talk</p>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
          Ready to Buy or Sell?
        </h2>
        <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">
          Our team is standing by to help you find your next aircraft or sell your current one — fast, professionally, and at the right price.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/contact" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110" style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
            Get in Touch <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="tel:+13862276840" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/20 hover:bg-white/10 transition-all">
            <Phone className="w-4 h-4" /> (386) 227-6840
          </a>
        </div>
      </section>
    </div>);

}