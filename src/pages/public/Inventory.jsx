import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const STATUS_BADGE = {
  "Available": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Under Contract": "bg-amber-50 text-amber-700 border border-amber-200",
  "Sold": "bg-gray-100 text-gray-500 border border-gray-200",
  "Off Market": "bg-red-50 text-red-600 border border-red-200",
};

const STATUS_ORDER = { "Available": 0, "Under Contract": 1, "Sold": 2, "Off Market": 3 };

export default function PublicInventory() {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "single") setFilter("single");
    else if (typeParam === "twin") setFilter("twin");
  }, [searchParams]);

  useEffect(() => {
    base44.entities.Aircraft.filter({ show_on_public: true }, '-created_date', 50)
      .then(data => { setAircraft(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const MAKES = [...new Set(aircraft.map(a => a.make).filter(Boolean))].sort();

  const filtered = aircraft.filter(ac => {
    if (filter === "single") return ac.num_engines === 1 || ac.num_engines === "1";
    if (filter === "twin") return ac.num_engines > 1 || ac.num_engines === "2";
    if (filter !== "all") return ac.make === filter;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (STATUS_ORDER[a.status] ?? 4) - (STATUS_ORDER[b.status] ?? 4));

  const FILTER_TABS = [
    { key: "all", label: "All Aircraft" },
    { key: "single", label: "Single Engine" },
    { key: "twin", label: "Twin Engine" },
    ...MAKES.map(m => ({ key: m, label: m })),
    { key: "Sold", label: "Sold" },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="relative py-28 px-6 text-center" style={{ backgroundColor: '#0a1628' }}>
        <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">Browse</p>
        <h1 className="text-5xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Aircraft Inventory</h1>
        <p className="text-white/50 mt-4 max-w-md mx-auto">Handpicked, thoroughly vetted aircraft ready for their next owner.</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              style={filter === tab.key ? { backgroundColor: '#0a1628' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-32 text-gray-400">
            <p className="text-lg font-medium">No aircraft found</p>
            <p className="text-sm mt-1">Try a different filter</p>
          </div>
        ) : (
          <div className="space-y-5">
            {sorted.map(ac => (
              <Link
                key={ac.id}
                to={`/public/inventory/${ac.id}`}
                className="flex flex-col sm:flex-row bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="sm:w-56 h-48 sm:h-auto bg-gray-100 shrink-0 overflow-hidden">
                  {ac.images?.[0]
                    ? <img src={ac.images[0]} alt={`${ac.year} ${ac.make} ${ac.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Photo</div>
                  }
                </div>
                <div className="p-7 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors">{ac.year} {ac.make} {ac.model}</h3>
                      {ac.status && (
                        <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${STATUS_BADGE[ac.status] || 'bg-gray-100 text-gray-500'}`}>
                          {ac.status}
                        </span>
                      )}
                    </div>
                    {ac.asking_price && ac.status !== "Sold" && (
                      <p className="text-2xl font-bold text-amber-600 mb-4">${ac.asking_price.toLocaleString()}</p>
                    )}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
                      {ac.registration && <span>{ac.registration}</span>}
                      {ac.total_time && <span>TT: {ac.total_time.toLocaleString()} hrs</span>}
                      {ac.engine_time_smoh && <span>SMOH: {ac.engine_time_smoh.toLocaleString()} hrs</span>}
                      {ac.location && <span>📍 {ac.location}</span>}
                      {ac.avionics_suite && <span>{ac.avionics_suite}</span>}
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-gray-400 group-hover:text-amber-600 transition-colors">
                    View Details <span className="text-lg">→</span>
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