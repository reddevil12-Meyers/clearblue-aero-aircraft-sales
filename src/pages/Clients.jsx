import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Users, Search, Phone, Mail } from "lucide-react";
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
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Client.list('-created_date', 200).then(data => {
      setClients(data);
      setLoading(false);
    });
  }, []);

  const filtered = clients.filter(c => {
    const name = `${c.first_name} ${c.last_name} ${c.company || ''} ${c.email || ''}`.toLowerCase();
    const matchesSearch = !search || name.includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || c.client_type === typeFilter;
    return matchesSearch && matchesType;
  });

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
        subtitle={`${clients.length} contacts`}
        actionLabel="Add Client"
        onAction={() => navigate('/clients/new')}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48 lg:w-64" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Buyer">Buyers</SelectItem>
            <SelectItem value="Seller">Sellers</SelectItem>
            <SelectItem value="Both">Both</SelectItem>
            <SelectItem value="Appraiser Client">Appraiser Client</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {filtered.length === 0 && !search ? (
        <EmptyState 
          icon={Users} 
          title="No Clients Yet" 
          description="Build your client database by adding buyers, sellers, and appraisal clients."
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