import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/api/base44Client";
import { Plane } from "lucide-react";

export default function RelatedAircraft({ currentId, make }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase.from('aircraft')
      .select('id,registration,make,model,year,total_time,engine_time_smoh,asking_price,status,images,location')
      .eq('show_on_public', true)
      .eq('make', make)
      .neq('id', currentId)
      .limit(3)
      .then(({ data }) => {
        if (!cancelled) setRelated(data || []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [currentId, make]);

  if (loading || related.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-black text-[#00447f] mb-1 uppercase tracking-wide">
        More {make} Aircraft
      </h2>
      <p className="text-gray-400 text-xs mb-4">Similar aircraft currently in our inventory.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map(a => (
          <Link key={a.id} to={`/inventory/${a.id}`} className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all block">
            <div className="aspect-video bg-gray-100 overflow-hidden relative">
              {a.images && a.images[0]
                ? <img src={a.images[0]} alt={`${a.year} ${a.make} ${a.model}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                : <div className="w-full h-full flex items-center justify-center"><Plane className="w-10 h-10 text-gray-300" /></div>
              }
              {a.status && a.status !== "Available" && (
                <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-700 text-white">
                  {a.status}
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="font-black text-[#00447f] text-sm leading-tight">{a.year} {a.make} {a.model}</p>
              <p className="text-gray-400 text-xs mt-0.5">{a.registration}{a.location ? ` · ${a.location}` : ''}</p>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-400">
                {a.total_time != null && <span>{a.total_time.toLocaleString()} TT</span>}
                {a.engine_time_smoh != null && <span>{a.engine_time_smoh.toLocaleString()} SMOH</span>}
              </div>
              {a.asking_price ? (
                <p className="text-[#C9A84C] font-black text-base mt-1.5">${a.asking_price.toLocaleString()}</p>
              ) : (
                <p className="text-[#C9A84C] font-black text-sm mt-1.5">Call for Pricing</p>
              )}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4 text-right">
        <Link to="/inventory" className="text-[#00447f] text-sm font-bold hover:underline">View all aircraft →</Link>
      </div>
    </div>
  );
}