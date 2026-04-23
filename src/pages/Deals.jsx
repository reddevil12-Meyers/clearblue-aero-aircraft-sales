import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Handshake, List, LayoutGrid, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { formatCurrency } from "../components/FormatCurrency";
import DealKanban from "../components/DealKanban";
import DealTable from "../components/DealTable";

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("kanban");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Deal.list('-created_date', 200).then(data => {
      setDeals(data);
      setLoading(false);
    });
  }, []);

  const hasFilters = search || stageFilter !== "all" || priorityFilter !== "all";

  const filteredDeals = deals.filter(d => {
    const text = `${d.title || ''} ${d.buyer_name || ''} ${d.seller_name || ''} ${d.aircraft_summary || ''}`.toLowerCase();
    const matchesSearch = !search || text.includes(search.toLowerCase());
    const matchesStage = stageFilter === "all" || d.stage === stageFilter;
    const matchesPriority = priorityFilter === "all" || d.priority === priorityFilter;
    return matchesSearch && matchesStage && matchesPriority;
  });

  const clearFilters = () => { setSearch(""); setStageFilter("all"); setPriorityFilter("all"); };

  const handleStageChange = async (dealId, newStage) => {
    await base44.entities.Deal.update(dealId, { stage: newStage });
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader 
        title="Deal Pipeline" 
        subtitle={`${filteredDeals.length} of ${deals.length} deals`}
        actionLabel="New Deal"
        onAction={() => navigate('/deals/new')}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48 lg:w-64" />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="Lead">Lead</SelectItem>
            <SelectItem value="Qualification">Qualification</SelectItem>
            <SelectItem value="Showing">Showing</SelectItem>
            <SelectItem value="Offer">Offer</SelectItem>
            <SelectItem value="Negotiation">Negotiation</SelectItem>
            <SelectItem value="Pre-Buy Inspection">Pre-Buy Inspection</SelectItem>
            <SelectItem value="Escrow">Escrow</SelectItem>
            <SelectItem value="Closing">Closing</SelectItem>
            <SelectItem value="Closed Won">Closed Won</SelectItem>
            <SelectItem value="Closed Lost">Closed Lost</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="Urgent">Urgent</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <Button variant={view === "kanban" ? "secondary" : "ghost"} size="sm" className="rounded-none" onClick={() => setView("kanban")}>
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button variant={view === "table" ? "secondary" : "ghost"} size="sm" className="rounded-none" onClick={() => setView("table")}>
            <List className="w-4 h-4" />
          </Button>
        </div>
      </PageHeader>

      {deals.length === 0 ? (
        <EmptyState icon={Handshake} title="No Deals Yet" description="Start tracking aircraft transactions through your deal pipeline." actionLabel="New Deal" onAction={() => navigate('/deals/new')} />
      ) : view === "kanban" ? (
        <DealKanban deals={filteredDeals} onStageChange={handleStageChange} />
      ) : (
        <DealTable deals={filteredDeals} />
      )}
    </div>
  );
}