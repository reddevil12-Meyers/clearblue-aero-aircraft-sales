import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plane, Search, X, GripVertical, ArrowUpDown, Check, Link2, Globe, Plus, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { formatCurrency } from "../components/FormatCurrency";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ImportFromLinkDialog from "../components/aircraft/ImportFromLinkDialog";
import OptimizeImagesDialog from "../components/aircraft/OptimizeImagesDialog";

export default function Aircraft() {
  const [aircraft, setAircraft] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [makeFilter, setMakeFilter] = useState("all");
  const [engineTypeFilter, setEngineTypeFilter] = useState("all");
  const [siteFilter, setSiteFilter] = useState("all");
  const [reorderMode, setReorderMode] = useState(false);
  const [reorderList, setReorderList] = useState([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [optimizeOpen, setOptimizeOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      base44.entities.Aircraft.list('-created_date', 500),
      base44.entities.Client.list('-created_date', 200)
    ]).then(([aircraftData, clientData]) => {
      setAircraft(aircraftData);
      const clientMap = {};
      clientData.forEach(c => clientMap[c.id] = c);
      setClients(clientMap);
      setLoading(false);
    });
  }, []);

  // Single ordering rule shared by the main list and reorder mode so both views match:
  // 1) New records (no sort_order yet) appear at the top, newest first
  //    (list is fetched in -created_date order, so ties preserve it).
  // 2) Everything else follows the manual sort order exactly as saved.
  const byDisplayOrder = (a, b) => {
    const aHas = a.sort_order != null;
    const bHas = b.sort_order != null;
    if (!aHas && !bHas) return 0;
    if (!aHas) return -1;
    if (!bHas) return 1;
    return a.sort_order - b.sort_order;
  };

  const makes = [...new Set(aircraft.map(a => a.make).filter(Boolean))].sort();
  const hasFilters = search || statusFilter !== "all" || makeFilter !== "all" || engineTypeFilter !== "all" || siteFilter !== "all";

  const filtered = aircraft
    .filter(a => {
      const matchesSearch = !search || 
        `${a.make} ${a.model} ${a.registration} ${a.year} ${a.serial_number || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesMake = makeFilter === "all" || a.make === makeFilter;
      const matchesEngine = engineTypeFilter === "all" || a.engine_type === engineTypeFilter;
      const matchesSite = siteFilter === "all" || (a.published_sites || []).includes(siteFilter);
      return matchesSearch && matchesStatus && matchesMake && matchesEngine && matchesSite;
    })
    .sort(byDisplayOrder);

  const clearFilters = () => { setSearch(""); setStatusFilter("all"); setMakeFilter("all"); setEngineTypeFilter("all"); setSiteFilter("all"); };

  const enterReorderMode = () => {
    // Start from the exact order shown on the main list so dragging matches reality.
    setReorderList(aircraft.slice().sort(byDisplayOrder));
    setReorderMode(true);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(reorderList);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setReorderList(items);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    await Promise.all(
      reorderList.map((a, i) => base44.entities.Aircraft.update(a.id, { sort_order: i + 1 }))
    );
    // Refresh list
    const data = await base44.entities.Aircraft.list('-created_date', 500);
    setAircraft(data);
    setSavingOrder(false);
    setReorderMode(false);
  };

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
      >
        <Button size="sm" className="gap-2" onClick={() => navigate('/aircraft/new')}>
          <Plus className="w-4 h-4" /> Add Aircraft
        </Button>
        <Button size="sm" className="gap-2 bg-[#00447f] hover:bg-[#00447f]/90 text-white" onClick={() => setImportDialogOpen(true)}>
          <Link2 className="w-4 h-4" /> Import from Link
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={enterReorderMode}>
          <ArrowUpDown className="w-4 h-4" /> Reorder
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setOptimizeOpen(true)}>
          <Wand2 className="w-4 h-4" /> Optimize Photos
        </Button>
      </PageHeader>

      {/* Search & filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by reg, make, model, S/N..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Coming Soon">Coming Soon</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="For Lease">For Lease</SelectItem>
            <SelectItem value="Under Contract">Under Contract</SelectItem>
            <SelectItem value="Closing">Closing</SelectItem>
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
        <Select value={siteFilter} onValueChange={setSiteFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Published Site" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sites</SelectItem>
            <SelectItem value="clearblue">ClearBlue Aero</SelectItem>
            <SelectItem value="beechcraft">Beechcraft Buyers</SelectItem>
            <SelectItem value="gardner">Gardner Aircraft</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Reorder Mode */}
      {reorderMode && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-foreground">Drag to Reorder</p>
              <p className="text-xs text-muted-foreground">This order controls public inventory and featured aircraft display.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setReorderMode(false)}>Cancel</Button>
              <Button size="sm" className="gap-2" onClick={saveOrder} disabled={savingOrder}>
                <Check className="w-4 h-4" /> {savingOrder ? 'Saving...' : 'Save Order'}
              </Button>
            </div>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="aircraft-reorder">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {reorderList.map((a, i) => (
                    <Draggable key={a.id} draggableId={a.id} index={i}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 ${snapshot.isDragging ? 'shadow-lg ring-2 ring-accent/30' : ''}`}
                        >
                          <div {...provided.dragHandleProps} className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <span className="w-6 text-center text-xs font-bold text-muted-foreground">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground">{a.year} {a.make} {a.model}</p>
                            <p className="text-xs text-muted-foreground">{a.registration}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                            {a.featured && <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Featured</span>}
                            <StatusBadge status={a.status} />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {!reorderMode && filtered.length === 0 && !search && !statusFilter ? (
        <EmptyState 
          icon={Plane} 
          title="No Aircraft Yet" 
          description="Add your first aircraft to start tracking inventory and generating appraisals."
          actionLabel="Add Aircraft"
          onAction={() => navigate('/aircraft/new')}
        />
      ) : !reorderMode && (
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
              {a.seller_id && clients[a.seller_id] && (
                <p className="text-xs text-muted-foreground mb-2">
                  Owner: <button onClick={(e) => { e.preventDefault(); navigate(`/clients/${a.seller_id}`); }} className="text-primary hover:underline">
                    {clients[a.seller_id].first_name} {clients[a.seller_id].last_name}
                  </button>
                </p>
              )}
              {a.published_sites?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {a.published_sites.map(site => (
                    <span key={site} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary/5 text-primary">
                      <Globe className="w-2.5 h-2.5" />
                      {site === 'clearblue' ? 'ClearBlue' : site === 'beechcraft' ? 'Beechcraft' : 'Gardner'}
                    </span>
                  ))}
                </div>
              )}
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
      <ImportFromLinkDialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} />
      <OptimizeImagesDialog open={optimizeOpen} onClose={() => setOptimizeOpen(false)} />
    </div>
  );
}