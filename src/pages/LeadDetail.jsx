import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Save, UserCheck, Mail, Phone, Building, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import LeadForm from "@/components/lead/LeadForm";

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Lead.get(id);
      setLead(data);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async (payload) => {
    try {
      await base44.entities.Lead.update(id, payload);
      toast({ title: "Lead updated" });
      setEditing(false);
      load();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleConvert = async () => {
    setConverting(true);
    try {
      // Dedupe: link to an existing client with the same email if one exists
      let existingClient = null;
      if (lead.email) {
        try {
          const matches = await base44.entities.Client.filter({ email: lead.email }, "-created_date", 5);
          if (matches && matches.length > 0) existingClient = matches[0];
        } catch (_) { /* ignore */ }
      }

      let clientId = existingClient ? existingClient.id : null;
      let description = existingClient ? "Linked to existing client record." : "A new client record was created.";

      if (!existingClient) {
        const clientData = {
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          client_type: lead.lead_type === "Seller" ? "Seller" : lead.lead_type === "Appraisal" ? "Appraiser Client" : "Buyer",
          lead_source: lead.lead_source === "Manual" ? "Other" : lead.lead_source,
          status: "Prospect",
          aircraft_interests: lead.aircraft_interest || undefined,
          budget_min: lead.budget_min,
          budget_max: lead.budget_max,
          notes: [lead.message, lead.notes].filter(Boolean).join("\n\n") || undefined,
        };
        Object.keys(clientData).forEach(k => clientData[k] === undefined && delete clientData[k]);
        const newClient = await base44.entities.Client.create(clientData);
        clientId = newClient.id;
      }

      // Mark lead as converted
      const today = new Date().toISOString().slice(0, 10);
      await base44.entities.Lead.update(id, {
        status: "Converted",
        converted_client_id: clientId,
        converted_date: today,
      });

      toast({ title: "Lead converted to contact", description });
      setConvertOpen(false);
      load();
    } catch (e) {
      toast({ variant: "destructive", title: "Conversion failed", description: e.message });
    } finally {
      setConverting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!lead) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground">Lead not found.</p>
      <Link to="/leads" className="text-primary text-sm mt-3 inline-block">← Back to Leads</Link>
    </div>
  );

  const isConverted = lead.status === "Converted" && lead.converted_client_id;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <Link to="/leads" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Leads
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground">{lead.first_name} {lead.last_name}</h1>
            <StatusBadge status={lead.status} />
          </div>
          <p className="text-sm text-muted-foreground">Lead from {lead.lead_source}</p>
        </div>
        <div className="flex gap-2">
          {!isConverted && (
            <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
              <DialogTrigger asChild>
                <Button variant="default"><UserCheck className="w-4 h-4 mr-2" /> Convert to Contact</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Convert Lead to Contact?</DialogTitle>
                  <DialogDescription>
                    This creates a new Client record that syncs to Zoho Contacts, and marks this lead as Converted. The lead stays for your records.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConvertOpen(false)}>Cancel</Button>
                  <Button onClick={handleConvert} disabled={converting}>
                    {converting ? "Converting…" : "Convert"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {!editing && !isConverted && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Save className="w-4 h-4 mr-2" /> Edit
            </Button>
          )}
        </div>
      </div>

      {isConverted && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 mb-6">
          <p className="text-sm text-green-800">
            ✓ Converted to contact on {lead.converted_date}.{" "}
            <Link to={`/clients/${lead.converted_client_id}`} className="font-semibold underline">View client record →</Link>
          </p>
        </div>
      )}

      {editing ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Edit Lead</h2>
          <LeadForm
            initialData={lead}
            onSubmit={handleSave}
            submitLabel="Save Changes"
          />
          <Button variant="ghost" className="w-full mt-2" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Contact Info</h2>
            {lead.email && <p className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-muted-foreground" />{lead.email}</p>}
            {lead.phone && <p className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted-foreground" />{lead.phone}</p>}
            {lead.company && <p className="flex items-center gap-2 text-sm"><Building className="w-4 h-4 text-muted-foreground" />{lead.company}</p>}
            {lead.assigned_to && <p className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-muted-foreground" />Assigned: {lead.assigned_to}</p>}
            {!lead.email && !lead.phone && !lead.company && <p className="text-sm text-muted-foreground italic">No contact info</p>}
          </div>
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Lead Details</h2>
            <div className="text-sm"><span className="text-muted-foreground">Type: </span>{lead.lead_type}</div>
            <div className="text-sm"><span className="text-muted-foreground">Source: </span>{lead.lead_source}</div>
            {lead.aircraft_interest && <div className="text-sm"><span className="text-muted-foreground">Aircraft: </span>{lead.aircraft_interest}</div>}
            {lead.budget_min != null && <div className="text-sm"><span className="text-muted-foreground">Budget: </span>${lead.budget_min.toLocaleString()}{lead.budget_max != null ? ` – $${lead.budget_max.toLocaleString()}` : ""}</div>}
          </div>
          {(lead.message || lead.notes) && (
            <div className="rounded-lg border border-border bg-card p-5 md:col-span-2 space-y-3">
              {lead.message && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-1">Message</h2>
                  <p className="text-sm whitespace-pre-wrap">{lead.message}</p>
                </div>
              )}
              {lead.notes && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-1">Notes</h2>
                  <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}