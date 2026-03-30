import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plane, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_ORDER = { 'Available': 0, 'Under Contract': 1, 'Sold': 2, 'Off Market': 3 };

const statusColors = {
  'Available': 'bg-green-100 text-green-800',
  'Under Contract': 'bg-yellow-100 text-yellow-800',
  'Sold': 'bg-red-100 text-red-700',
  'Off Market': 'bg-gray-100 text-gray-600',
};

export default function PublicInventory() {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    base44.entities.Aircraft.filter({ show_on_public: true }).then(data => {
      setAircraft(data);
      setLoading(false);
    });
  }, []);

  const filtered = aircraft
    .filter(a => {
      const matchesSearch = !search ||
        `${a.make} ${a.model} ${a.registration} ${a.year}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-display font-bold text-primary mb-3">Aircraft For Sale</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Browse our current inventory of quality pre-owned aircraft. Every aircraft is carefully evaluated by our team.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by make, model, or registration..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Under Contract">Under Contract</SelectItem>
            <SelectItem value="Sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <Plane className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Aircraft Found</h3>
          <p className="text-muted-foreground">Check back soon — new listings are added regularly.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(a => (
            <Link
              key={a.id}
              to={`/public/inventory/${a.id}`}
              className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl hover:border-accent/40 transition-all duration-300 group"
            >
              {a.images && a.images.length > 0 ? (
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={a.images[0]}
                    alt={`${a.year} ${a.make} ${a.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Plane className="w-10 h-10 text-muted-foreground/40" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground text-lg leading-tight">{a.year} {a.make} {a.model}</h3>
                  <span className={`ml-2 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[a.status] || 'bg-gray-100 text-gray-600'}`}>
                    {a.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{a.registration}{a.location ? ` • ${a.location}` : ''}</p>
                <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
                  <span className="text-muted-foreground">{a.total_time ? `${a.total_time.toLocaleString()} TT` : '—'}</span>
                  <span className="font-bold text-primary">
                    {a.asking_price ? `$${a.asking_price.toLocaleString()}` : 'Call for Price'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}