import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plane } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NAVY = "#1B365D";
const GOLD = "#C4A35A";
const SLATE = "#334155";

// Antique, Classic, and Contemporary eras all fall on or before 1970
const VINTAGE_MAX_YEAR = 1970;

export default function DeskListings({ slug }) {
  const [listings, setListings] = useState(null);

  useEffect(() => {
    base44.functions.invoke("getPublicInventory", {})
      .then(res => {
        const all = res.data.aircraft || [];
        const matches = slug === "vintage"
          ? all.filter(a => a.year && Number(a.year) <= VINTAGE_MAX_YEAR)
          : all.filter(a => a.make && a.make.toLowerCase() === slug.toLowerCase());
        setListings(matches.slice(0, 4));
      })
      .catch(() => setListings([]));
  }, [slug]);

  if (!listings) {
    return (
      <div className="max-w-7xl mx-auto mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden">
            <div className="aspect-video bg-gray-100 animate-pulse" />
            <div className="p-5 space-y-2">
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto mt-12">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map(a => (
          <Link
            key={a.id}
            to={`/inventory/${a.id}`}
            className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow block bg-white"
          >
            <div className="aspect-video bg-gray-100 overflow-hidden relative">
              {a.images?.[0] ? (
                <img
                  src={a.images[0]}
                  alt={`${a.year} ${a.make} ${a.model}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Plane className="w-12 h-12 text-gray-300" />
                </div>
              )}
              {a.status && a.status !== "Available" && (
                <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded shadow-md text-white" style={{ backgroundColor: NAVY }}>
                  {a.status}
                </span>
              )}
            </div>
            <div className="p-5">
              <p className="font-black text-lg" style={{ color: NAVY }}>
                {a.year} {a.make} {a.model}
              </p>
              <p className="text-gray-400 text-sm">{a.registration}</p>
              {a.status === "Sold" ? (
                <p className="text-gray-400 font-bold mt-2">Sold</p>
              ) : a.status === "Coming Soon" && !a.asking_price ? (
                <p className="font-bold mt-2" style={{ color: GOLD }}>Call for early access</p>
              ) : a.asking_price ? (
                <p className="font-bold mt-2" style={{ color: GOLD }}>${a.asking_price.toLocaleString()}</p>
              ) : (
                <p className="font-bold mt-2" style={{ color: GOLD }}>Call for Pricing</p>
              )}
            </div>
          </Link>
        ))}
      </div>
      <p className="text-center text-xs mt-6" style={{ color: SLATE }}>
        A sample of this desk's current and sold aircraft. The full inventory lives in one place.
      </p>
    </div>
  );
}