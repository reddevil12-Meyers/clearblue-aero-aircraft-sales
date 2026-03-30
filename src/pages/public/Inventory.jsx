import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Plane, ArrowRight, X } from "lucide-react";
import { formatCurrency } from "../../components/FormatCurrency";

export default function PublicInventory() {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    if (type) setTypeFilter(type);
  }, [location.search]);

  useEffect(() => {
    base44.entities.Aircraft.filter({ show_on_public: true }, '-created_date', 100)
      .then(data => { setAircraft(data.filter(a => a.status !== 'Sold')); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = aircraft.filter(a => {
    const matchSearch = !search ||
      `${a.make} ${a.model} ${a.year} ${a.registration}`.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" ||
      (typeFilter === "single" && a.num_engines === 1) ||
      (typeFilter === "twin" && a.num_engines >= 2);
    return matchSearch && matchType;
  });

  const available = filtered.filter(a => a.status === 'Available');
  const other = filtered.filter(a => a.status !== 'Available');
  const sorted = [...available, ...other];

  return (
    <div className="bg-white min-h-screen w-full">
      {/* Page Header */}
      <div className="bg-[#00447f] py-20 px-4 text-center">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">ClearBlue Aero</p>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Aircraft for Sale
        </h1>
        <p className="text-white/40 text-base md:text-lg">{aircraft.length} aircraft currently available</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 pb-6 border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search make, model, N-number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 bg-[#f5f6f8]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {[
              { label: "All", val: "all" },
              { label: "Single Engine", val: "single" },
              { label: "Twin Engine", val: "twin" },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setTypeFilter(opt.val)}
                className={`flex-1 sm:flex-none px-4 py-3 rounded-lg text-sm font-bold tracking-wide transition-all ${
                  typeFilter === opt.val ? 'text-[#00447f]' : 'bg-[#f5f6f8] text-gray-500 hover:text-gray-800'
                }`}
                style={typeFilter === opt.val ? { backgroundColor: '#C9A84C' } : {}}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-6 font-medium">{sorted.length} results</p>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-10 h-10 border-4 border-[#C9A84C]/20 border-t-[#C9A84C] rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-gray-200 rounded-2xl">
            <Plane className="w-16 h-16 text-gray-200 mx-auto mb-5" />
            <p className="text-gray-400 text-lg mb-3">No aircraft match your criteria.</p>
            <button onClick={() => { setSearch(""); setTypeFilter("all"); }} className="text-sm font-bold text-[#C9A84C] hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map(a => (
              <Link
                key={a.id}
                to={`/public/inventory/${a.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className="relative h-48 bg-[#00447f] overflow-hidden">
                  {a.images?.[0] ? (
                    <img src={a.images[0]} alt={`${a.year} ${a.make} ${a.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Plane className="w-14 h-14 text-white/10" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {a.featured && (
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded text-[#00447f] uppercase tracking-wide" style={{ backgroundColor: '#C9A84C' }}>Featured</span>
                    </div>
                  )}
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
                    {a.engine_type && <span className="text-xs bg-[#f5f6f8] text-gray-500 px-2.5 py-1 rounded-full font-medium">{a.engine_type}</span>}
                    {a.total_time && <span className="text-xs bg-[#f5f6f8] text-gray-500 px-2.5 py-1 rounded-full font-medium">{a.total_time.toLocaleString()} TT</span>}
                    {a.avionics_suite && <span className="text-xs bg-[#f5f6f8] text-gray-500 px-2.5 py-1 rounded-full font-medium truncate max-w-[120px]">{a.avionics_suite}</span>}
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
      </div>
    </div>
  );
}