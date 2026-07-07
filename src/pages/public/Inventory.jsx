import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plane, Search, ChevronDown } from "lucide-react";

const ENGINE_TYPES = ["All", "Piston", "Turboprop", "Turbojet", "Turbofan"];

const SORT_OPTIONS = [
  { value: "status", label: "Status (Available First)" },
  { value: "year_desc", label: "Year (Newest)" },
  { value: "year_asc", label: "Year (Oldest)" },
  { value: "price_low", label: "Price (Low to High)" },
  { value: "price_high", label: "Price (High to Low)" },
  { value: "name_az", label: "Aircraft Name (A-Z)" },
];

const HERO_IMAGE = "https://images.unsplash.com/photo-1597149961416-a6e6e5f10ee6?w=1600&q=80";

export default function PublicInventory() {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [engineFilter, setEngineFilter] = useState("All");
  const [sortBy, setSortBy] = useState("status");
  const [showSold, setShowSold] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    base44.functions.invoke('getPublicInventory', { limit: 12, offset: 0 })
      .then(res => { setAircraft(res.data.aircraft || []); setHasMore(res.data.hasMore || false); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await base44.functions.invoke('getPublicInventory', { limit: 12, offset: aircraft.length });
      setAircraft(prev => [...prev, ...(res.data.aircraft || [])]);
      setHasMore(res.data.hasMore || false);
    } catch { /* ignore */ }
    setLoadingMore(false);
  };

  const STATUS_ORDER = { "Available": 0, "Under Contract": 1, "Sold": 2 };

  const filtered = aircraft
    .filter(a => {
      if (!showSold && a.status === "Sold") return false;
      const q = search.toLowerCase();
      const matchSearch = !q || `${a.year} ${a.make} ${a.model} ${a.registration} ${a.location || ''}`.toLowerCase().includes(q);
      const matchEngine = engineFilter === "All" || a.engine_type === engineFilter;
      return matchSearch && matchEngine;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "year_desc": return (b.year || 0) - (a.year || 0);
        case "year_asc": return (a.year || 0) - (b.year || 0);
        case "price_low": return (a.asking_price || 0) - (b.asking_price || 0);
        case "price_high": return (b.asking_price || 0) - (a.asking_price || 0);
        case "name_az": return `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`);
        default: return (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      }
    });

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || "Sort By";

  return (
    <div className="bg-[#f4f4f4] min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="Aircraft" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0d1a26]/85" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-20 md:py-28 text-center">
          <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-4">
            Buy <span className="mx-1">/</span> Aircraft For Sale
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-6">Aircraft for Sale</h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Explore our hand-selected inventory of piston, turboprop, and jet aircraft. Every listing is personally vetted
            by our brokerage team — backed by decades of aviation experience and a commitment to honest, straightforward service.
          </p>
          <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest">
            Ready to learn more?
          </p>
          <p className="text-white/50 text-sm mt-1">Contact our sales team directly from each listing page.</p>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            {/* Aircraft type buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-[#0d1a26] hidden sm:block mr-1">Select Type:</span>
              {ENGINE_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setEngineFilter(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all border ${
                    engineFilter === t
                      ? 'bg-[#0d1a26] text-white border-[#0d1a26]'
                      : 'bg-white text-[#0d1a26] border-gray-300 hover:border-[#0d1a26]'
                  }`}
                >
                  {t === "All" ? "All Types" : t}
                </button>
              ))}
            </div>

            {/* Search + sort */}
            <div className="flex items-center gap-3 flex-1 sm:flex-none min-w-[200px] sm:max-w-md">
              <div className="flex items-center gap-2 flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  className="bg-transparent text-sm outline-none w-full placeholder-gray-400"
                  placeholder="Search aircraft…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sort + sold toggle row */}
          <div className="flex flex-wrap gap-3 items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showSold}
                  onChange={e => setShowSold(e.target.checked)}
                  className="w-4 h-4 accent-[#0d1a26] cursor-pointer"
                />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Show Sold Aircraft</span>
              </label>
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-xs font-semibold text-[#0d1a26] hover:border-[#0d1a26] transition-all"
              >
                <span className="text-gray-400">Sort By:</span>
                <span>{currentSortLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                  <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                          sortBy === opt.value ? 'bg-[#0d1a26] text-white' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#0d1a26]/20 border-t-[#0d1a26] rounded-full animate-spin" />
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
            <Link key={a.id} to={`/inventory/${a.id}`} className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 block">
              {/* Image */}
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                {a.images?.[0]
                  ? <img src={a.images[0]} alt={`${a.year} ${a.make} ${a.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center"><Plane className="w-12 h-12 text-gray-300" /></div>
                }
                {/* Location tag - top left */}
                {a.location && (
                  <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded bg-[#0d1a26] text-white shadow-md">
                    {a.location}
                  </span>
                )}
                {/* Status tag - top right */}
                {a.status && a.status !== "Available" && (
                  <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded shadow-md ${
                    a.status === "Under Contract" ? "bg-amber-400 text-amber-900" :
                    a.status === "Sold" ? "bg-red-600 text-white" :
                    "bg-blue-500 text-white"
                  }`}>
                    {a.status}
                  </span>
                )}
              </div>
              {/* Card body */}
              <div className="p-5">
                {/* Price */}
                <div className="mb-2">
                  {a.asking_price && a.status !== "Sold" ? (
                    <p className="text-2xl font-black text-[#0d1a26]">${a.asking_price.toLocaleString()}</p>
                  ) : a.status === "Sold" ? (
                    <p className="text-2xl font-black text-gray-400">Sold</p>
                  ) : (
                    <p className="text-2xl font-black text-[#0d1a26]">Price on Request</p>
                  )}
                </div>
                {/* Title */}
                <p className="font-bold text-[#0d1a26] text-base leading-tight">
                  {a.year} {a.make} {a.model}
                </p>
                <p className="text-gray-500 text-sm mt-0.5">{a.registration}</p>
                {/* Specs */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  {a.total_time != null && <span>{a.total_time.toLocaleString()} Total Time</span>}
                  {a.engine_time_smoh != null && <span>{a.engine_time_smoh.toLocaleString()} SMOH</span>}
                  {a.engine_type && <span>{a.engine_type}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && hasMore && search === "" && engineFilter === "All" && (
          <div className="text-center mt-10">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md font-bold text-sm uppercase tracking-wide transition-all hover:brightness-110"
              style={{ backgroundColor: '#0d1a26', color: '#fff' }}
            >
              {loadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>Load More Aircraft</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}