import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plane, Search, SlidersHorizontal } from "lucide-react";

const ENGINE_TYPES = ["All", "Piston", "Turboprop", "Turbojet", "Turbofan"];

export default function Inventory() {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [engineFilter, setEngineFilter] = useState("All");

  useEffect(() => {
    base44.functions.invoke('getInventory', {})
      .then(res => { setAircraft(res.data.aircraft || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const STATUS_ORDER = { "Available": 0, "Under Contract": 1, "Sold": 2 };

  const filtered = aircraft
    .filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q || `${a.year} ${a.make} ${a.model} ${a.registration} ${a.location || ''}`.toLowerCase().includes(q);
      const matchEngine = engineFilter === "All" || a.engine_type === engineFilter;
      const matchStatus = a.status === "Available" || a.status === "Under Contract" || a.status === "Sold";
      return matchSearch && matchEngine && matchStatus;
    })
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99));

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      {/* Hero */}
      <div className="bg-[#1a1a1a] py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(45deg, transparent 48%, #B8232E 48%, #B8232E 52%, transparent 52%)' }} />
        <div className="relative">
          <p className="text-[#B8232E] text-xs font-bold uppercase tracking-[0.3em] mb-4">Beechcraft Buyers</p>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">Aircraft for Sale</h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">Premium pre-owned Beechcraft and quality aircraft, curated for serious buyers.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              className="bg-transparent text-sm outline-none w-full placeholder-gray-400"
              placeholder="Search by make, model, registration…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            {ENGINE_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setEngineFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${engineFilter === t ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                style={engineFilter === t ? { backgroundColor: '#B8232E' } : {}}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#B8232E]/20 border-t-[#B8232E] rounded-full animate-spin" />
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Plane className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold">No aircraft found</p>
            <p className="text-sm mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(a => (
            <Link key={a.id} to={`/inventory/${a.id}`} className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all block">
              <div className="aspect-video bg-gray-100 overflow-hidden relative">
                {a.images?.[0]
                  ? <img src={a.images[0]} alt={`${a.year} ${a.make} ${a.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center"><Plane className="w-12 h-12 text-gray-300" /></div>
                }
                {a.status && (
                  <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow ${
                    a.status === "Available" ? "bg-green-600 text-white" :
                    a.status === "Under Contract" ? "bg-amber-400 text-amber-900" :
                    a.status === "Sold" ? "bg-[#1a1a1a] text-white" :
                    a.status === "Off Market" ? "bg-red-500 text-white" :
                    "bg-blue-500 text-white"
                  }`}>
                    {a.status}
                  </span>
                )}
              </div>
              <div className="p-5 border-t-2 border-[#B8232E]/0 group-hover:border-[#B8232E]/100 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-black text-[#1a1a1a] text-lg leading-tight">{a.year} {a.make} {a.model}</p>
                    <p className="text-gray-400 text-sm mt-0.5">{a.registration}{a.location ? ` · ${a.location}` : ''}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  {a.total_time && <span>{a.total_time.toLocaleString()} TT</span>}
                  {a.engine_time_smoh && <span>{a.engine_time_smoh.toLocaleString()} SMOH</span>}
                  {a.engine_type && <span>{a.engine_type}</span>}
                </div>
                {a.asking_price && (
                  <p className="text-[#B8232E] font-black text-xl mt-4">${a.asking_price.toLocaleString()}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}