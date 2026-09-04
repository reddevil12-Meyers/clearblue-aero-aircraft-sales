import { Link } from "react-router-dom";
import { ArrowRight, Phone, Star, Shield, Award, Plane, ChevronDown } from "lucide-react";
import useSeo from "@/hooks/useSeo";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import NewsletterSignup from "@/components/public/NewsletterSignup";
import JsonLd from "@/components/JsonLd";

export default function PublicHome() {
  useSeo({ title: "ClearBlue Aero — Aircraft Sales, Brokerage & Appraisals", description: "ClearBlue Aero is a veteran-owned, pilot-operated aircraft brokerage offering aircraft sales, acquisitions, appraisals, and leasing. Browse our hand-selected inventory of piston, turboprop, and jet aircraft.", path: "/", image: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/69a0819e0_generated_image.png" });
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

    base44.entities.Announcement.list('-sort_order', 200).
    then((data) => setAnnouncements(data.filter((a) => a.active).slice(0, 3))).
    catch(() => {});
  }, []);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ClearBlue Aero",
    "url": window.location.origin,
    "logo": "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png",
    "description": "Aircraft brokerage, appraisals, and sales. Browse our inventory of piston, turboprop, and jet aircraft.",
    "telephone": "+13862276840",
    "email": "sales@flyclearblue.com",
    "areaServed": "US",
    "sameAs": [
    "https://www.facebook.com/clearblueaero/"]

  };

  const siteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ClearBlue Aero",
    "url": window.location.origin,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${window.location.origin}/inventory?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="bg-white w-full">
      <JsonLd data={orgSchema} />
      <JsonLd data={siteSchema} />
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
          <p className="text-[hsl(var(--background))] mb-10 mx-auto leading-snug opacity-100 max-w-2xl">
            <span className="block font-black mb-6 pt-10 text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] xl:text-[2.75rem]">Aircraft Sales & Acquisitions</span>
            <span className="block mt-2 text-base sm:text-lg md:text-xl">Give us a try and see why we are quickly becoming your aircraft brokerage firm of choice!</span>
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

      {/* Latest Info & Manufacturers */}
      <section className="py-16 bg-[#00447f]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left: Latest info */}
            <div className="text-center">
              <p className="font-bold uppercase tracking-widest mb-4 text-lg text-[hsl(var(--card))]">LATEST INFO AND MORE</p>
              {announcements.length > 0 ?
              <div className="space-y-6 mb-10">
                  {announcements.map((ann) => {
                  const teaser = ann.body && ann.body.length > 200 ? ann.body.slice(0, 200).trim() + '…' : ann.body;
                  return (
                    <div key={ann.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 flex flex-col sm:flex-row">
                        {ann.image_url &&
                      <div className="sm:w-48 shrink-0 bg-gray-100 flex items-center justify-center p-3">
                            <img src={ann.image_url} alt={ann.title} loading="lazy" className="w-full aspect-video object-contain" />
                          </div>
                      }
                        <div className="p-5 text-left flex-1">
                          <h3 className="font-black text-[#00447f] text-xl mb-2">{ann.title}</h3>
                          {teaser &&
                        <p className="text-gray-600 text-sm leading-relaxed">{teaser}</p>
                        }
                          <Link to="/news" className="inline-flex items-center gap-1 mt-3 text-[#00447f] font-bold text-sm hover:text-[#2a6faa] transition-colors">
                            Read more <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>);

                })}
                </div> :

              <p className="text-white/50 text-sm mb-10">Check back soon for the latest news and announcements.</p>
              }
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/inventory" className="flex items-center gap-2 px-7 py-3.5 rounded font-bold text-sm transition-all hover:brightness-110" style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
                  Explore Our Listings <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/contact" className="flex items-center gap-2 px-7 py-3.5 rounded font-bold text-sm border border-white text-white hover:bg-white hover:text-[#00447f] transition-all">
                  <Phone className="w-4 h-4" /> Contact Us Today
                </Link>
              </div>
            </div>

            {/* Right: Manufacturers we specialize in */}
            <div>
              <p className="font-bold uppercase tracking-widest mb-4 text-lg text-[hsl(var(--card))]">&nbsp;</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                { name: "Beechcraft", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/3e1406576_Beechcraft-600x169.png" },
                { name: "Cessna", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/29127b365_Cesna-600x603.png" },
                { name: "Piper", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/7a4adc981_Piper-600x283.png" },
                { name: "Mooney", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/188573ee2_mooney-600x300.png" },
                { name: "Cirrus", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/facab544e_Cirrus-600x125.png" },
                { name: "Maule", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/6813a7dff_Maule-Aircraft.png" },
                { name: "Van's Aircraft", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/e42f97c46_vans-aircraft-600.png" },
                { name: "Waco", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/f3f4d33aa_waco-aircraft-logo-600x100.png" },
                { name: "Grumman", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/2d7570271_Grumman_logo-600x.png" }].
                map((m) =>
                <div key={m.name} className="aspect-[3/2] bg-black rounded-lg flex items-center justify-center p-4">
                    <img src={m.url} alt={`${m.name} logo`} className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Aircraft */}
      {featuredLoaded && featured.length > 0 &&
      <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-12 text-center">

              <h2 className="text-4xl font-black text-[#00447f]">Featured Aircraft</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featured.map((a) =>
            <Link key={a.id} to={`/inventory/${a.id}`} className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow block">
              <div className="aspect-video bg-gray-100 overflow-hidden relative">
                {a.images?.[0] ?
                <img src={a.images[0]} alt={`${a.year} ${a.make} ${a.model}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> :
                <div className="w-full h-full flex items-center justify-center"><Plane className="w-12 h-12 text-gray-300" /></div>
                }
            {a.price_drop && a.status !== "Sold" &&
                <span className="absolute bottom-3 left-3 text-xs font-bold px-2.5 py-1 rounded shadow-md bg-red-500 text-white">Price Drop</span>
                }
            {a.status && a.status !== "Available" &&
                <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded shadow-md bg-[#00447f] text-white">{a.status}</span>
                }
              </div>
                  <div className="p-5">
                    <p className="font-black text-[#00447f] text-lg">{a.year} {a.make} {a.model}</p>
                    <p className="text-gray-400 text-sm">{a.registration}</p>
                    {a.status === "Sold" ?
                <p className="text-gray-400 font-bold mt-2">Sold</p> :
                a.status === "Coming Soon" && !a.asking_price ?
                <p className="text-[#C9A84C] font-bold mt-2">Call for early access</p> :
                a.price_drop ?
                <div className="flex items-center gap-2 mt-2">
                        <p className="text-[#C9A84C] font-bold">${a.price_drop.toLocaleString()}</p>
                        <span className="text-sm text-gray-400 line-through">${a.asking_price.toLocaleString()}</span>
                      </div> :
                a.asking_price ?
                <p className="text-[#C9A84C] font-bold mt-2">${a.asking_price.toLocaleString()}</p> :
                <p className="text-[#C9A84C] font-bold mt-2">Call for Pricing</p>}
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
          <div className="text-center mt-12">
            <Link to="/estate-aircraft" className="inline-flex items-center gap-2 text-[#00447f] font-bold text-sm hover:text-[#2a6faa] transition-colors">
              Estate Aircraft Concierge for probate and family-law counsel <ArrowRight className="w-4 h-4" />
            </Link>
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
            <Phone className="w-4 h-4" /> 386 227-6840
          </a>
        </div>
      </section>
    </div>);

}