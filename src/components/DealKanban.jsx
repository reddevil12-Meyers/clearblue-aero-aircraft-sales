import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatCurrency } from "./FormatCurrency";

const STAGES = ["Lead", "Qualification", "Showing", "Offer", "Negotiation", "Pre-Buy Inspection", "Escrow", "Closing", "Closed Won", "Closed Lost"];

export default function DealKanban({ deals, onStageChange }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {STAGES.map(stage => {
        const stageDeals = deals.filter(d => d.stage === stage);
        const stageValue = stageDeals.reduce((s, d) => s + (d.asking_price || 0), 0);

        return (
          <div 
            key={stage} 
            className="bg-muted/50 rounded-xl"
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              const dealId = e.dataTransfer.getData("dealId");
              if (dealId) onStageChange(dealId, stage);
            }}
          >
            {/* Column Header */}
            <div className="px-3 py-3 border-b border-border/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{stage}</span>
                <span className="text-xs bg-background text-muted-foreground rounded-full px-2 py-0.5">{stageDeals.length}</span>
              </div>
              {stageValue > 0 && <p className="text-xs text-muted-foreground">{formatCurrency(stageValue)}</p>}
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 min-h-[100px]">
              {stageDeals.map(deal => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={e => e.dataTransfer.setData("dealId", deal.id)}
                  onClick={() => navigate(`/deals/${deal.id}`)}
                  className="bg-card rounded-lg border border-border p-3 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-accent/30"
                >
                  <p className="text-sm font-medium mb-1 line-clamp-1">{deal.title}</p>
                  {deal.aircraft_summary && <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{deal.aircraft_summary}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{formatCurrency(deal.offer_price || deal.asking_price)}</span>
                    {deal.priority && deal.priority !== 'Medium' && <StatusBadge status={deal.priority} />}
                  </div>
                  {deal.buyer_name && <p className="text-xs text-muted-foreground mt-1.5">{deal.buyer_name}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}