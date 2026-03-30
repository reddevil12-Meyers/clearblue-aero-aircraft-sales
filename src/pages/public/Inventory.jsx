import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const STATUS_BADGE = {
  "Available": "bg-green-100 text-green-700",
  "Under Contract": "bg-amber-100 text-amber-700",
  "Sold": "bg-gray-100 text-gray-500",
  "Off Market": "bg-red-100 text-red-600",
};

const PARTNERS = [
  { name: "Lima Bravo Aviation", url: "https://limabravoaviation.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2016/06/LB-logo-2024-300x94.png" },
  { name: "Columbus Aero Service", url: "http://www.columbusaeroservice.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2016/06/Columbus-Aero_144x144.png" },
  { name: "Gann Aviation", url: "http://www.gannaviation.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2017/12/Gann-Logo.png" },
];

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

  // Sort: Available first, then by status
  const STATUS_ORDER = { "Available": 0, "Under Contract": 1, "Sold": 2, "Off Market": 3 };
  const sorted = [...filtered].sort((a, b) => (STATUS_ORDER[a.status] ?? 4) - (STATUS_ORDER[b.status] ?? 4));

  const FILTER_TABS = [
    { key: "all", label: "View all" },
    { key: "single", label: "Single Engine" },
    { key: "twin", label: "Twin Engine" },
    ...MAKES.map(m => ({ key: m, label: m })),
    { key: "Sold", label: "Sold" },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-[#1a3a5c] py-12 text-center">
        <h1 className="text-4xl font-bold text-white">Inventory</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-10">
        {/* Main List */}
        <div className="lg:col-span-2">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filter === tab.key ? 'bg-[#1a3a5c] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#1a3a5c]/20 border-t-[#1a3a5c] rounded-full animate-spin" />
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-gray-500 text-center py-20">No aircraft found.</p>
          ) : (
            <div className="space-y-5">
              {sorted.map(ac => (
                <div key={ac.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md transition-shadow">
                  <div className="sm:w-48 h-40 sm:h-auto bg-gray-100 shrink-0">
                    {ac.images?.[0]
                      ? <img src={ac.images[0]} alt={`${ac.year} ${ac.make} ${ac.model}`} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Photo</div>
                    }
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-[#1a3a5c]">{ac.year} {ac.make} {ac.model}</h3>
                        {ac.status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_BADGE[ac.status] || 'bg-gray-100 text-gray-600'}`}>{ac.status}</span>
                        )}
                      </div>
                      {ac.asking_price && ac.status !== "Sold" && (
                        <p className="text-[#5b99cc] font-semibold mb-2">${ac.asking_price.toLocaleString()}</p>
                      )}
                      <div className="text-sm text-gray-600 space-y-0.5">
                        {ac.total_time && <p>TT: {ac.total_time.toLocaleString()} hrs</p>}
                        {ac.engine_time_smoh && <p>Engine SMOH: {ac.engine_time_smoh.toLocaleString()} hrs</p>}
                        {ac.location && <p>Location: {ac.location}</p>}
                        {ac.avionics_suite && <p>Avionics: {ac.avionics_suite}</p>}
                      </div>
                    </div>
                    <Link to={`/public/inventory/${ac.id}`} className="mt-4 inline-flex items-center gap-1 text-[#5b99cc] text-sm font-semibold hover:underline">
                      Details »
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <a href="mailto:info@flyclearblue.com" className="flex items-center gap-3 bg-[#4a9c6d] text-white px-5 py-3 rounded font-semibold text-sm hover:bg-[#3a8c5d] transition-colors w-full justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Email Us
          </a>
          <a href="http://www.banterraaircraft.com/loans/overview" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#4a9c6d] text-white px-5 py-3 rounded font-semibold text-sm hover:bg-[#3a8c5d] transition-colors w-full justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Apply for Financing
          </a>
          <a href="http://www.falconinsurance.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#4a9c6d] text-white px-5 py-3 rounded font-semibold text-sm hover:bg-[#3a8c5d] transition-colors w-full justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Get Insurance Quote
          </a>

          <div className="pt-4">
            <h4 className="text-sm font-bold text-[#1a3a5c] uppercase tracking-widest mb-4">Our Trusted Partners</h4>
            <div className="space-y-4">
              {PARTNERS.map(p => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer">
                  <img src={p.img} alt={p.name} className="h-12 object-contain grayscale hover:grayscale-0 transition-all" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}