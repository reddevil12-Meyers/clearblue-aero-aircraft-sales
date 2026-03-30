import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Plane, SlidersHorizontal, X } from "lucide-react";
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

  return (
    <div>
      {/* Page Header */}
      <div className="py-16 text-white text-center" style={{ backgroundColor: '#0a1628' }}>
        <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Aircraft for Sale</h1>
        <p className="text-white/60 text-lg">{aircraft.length} aircraft currently available</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search make, model, registration..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex gap-2">
            {[{ label: "All Aircraft", val: "all" }, { label: "Single Engine", val: "single" }, { label: "Twin Engine", val: "twin" }].map(opt => (
              <button
                key={opt.val}
                onClick={() => setTypeFilter(opt.val)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${typeFilter === opt.val ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
                style={typeFilter === opt.val ? { backgroundColor: '#0a1628' } : {}}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Plane className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No aircraft found matching your criteria.</p>
            {search && (
              <button onClick={() => setSearch("")} className="mt-3 text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1 mx-auto">
                <X className="w-4 h-4" /> Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(a => (
              <Link key={a.id} to={`/public/inventory/${a.id}`} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-52 bg-gray-100 overflow-hidden">
                  {a.images?.[0] ? (
                    <img src={a.images[0]} alt={`${a.year} ${a.make} ${a.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#0a1628' }}>
                      <Plane className="w-12 h-12 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{a.year} {a.make} {a.model}</h3>
                    {a.status === 'Under Contract' && (
                      <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">Under Contract</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{a.registration} {a.location ? `· ${a.location}` : ''}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                    {a.total_time && <span className="bg-gray-50 px-2.5 py-1 rounded-full">{a.total_time.toLocaleString()} TT</span>}
                    {a.engine_type && <span className="bg-gray-50 px-2.5 py-1 rounded-full">{a.engine_type}</span>}
                    {a.avionics_suite && <span className="bg-gray-50 px-2.5 py-1 rounded-full">{a.avionics_suite}</span>}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-amber-600 font-semibold">View Details →</span>
                    <p className="text-xl font-bold" style={{ color: '#0a1628' }}>{formatCurrency(a.asking_price)}</p>
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