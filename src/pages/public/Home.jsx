import { Link } from "react-router-dom";
import { ArrowRight, Phone, Star, Shield, Award, Plane, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import NewsletterSignup from "@/components/public/NewsletterSignup";

export default function PublicHome() {
  const [featured, setFeatured] = useState([]);
  const [featuredLoaded, setFeaturedLoaded] = useState(false);

  useEffect(() => {
    base44.functions.invoke('getPublicFeatured', {}).
    then((res) => {
      setFeatured(res.data.aircraft || []);
      setFeaturedLoaded(true);
    }).
    catch(() => setFeaturedLoaded(true));
  }, []);

  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <div
        className="relative min-h-[70vh] md:min-h-[75vh] flex flex-col items-center justify-center text-center px-4"
        style={{
          background: "linear-gradient(to bottom, #00447f 0%, #2a6faa 60%, #2a6faa 100%)"
        }}>
        
        <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url('https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/69a0819e0_generated_image.png')",
          backgroundSize: "cover", backgroundPosition: "center"
        }} />
        
        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="text-[hsl(var(--background))] mb-10 mx-auto leading-relaxed opacity-100 max-w-2xl">
            <span className="block font-bold mb-3 pt-10 text-[2.109rem] uppercase">Receive More From Aircraft Ownership Through Our Specialized, Trusted Services.</span>
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
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Gardner + ClearBlue transition */}
      <section className="bg-[#00447f] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-10">
            <div className="text-center">
              <div className="text-white/60 text-xs uppercase tracking-widest mb-2">A Legacy of Excellence</div>
              <img
                src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/61ada3ca1_Gardnerlogo.png"
                alt="Gardner Aircraft Sales"
                className="h-14 object-contain mx-auto"
                style={{ filter: "brightness(8)", mixBlendMode: "lighten" }}
              />
              <div className="text-white/50 text-sm mt-1">Est. 1964</div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-px bg-[#C9A84C] sm:w-px sm:h-12" />
              <span className="text-[#C9A84C] font-black text-lg">+</span>
              <div className="w-12 h-px bg-[#C9A84C] sm:w-px sm:h-12" />
            </div>

            <div className="text-center">
              <img
                src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png"
                alt="ClearBlue Aero"
                className="h-14 object-contain"
              />
              <div className="text-white/50 text-sm mt-1">Your New Aviation Partner</div>
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
            Two Trusted Names in Aviation,<br />
            <span className="text-[#C9A84C]">Now Working as One.</span>
          </h2>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            After more than 60 years of unparalleled service, Phil Gardner is retiring — and he's chosen ClearBlue Aero to carry forward the same professionalism, quality, and trust that has defined Gardner Aircraft Sales since 1964.
          </p>
        </div>
      </section>

      {/* Announcement */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Announcement</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#00447f] mb-5">ClearBlue Aero Just Got Even Stronger</h2>
          <p className="text-gray-600 text-base leading-relaxed mb-4 max-w-3xl mx-auto">
            We're proud to announce the acquisition of <a href="https://beechcraftbuyers.com" target="_blank" rel="noopener noreferrer" className="text-[#00447f] font-bold underline hover:text-[#2a6faa]">Beechcraft Buyers</a> and the integration of <Link to="/gardner" className="text-[#00447f] font-bold underline hover:text-[#2a6faa]">Gardner Aircraft Sales</Link> client listings and operations.
          </p>
          <p className="text-gray-600 text-base leading-relaxed mb-8 max-w-3xl mx-auto">
            This expansion supercharges our already robust national footprint with deeper inventory, specialized buyer representation, and unmatched expertise — delivering even better results for buyers and sellers nationwide.
          </p>
          <Accordion type="single" collapsible className="mb-8 border border-gray-200 rounded-lg max-w-3xl mx-auto text-left">
            <AccordionItem value="item-1" className="border-0">
              <AccordionTrigger className="px-4 py-3 text-[#00447f] font-bold text-sm hover:no-underline hover:bg-gray-50">
                Click here for more info
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-gray-600 text-sm leading-relaxed space-y-3">
                <p className="font-bold text-[#00447f]">Exciting News at ClearBlue Aero: Strategic Acquisitions Expand Our Aviation Expertise!</p>
                <p>ClearBlue Aero is proud to announce the recent acquisition of <a href="https://beechcraftbuyers.com" target="_blank" rel="noopener noreferrer" className="text-[#00447f] font-bold underline hover:text-[#2a6faa]">Beechcraft Buyers</a> (beechcraftbuyers.com) and the seamless integration of key operations and client listings from the respected <Link to="/gardner" className="text-[#00447f] font-bold underline hover:text-[#2a6faa]">Gardner Aircraft Sales</Link> as it transitions toward its permanent closure on August 1, 2026.</p>
                <p>These moves significantly strengthen our already robust national footprint in general and vintage aircraft brokerage. By combining Beechcraft Buyers' specialized buyer representation services with Gardner's long-established client network and premium listings (including Beechcraft, Piper, Cessna, and more), ClearBlue Aero now delivers:</p>
                <ul className="space-y-2 pl-1">
                  <li><span className="font-bold text-[#00447f]">Expanded Inventory &amp; Market Reach</span> — A deeper selection of high-quality aircraft across popular makes and models, with enhanced visibility for both buyers and sellers.</li>
                  <li><span className="font-bold text-[#00447f]">Unmatched Expertise</span> — Decades of combined experience in aircraft sales, buyer advocacy, ferry operations, and personalized client transitions — all under one roof.</li>
                  <li><span className="font-bold text-[#00447f]">Comprehensive Services</span> — From professional market analyses and maintenance/annual inspection quotes to seamless ownership structuring, hangar support, and end-to-end brokerage solutions.</li>
                  <li><span className="font-bold text-[#00447f]">Dedicated Client Focus</span> — Continued support during the Gardner transition ensures smooth handoffs for existing clients while we welcome new ones with even greater resources and nationwide coverage.</li>
                </ul>
                <p>This evolution positions ClearBlue Aero as a premier, full-service destination for aircraft buyers, sellers, and owners who demand integrity, knowledge, and results. To read more about Gardner Aircraft Sale <Link to="/gardner" className="text-[#00447f] font-bold underline hover:text-[#2a6faa]">Click here</Link>.</p>
                <p>Stay tuned for updated listings, new buyer tools, and more.</p>
                <p>Whether you're looking to buy, sell, or explore options — ClearBlue Aero is ready to elevate your aviation journey.</p>
                <p>Questions? Contact us today at ClearBlue Aero.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-8">
            <img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/9063629b1_logo-gmail.png" alt="Beechcraft Buyers" className="h-16 md:h-20 w-auto object-contain" />
            <span className="text-[#C9A84C] text-2xl font-bold hidden md:inline">+</span>
            <img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/e029bfcae_Gardnerlogo.png" alt="Gardner Aircraft Sales" className="h-14 md:h-16 w-auto object-contain" />
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/inventory" className="flex items-center gap-2 px-7 py-3.5 rounded font-bold text-sm transition-all hover:brightness-110" style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
              Explore Our Listings <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="flex items-center gap-2 px-7 py-3.5 rounded font-bold text-sm border border-[#00447f] text-[#00447f] hover:bg-[#00447f] hover:text-white transition-all">
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