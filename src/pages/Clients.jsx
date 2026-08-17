import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Users, Search, Phone, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import moment from "moment";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leadSourceFilter, setLeadSourceFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Client.list('-created_date', 200).then(data => {
      setClients(data);
      setLoading(false);
    });
  }, []);

  const hasFilters = search || typeFilter !== "all" || statusFilter !== "all" || leadSourceFilter !== "all";

  const filtered = clients.filter(c => {
    const name = `${c.first_name} ${c.last_name} ${c.company || ''} ${c.email || ''} ${c.phone || ''}`.toLowerCase();
    const matchesSearch = !search || name.includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || c.client_type === typeFilter;
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSource = leadSourceFilter === "all" || c.lead_source === leadSourceFilter;
    return matchesSearch && matchesType && matchesStatus && matchesSource;
  });

  const clearFilters = () => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); setLeadSourceFilter("all"); };

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
        title="Clients" 
        subtitle={`${filtered.length} of ${clients.length} contacts`}
        actionLabel="Add Client"
        onAction={() => navigate('/clients/new')}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48 lg:w-72" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Buyer">Buyers</SelectItem>
            <SelectItem value="Owner">Owners</SelectItem>
            <SelectItem value="Both Buyer and Owner">Both Buyer and Owner</SelectItem>
            <SelectItem value="Prior Owner">Prior Owner</SelectItem>
            <SelectItem value="Appraiser Client">Appraiser Client</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Prospect">Prospect</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={leadSourceFilter} onValueChange={setLeadSourceFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Lead Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Referral">Referral</SelectItem>
            <SelectItem value="Website">Website</SelectItem>
            <SelectItem value="Trade-A-Plane">Trade-A-Plane</SelectItem>
            <SelectItem value="Controller">Controller</SelectItem>
            <SelectItem value="AirMart">AirMart</SelectItem>
            <SelectItem value="Social Media">Social Media</SelectItem>
            <SelectItem value="Tradeshow">Tradeshow</SelectItem>
            <SelectItem value="Partner">Partner</SelectItem>
            <SelectItem value="Advertisement">Advertisement</SelectItem>
            <SelectItem value="Cold Call">Cold Call</SelectItem> 
            <SelectItem value="Gardner Aircraft Sales">Gardner Aircraft Sales</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </PageHeader>

      {filtered.length === 0 && !search ? (
        <EmptyState 
          icon={Users} 
          title="No Clients Yet" 
          description="Build your client database by adding buyers, owners, and appraisal clients."
          actionLabel="Add Client"
          onAction={() => navigate('/clients/new')}
        />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Contact</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Last Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/clients/${c.id}`)}>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium">{c.first_name} {c.last_name}</p>
                        {c.company && <p className="text-xs text-muted-foreground">{c.company}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                        {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={c.client_type} /></td>
                    <td className="px-5 py-3.5 hidden md:table-cell"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">
                      {c.last_contacted ? moment(c.last_contacted).fromNow() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No clients match your search</p>
          )}
        </div>
      )}
    </div>
  );
}