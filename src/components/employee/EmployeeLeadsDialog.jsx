import { useState, useEffect } from "react";
import { supabase } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function EmployeeLeadsDialog({ employee, open, onOpenChange }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!employee) return;
    setLoading(true);
    supabase.from('employee_leads').select('*').eq('employee_id', employee.id).order('created_date', { ascending: false }).limit(200)
      .then(({ data }) => setLeads(data || []))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, [employee]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tracked Leads: {employee?.first_name} {employee?.last_name}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            No tracked leads yet. Leads appear here when a customer scans this employee's QR code and submits their information.
          </p>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {leads.map((l) => (
              <div key={l.id} className="border border-border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{l.client_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{l.client_email || ""} {l.client_phone ? `· ${l.client_phone}` : ""}</p>
                  {l.aircraft_summary && <p className="text-xs text-muted-foreground mt-0.5">{l.aircraft_summary}</p>}
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs font-bold text-muted-foreground">{l.source_form || "Lead"}</p>
                  <p className="text-xs text-muted-foreground">{l.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}