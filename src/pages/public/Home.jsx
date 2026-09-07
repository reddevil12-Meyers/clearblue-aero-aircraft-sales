import { Link } from "react-router-dom";
import { ArrowRight, Phone, Star, Shield, Award, Plane, ChevronDown } from "lucide-react";
import useSeo from "@/hooks/useSeo";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import NewsletterSignup from "@/components/public/NewsletterSignup";
import JsonLd from "@/components/JsonLd";
import LatestInfoSection from "@/components/public/LatestInfoSection";
import EstateConciergeSection from "@/components/public/EstateConciergeSection";
import BuyerAcquisitionSection from "@/components/public/BuyerAcquisitionSection";
import HomeHero from "@/components/public/HomeHero";

export default function PublicHome() {
  useSeo({ title: "ClearBlue Aero | Aircraft Sales, Brokerage & Appraisals", description: "ClearBlue Aero is a veteran-owned, pilot-operated aircraft brokerage offering aircraft sales, acquisitions, appraisals, and leasing. Browse our hand-selected inventory of piston, turboprop, and jet aircraft.", path: "/", image: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/69a0819e0_generated_image.png" });
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
      <HomeHero />

      <LatestInfoSection announcements={announcements} />

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
        </div>
      </section>

      {/* Estate Aircraft Concierge */}
      <EstateConciergeSection />

      {/* Buyer Acquisitions */}
      <BuyerAcquisitionSection />

      {/* Newsletter */}
      <NewsletterSignup />

      {/* CTA */}
      <section className="py-20 bg-[#00447f] text-center px-4">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">Let's Talk</p>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
          Ready to Buy or Sell?
        </h2>
        <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">
          Our team is standing by to help you find your next aircraft or sell your current one: fast, professionally, and at the right price.
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