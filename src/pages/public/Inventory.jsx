import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, SlidersHorizontal, Plane } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PublicInventory() {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [makeFilter, setMakeFilter] = useState("all");

  useEffect(() => {
    base44.entities.Aircraft.filter({ show_on_public: true })
      .then((data) => setAircraft(data || []))
      .finally(() => setLoading(false));
  }, []);

  const makes = [...new Set(aircraft.map((a) => a.make).filter(Boolean))];

  const filtered = aircraft.filter((a) => {
    const matchesSearch =
      !search ||
      `${a.year} ${a.make} ${a.model} ${a.registration}`.toLowerCase().includes(search.toLowerCase());
    const matchesMake = makeFilter === "all" || a.make === makeFilter;
    return matchesSearch && matchesMake;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16 px-6 text-center">
        <h1 className="font-display text-4xl font-bold mb-3">Aircraft Inventory</h1>
        <p className="text-primary-foreground/75 text-lg">Browse our current selection of quality aircraft</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by make, model, registration..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={makeFilter} onValueChange={setMakeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Makes</SelectItem>
              {makes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Plane className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No aircraft found</p>
            <p className="text-sm mt-1">Check back soon or contact us for off-market listings.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a) => (
              <Link key={a.id} to={`/public/inventory/${a.id}`} className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                {a.images?.[0] ? (
                  <img src={a.images[0]} alt={`${a.year} ${a.make} ${a.model}`} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <Plane className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-foreground text-lg">{a.year} {a.make} {a.model}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{a.registration} {a.location ? `· ${a.location}` : ""}</p>
                  <div className="flex items-center justify-between">
                    {a.asking_price ? (
                      <span className="font-bold text-accent text-lg">${a.asking_price.toLocaleString()}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Price on request</span>
                    )}
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">{a.status || "Available"}</span>
                  </div>
                  {a.total_time && <p className="text-xs text-muted-foreground mt-2">{a.total_time.toLocaleString()} hrs TT</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}