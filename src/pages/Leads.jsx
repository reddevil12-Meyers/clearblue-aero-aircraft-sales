import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Search, UserPlus, ArrowUpDown, Mail, Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import LeadForm from "@/components/lead/LeadForm";
import StatusBadge from "@/components/StatusBadge";

const STATUSES = ["All", "New", "Contacted", "Qualified", "Converted", "Lost"];
const SOURCES = ["All", "Single-Engine Form", "Multi-Engine Form", "Contact Form", "Website", "Referral", "Manual", "Other"];

export default function Leads() {
  const { toast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Lead.list("-created_date", 200);
      setLeads(data);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      `${l.first_name} ${l.last_name}`.toLowerCase().includes(q) ||
      (l.email || "").toLowerCase().includes(q) ||
      (l.phone || "").toLowerCase().includes(q) ||
      (l.aircraft_interest || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    const matchesSource = sourceFilter === "All" || l.lead_source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleCreate = async (payload) => {
    try {
      await base44.entities.Lead.create(payload);
      toast({ title: "Lead created" });
      setCreateOpen(false);
      loadLeads();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleSyncZoho = async () => {
    setSyncing(true);
    try {
      const res = await base44.functions.invoke("syncToZoho", { mode: "leads" });
      const processed = res?.data?.leads?.processed ?? 0;
      toast({ title: "Leads synced to Zoho", description: `${processed} lead${processed === 1 ? "" : "s"} pushed.` });
      loadLeads();
    } catch (e) {
      toast({ variant: "destructive", title: "Sync failed", description: e.message });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} of {leads.length} leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSyncZoho} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync to Zoho"}
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New Lead</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Lead</DialogTitle>
              </DialogHeader>
              <LeadForm onSubmit={handleCreate} submitLabel="Create Lead" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, aircraft…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s === "All" ? "All Statuses" : s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SOURCES.map(s => <SelectItem key={s} value={s}>{s === "All" ? "All Sources" : s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No leads found</p>
          <p className="text-sm mt-1">Leads from website forms and manual entry will appear here.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Source</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Aircraft Interest</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/leads/${l.id}`} className="font-medium text-foreground hover:text-primary">
                        {l.first_name} {l.last_name}
                      </Link>
                      {l.company && <p className="text-xs text-muted-foreground">{l.company}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {l.email && <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{l.email}</p>}
                      {l.phone && <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{l.phone}</p>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{l.lead_source}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground max-w-xs truncate">{l.aircraft_interest || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}