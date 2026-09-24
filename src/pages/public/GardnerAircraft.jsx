import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/api/base44Client";
import { Plane, Phone, Mail, MapPin, ArrowRight, Calendar, Award, Users, Search } from "lucide-react";
import useSeo from "@/hooks/useSeo";

export default function GardnerAircraft() {
  useSeo({ title: "Gardner Aircraft Sales: Aircraft Sales Since 1964 | ClearBlue Aero", description: "Gardner Aircraft Sales, established 1964 by Phil Gardner at Spruce Creek Fly-in. Six decades of unmatched aviation expertise, now part of ClearBlue Aero.", path: "/gardneraircraft" });
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('aircraft')
      .select('id,registration,make,model,year,total_time,engine_time_smoh,engine_type,asking_price,status,images,location')
      .eq('show_on_public', true)
      .contains('published_sites', ['gardner'])
      .then(({ data }) => { setAircraft(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const featured = aircraft.filter(a => a.status === "Sold").slice(0, 4);

  return (
    <div className="bg-[#f5f6f8] min-h-screen">

      {/* Hero */}
      <div className="bg-[#00447f] py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-[0.3em] mb-4">Est. 1964</p>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Gardner Aircraft Sales
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Six decades of unmatched aviation expertise. Browse our quality pre-owned aircraft or let us help you find the perfect plane.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/inventory"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold text-sm transition-all hover:brightness-110"
              style={{ backgroundColor: '#C9A84C', color: '#00447f' }}
            >
              <Plane className="w-4 h-4" /> View Aircraft for Sale <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold text-sm border-2 border-white/20 text-white hover:bg-white/10 transition-all"
            >
              <Mail className="w-4 h-4" /> Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Gold bar */}
      <div className="h-1.5 bg-[#C9A84C]" />

      {/* About Phil Gardner */}
      <div className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Photo */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                <div className="w-40 h-40 mx-auto rounded-full bg-[#00447f]/10 flex items-center justify-center mb-4">
                  <Users className="w-20 h-20 text-[#00447f]/40" />
                </div>
                <p className="font-black text-[#00447f] text-lg">Phil Gardner</p>
                <p className="text-gray-400 text-sm">Owner & Founder</p>
                <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-wider mt-2">Since 1964</p>
              </div>
            </div>
            {/* Bio */}
            <div className="md:col-span-2">
              <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-3">About</p>
              <h2 className="text-3xl font-black text-[#00447f] mb-5">A Legacy of Aviation Excellence</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  In February 1964, Phil Gardner started his business selling aircraft. Today, Gardner Aircraft Sales' level of quality is the result of Phil's experience in the general aviation industry, culminating over the last 50 years.
                </p>
                <p>
                  In his long aviation career he has been in thousands of cockpits, piloting a wide range of aircraft. As a result, he can offer an uncommon level of expertise with invaluable experience and aviation knowledge. His long career also includes many years spent refinishing aircraft interiors and custom paint work.
                </p>
                <p>
                  We invite you to benefit from Phil's experience in finding the best aircraft, at the best price that fits your needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spruce Creek Fly-in */}
      <div className="bg-[#00447f] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[#C9A84C]" />
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest">Our Home</p>
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Spruce Creek Fly-in (7FL6)</h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            In 1991, Gardner Aircraft Sales moved to Spruce Creek Fly-in, where Phil has remained a resident ever since. With more than 600 based aircraft, the Spruce Creek Fly-in community is home to a wide range of aircraft.
          </p>
          <a
            href="https://goo.gl/maps/FaQfK9mwGoHmfZz29"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm border-2 border-white/20 text-white hover:bg-white/10 transition-all"
          >
            <MapPin className="w-4 h-4" /> View on Map
          </a>
        </div>
      </div>

      {/* Featured Inventory */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-3">A 60 YEAR LEGACY</p>
            <h2 className="text-3xl font-black text-[#00447f] mb-3">Aircraft Sold</h2>
            <p className="text-gray-500 max-w-xl mx-auto">A track record of successful aircraft sales spanning six decades.</p>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#00447f]/20 border-t-[#00447f] rounded-full animate-spin" />
            </div>
          )}

          {!loading && featured.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Plane className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold">No sold aircraft to display yet</p>
              <p className="text-sm mt-2">Check back soon for updates.</p>
            </div>
          )}

          {!loading && featured.length > 0 && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map(a => (
                  <Link key={a.id} to={`/inventory/${a.id}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all block">
                    <div className="aspect-video bg-gray-100 overflow-hidden relative">
                      {a.images?.[0]
                        ? <img src={a.images[0]} alt={`${a.year} ${a.make} ${a.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center"><Plane className="w-12 h-12 text-gray-300" /></div>
                      }
                      {a.status && (
                        <span className={`absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full shadow ${
                          a.status === "Available" ? "bg-green-500 text-white" :
                          a.status === "Under Contract" ? "bg-amber-400 text-amber-900" :
                          a.status === "Sold" ? "bg-gray-700 text-white" :
                          "bg-blue-500 text-white"
                        }`}>
                          {a.status}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="font-black text-[#00447f] text-lg leading-tight">{a.year} {a.make} {a.model}</p>
                      <p className="text-gray-400 text-sm mt-1">{a.registration}{a.location ? ` · ${a.location}` : ''}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                        {a.total_time && <span>{a.total_time.toLocaleString()} TT</span>}
                        {a.engine_time_smoh && <span>{a.engine_time_smoh.toLocaleString()} SMOH</span>}
                        {a.engine_type && <span>{a.engine_type}</span>}
                      </div>
                      {a.asking_price && (
                        <p className="text-[#C9A84C] font-black text-xl mt-3">${a.asking_price.toLocaleString()}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link
                  to="/inventory"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-sm transition-all hover:brightness-110"
                  style={{ backgroundColor: '#00447f', color: '#fff' }}
                >
                  View All Aircraft <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white py-16 px-4 border-y border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: Calendar, value: "1964", label: "Established" },
            { icon: Award, value: "60+", label: "Years of Experience" },
            { icon: Plane, value: "1000s", label: "Cockpits Piloted" },
            { icon: MapPin, value: "600+", label: "Aircraft at Spruce Creek" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <div className="w-12 h-12 bg-[#00447f]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-[#00447f]" />
              </div>
              <div className="text-2xl font-black text-[#00447f]">{value}</div>
              <div className="text-gray-400 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Transition Banner */}
      <div className="bg-[#f5f6f8] py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-3">An Important Update</p>
            <h3 className="text-xl font-black text-[#00447f] mb-3">Gardner Aircraft Sales & ClearBlue Aero</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Phil Gardner has chosen ClearBlue Aero to carry forward the same professionalism, quality, and trust that has defined Gardner Aircraft Sales since 1964.
            </p>
            <Link
              to="/gardner"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm border-2 border-[#00447f] text-[#00447f] hover:bg-[#00447f] hover:text-white transition-all"
            >
              Learn More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#00447f] py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Find Your Next Aircraft?</h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Browse our current inventory or reach out to our team directly. We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/inventory"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold text-sm transition-all hover:brightness-110"
              style={{ backgroundColor: '#C9A84C', color: '#00447f' }}
            >
              <Plane className="w-4 h-4" /> Browse Inventory <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="tel:+13862276840"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold text-sm border-2 border-white/20 text-white hover:bg-white/10 transition-all"
            >
              <Phone className="w-4 h-4" /> 386 227-6840
            </a>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/40">
            <a href="mailto:sales@flyclearblue.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4" /> sales@flyclearblue.com
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Spruce Creek Fly-in (7FL6)
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}