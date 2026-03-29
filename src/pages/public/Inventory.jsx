import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formatCurrency = (val) => val ? `$${Number(val).toLocaleString()}` : "Call for Price";

export default function PublicInventory() {
  const navigate = useNavigate();
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [makeFilter, setMakeFilter] = useState("all");

  useEffect(() => {
    base44.entities.Aircraft.filter({ show_on_public: true }).then(data => {
      setAircraft(data);
      setLoading(false);
    }).catch(() => {
      base44.entities.Aircraft.list().then(data => {
        setAircraft(data.filter(a => a.show_on_public));
        setLoading(false);
      });
    });
  }, []);

  const makes = ["all", ...Array.from(new Set(aircraft.map(a => a.make).filter(Boolean)))];

  const filtered = aircraft.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${a.make} ${a.model} ${a.year} ${a.registration} ${a.location}`.toLowerCase().includes(q);
    const matchMake = makeFilter === "all" || a.make === makeFilter;
    return matchSearch && matchMake;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="bg-primary text-primary-foreground py-14 px-6 text-center">
        <h1 className="text-4xl font-display font-bold mb-3">Aircraft Inventory</h1>
        <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
          Browse our curated selection of quality pre-owned aircraft.
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by make, model, year, registration..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={makeFilter} onValueChange={setMakeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Makes" />
            </SelectTrigger>
            <SelectContent>
              {makes.map(m => (
                <SelectItem key={m} value={m}>{m === "all" ? "All Makes" : m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg font-medium">No aircraft found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(a => (
              <div
                key={a.id}
                onClick={() => navigate(`/public/inventory/${a.id}`)}
                className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
              >
                {/* Image or Placeholder */}
                <div className="h-48 bg-muted flex items-center justify-center overflow-hidden">
                  {a.images && a.images.length > 0 ? (
                    <img src={a.images[0]} alt={`${a.year} ${a.make} ${a.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-4xl">✈️</span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {a.year} {a.make} {a.model}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{a.registration} {a.location ? `· ${a.location}` : ""}</p>

                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                    {a.total_time && <span>TT: {a.total_time.toLocaleString()} hrs</span>}
                    {a.engine_type && <span>{a.engine_type}</span>}
                    {a.avionics_suite && <span className="col-span-2">{a.avionics_suite}</span>}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-foreground">{formatCurrency(a.asking_price)}</span>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}