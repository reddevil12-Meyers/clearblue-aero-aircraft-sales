import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Handshake, List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Deal.list('-created_date', 200).then(data => {
      setDeals(data);
      setLoading(false);
    });
  }, []);

  const handleStageChange = async (dealId, newStage) => {
    await base44.entities.Deal.update(dealId, { stage: newStage });
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader 
        title="Deal Pipeline" 
        subtitle={`${deals.length} deals`}
        actionLabel="New Deal"
        onAction={() => navigate('/deals/new')}
      >
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
        <DealKanban deals={deals} onStageChange={handleStageChange} />
      ) : (
        <DealTable deals={deals} />
      )}
    </div>
  );
}