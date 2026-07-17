import { format } from "date-fns";
import { Mail, Phone, Building, Globe, Link2, DollarSign, Users, Calendar, Tag, Palette, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUS_STYLES = {
  'Pending': 'bg-amber-50 text-amber-700',
  'Active': 'bg-green-50 text-green-700',
  'Inactive': 'bg-gray-100 text-gray-500',
  'Suspended': 'bg-red-50 text-red-600',
};

export default function AffiliateDetailDialog({ affiliate, open, onOpenChange }) {
  if (!affiliate) return null;

  const detailRows = [
    { icon: Mail, label: "Email", value: affiliate.email },
    { icon: Phone, label: "Phone", value: affiliate.phone },
    { icon: Building, label: "Company", value: affiliate.company },
    { icon: Globe, label: "Website", value: affiliate.website_url },
    { icon: Tag, label: "Referral Code", value: affiliate.referral_code },
    { icon: Link2, label: "Referral Link", value: `https://clearblueaero.com/?ref=${affiliate.referral_code}` },
    { icon: DollarSign, label: "Commission Rate", value: `$${(affiliate.commission_rate || 250).toLocaleString()} per closed deal` },
    { icon: Users, label: "Total Referrals", value: affiliate.total_referrals || 0 },
    { icon: Users, label: "Active Referrals", value: affiliate.active_referrals || 0 },
    { icon: DollarSign, label: "Total Earnings", value: `$${(affiliate.total_earnings || 0).toLocaleString()}` },
    { icon: DollarSign, label: "Total Paid", value: `$${(affiliate.total_paid || 0).toLocaleString()}` },
    { icon: Calendar, label: "Registered", value: affiliate.created_date ? format(new Date(affiliate.created_date), "MMM d, yyyy") : null },
  ].filter(r => r.value);

  const brandingRows = affiliate.white_label_enabled ? [
    { icon: Building, label: "Brand Name", value: affiliate.brand_name },
    { icon: Palette, label: "Brand Color", value: affiliate.brand_color },
    { icon: ImageIcon, label: "Brand Logo", value: affiliate.brand_logo_url, isImage: true },
    { icon: Tag, label: "Brand Tagline", value: affiliate.brand_tagline },
  ].filter(r => r.value) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{affiliate.first_name} {affiliate.last_name}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[affiliate.status] || 'bg-gray-100 text-gray-500'}`}>
              {affiliate.status}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact & Account Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Participant Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detailRows.map((row, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/30">
                  <row.icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{row.label}</p>
                    {row.isImage ? (
                      <img src={row.value} alt="Brand Logo" className="mt-1 max-h-12 rounded" />
                    ) : row.label === "Referral Link" ? (
                      <a href={row.value} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline break-all">
                        {row.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-foreground break-all">{row.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* White-Label Branding */}
          {brandingRows.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">White-Label Branding</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {brandingRows.map((row, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/30">
                    <row.icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{row.label}</p>
                      {row.isImage ? (
                        <img src={row.value} alt="Brand Logo" className="mt-1 max-h-12 rounded" />
                      ) : row.label === "Brand Color" ? (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="w-4 h-4 rounded border border-border" style={{ backgroundColor: row.value }} />
                          <p className="text-sm font-medium text-foreground">{row.value}</p>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-foreground break-all">{row.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {affiliate.notes && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Admin Notes</h3>
              <p className="text-sm text-foreground whitespace-pre-wrap p-3 rounded-lg bg-muted/30">{affiliate.notes}</p>
            </div>
          )}

          {/* Linked User */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Linked Account</h3>
            <p className="text-sm text-foreground">
              {affiliate.user_id ? (
                <span className="text-green-600 font-medium">✓ Linked to user account</span>
              ) : (
                <span className="text-amber-600">Not yet linked — will auto-link when affiliate logs into their dashboard</span>
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}