import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plane, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { formatCurrency } from "../components/FormatCurrency";

export default function Aircraft() {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [makeFilter, setMakeFilter] = useState("all");
  const [engineTypeFilter, setEngineTypeFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Aircraft.list('-created_date', 100).then(data => {
      setAircraft(data);
      setLoading(false);
    });
  }, []);

  const STATUS_ORDER = { 'Available': 0, 'Under Contract': 1, 'Sold': 2, 'Off Market': 3, 'Appraisal Only': 4 };

  const makes = [...new Set(aircraft.map(a => a.make).filter(Boolean))].sort();
  const hasFilters = search || statusFilter !== "all" || makeFilter !== "all" || engineTypeFilter !== "all";

  const filtered = aircraft
    .filter(a => {
      const matchesSearch = !search || 
        `${a.make} ${a.model} ${a.registration} ${a.year} ${a.serial_number || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesMake = makeFilter === "all" || a.make === makeFilter;
      const matchesEngine = engineTypeFilter === "all" || a.engine_type === engineTypeFilter;
      return matchesSearch && matchesStatus && matchesMake && matchesEngine;
    })
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99));

  const clearFilters = () => { setSearch(""); setStatusFilter("all"); setMakeFilter("all"); setEngineTypeFilter("all"); };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <PageHeader 
        title="Aircraft Inventory" 
        subtitle={`${filtered.length} of ${aircraft.length} aircraft`}
        actionLabel="Add Aircraft"
        onAction={() => navigate('/aircraft/new')}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by reg, make, model, S/N..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9 w-48 lg:w-72"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Under Contract">Under Contract</SelectItem>
            <SelectItem value="Sold">Sold</SelectItem>
            <SelectItem value="Off Market">Off Market</SelectItem>
            <SelectItem value="Appraisal Only">Appraisal Only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={makeFilter} onValueChange={setMakeFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="All Makes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Makes</SelectItem>
            {makes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={engineTypeFilter} onValueChange={setEngineTypeFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Engine Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Engines</SelectItem>
            <SelectItem value="Piston">Piston</SelectItem>
            <SelectItem value="Turboprop">Turboprop</SelectItem>
            <SelectItem value="Turbojet">Turbojet</SelectItem>
            <SelectItem value="Turbofan">Turbofan</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </PageHeader>

      {filtered.length === 0 && !search && !statusFilter ? (
        <EmptyState 
          icon={Plane} 
          title="No Aircraft Yet" 
          description="Add your first aircraft to start tracking inventory and generating appraisals."
          actionLabel="Add Aircraft"
          onAction={() => navigate('/aircraft/new')}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(a => (
            <Link 
              key={a.id} 
              to={`/aircraft/${a.id}`}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-accent/30 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <Plane className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
                </div>
                <StatusBadge status={a.status} />
              </div>
              <h3 className="font-semibold text-foreground mb-0.5">{a.year} {a.make} {a.model}</h3>
              <p className="text-sm text-muted-foreground mb-3">{a.registration} {a.serial_number ? `• S/N ${a.serial_number}` : ''}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                <span>{a.total_time ? `${a.total_time.toLocaleString()} TT` : '—'}</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(a.asking_price)}</span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
              No aircraft match your search criteria
            </div>
          )}
        </div>
      )}
    </div>
  );
}