import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatCurrency } from "./FormatCurrency";
import moment from "moment";

export default function DealTable({ deals }) {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Deal</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Aircraft</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stage</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Asking</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Offer</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Priority</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Close Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deals.map(d => (
              <tr key={d.id} className="hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(`/deals/${d.id}`)}>
                <td className="px-5 py-3.5">
                  <p className="text-sm font-medium">{d.title}</p>
                  {d.buyer_name && <p className="text-xs text-muted-foreground">{d.buyer_name}</p>}
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground hidden sm:table-cell">{d.aircraft_summary || '—'}</td>
                <td className="px-5 py-3.5"><StatusBadge status={d.stage} /></td>
                <td className="px-5 py-3.5 text-sm font-medium hidden md:table-cell">{formatCurrency(d.asking_price)}</td>
                <td className="px-5 py-3.5 text-sm hidden md:table-cell">{formatCurrency(d.offer_price)}</td>
                <td className="px-5 py-3.5 hidden lg:table-cell"><StatusBadge status={d.priority} /></td>
                <td className="px-5 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">
                  {d.expected_close_date ? moment(d.expected_close_date).format('MMM D, YYYY') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}