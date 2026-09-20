import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, FileSignature } from "lucide-react";

const STATUS_STYLES = {
  Draft: "bg-slate-100 text-slate-600",
  Sent: "bg-blue-100 text-blue-700",
  Viewed: "bg-amber-100 text-amber-700",
  Signed: "bg-green-100 text-green-700",
  Declined: "bg-red-100 text-red-700",
};

// Staff panel showing listing agreements and their signing status for a client or deal.
export default function ListingAgreementsPanel({ clientId, dealId }) {
  const [items, setItems] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const query = clientId ? { client_id: clientId } : { deal_id: dealId };
    base44.entities.ListingAgreement.filter(query, "-created_date", 20)
      .then(setItems)
      .catch(() => setItems([]));
  }, [clientId, dealId]);

  if (items === null || items.length === 0) return null;

  const copyLink = (item) => {
    navigator.clipboard.writeText(`${window.location.origin}/agreement/${item.token}`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fmt = (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  return (
    <section className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider flex items-center gap-2">
        <FileSignature className="w-4 h-4" /> Listing Agreements
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{item.aircraft_summary || "Aircraft"}</p>
              <p className="text-xs text-muted-foreground">
                Sent {fmt(item.sent_at)}
                {(item.status === "Viewed" || item.status === "Signed") && item.viewed_at ? ` · Viewed ${fmt(item.viewed_at)}` : ""}
                {item.status === "Signed" && item.signed_at ? ` · Signed ${fmt(item.signed_at)}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[item.status] || STATUS_STYLES.Draft}`}>
                {item.status}
              </span>
              {item.pdf_url ? (
                <a href={item.pdf_url} target="_blank" rel="noreferrer">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                    <ExternalLink className="w-3.5 h-3.5" /> PDF
                  </Button>
                </a>
              ) : (
                <Button variant="ghost" size="sm" className="gap-1 text-xs h-7" onClick={() => copyLink(item)}>
                  {copiedId === item.id ? (
                    <><Check className="w-3.5 h-3.5 text-green-500" /> Copied</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy Link</>
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}