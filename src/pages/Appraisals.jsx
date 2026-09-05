import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { FileText, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { formatCurrency } from "../components/FormatCurrency";
import moment from "moment";

export default function Appraisals() {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [valueByAppraisal, setValueByAppraisal] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Appraisal.list('-created_date', 200).then(data => {
      setAppraisals(data);
      setLoading(false);
    });
    base44.entities.ValuationRun.list('-run_date', 500).then(runs => {
      const map = {};
      runs.forEach(r => {
        if (r.appraisal_id && !(r.appraisal_id in map)) map[r.appraisal_id] = r.adjusted_value;
      });
      setValueByAppraisal(map);
    });
  }, []);

  const hasFilters = search || statusFilter !== "all" || typeFilter !== "all" || dateFrom || dateTo;

  const filtered = appraisals.filter(a => {
    const text = `${a.aircraft_summary || ''} ${a.client_name || ''} ${a.appraisal_number || ''}`.toLowerCase();
    const matchesSearch = !search || text.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesType = typeFilter === "all" || a.appraisal_type === typeFilter;
    const appraisalDate = a.appraisal_date || a.created_date;
    const matchesFrom = !dateFrom || new Date(appraisalDate) >= new Date(dateFrom);
    const matchesTo = !dateTo || new Date(appraisalDate) <= new Date(dateTo + 'T23:59:59');
    return matchesSearch && matchesStatus && matchesType && matchesFrom && matchesTo;
  });

  const clearFilters = () => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); setDateFrom(""); setDateTo(""); };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <PageHeader 
        title="Appraisals" 
        subtitle={`${filtered.length} of ${appraisals.length} appraisals`}
      >
        <Button onClick={() => navigate('/appraisals/new')} className="gap-2">
          <FileText className="w-4 h-4" />
          New Appraisal
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search aircraft, client, #..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48 lg:w-64" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
            <SelectItem value="Final">Final</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Desktop">Desktop</SelectItem>
            <SelectItem value="On-Site Inspection">On-Site</SelectItem>
            <SelectItem value="Pre-Purchase">Pre-Purchase</SelectItem>
            <SelectItem value="Insurance">Insurance</SelectItem>
            <SelectItem value="Estate/Tax">Estate/Tax</SelectItem>
            <SelectItem value="Financing">Financing</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="shrink-0">From</span>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-36 h-8 text-xs" />
          <span className="shrink-0">To</span>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-36 h-8 text-xs" />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </PageHeader>

      {filtered.length === 0 && !search ? (
        <EmptyState icon={FileText} title="No Appraisals Yet" description="Create your first professional aircraft appraisal." actionLabel="New Appraisal" onAction={() => navigate('/appraisals/new')} />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Appraisal</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Client</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Value</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(`/appraisals/${a.id}`)}>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium">{a.aircraft_summary || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground">{a.appraisal_number || `#${a.id.slice(0,8)}`}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground hidden sm:table-cell">{a.appraisal_type}</td>
                    <td className="px-5 py-3.5 text-sm hidden md:table-cell">{a.client_name || '-'}</td>
                    <td className="px-5 py-3.5 text-sm font-medium">{formatCurrency(valueByAppraisal[a.id] ?? a.market_value)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">
                      {a.appraisal_date ? moment(a.appraisal_date).format('MMM D, YYYY') : moment(a.created_date).format('MMM D, YYYY')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No appraisals match your search</p>}
        </div>
      )}
    </div>
  );
}