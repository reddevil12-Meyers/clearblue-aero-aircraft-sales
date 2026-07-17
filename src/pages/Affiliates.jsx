import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Check, X, Eye, UserPlus, ChevronRight } from "lucide-react";

const STATUS_STYLES = {
  'Pending': 'bg-amber-50 text-amber-700',
  'Active': 'bg-green-50 text-green-700',
  'Inactive': 'bg-gray-100 text-gray-500',
  'Suspended': 'bg-red-50 text-red-600',
};

export default function Affiliates() {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Affiliate.list('-created_date');
    setAffiliates(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (affiliate) => {
    try {
      await base44.users.inviteUser(affiliate.email, 'affiliate');
      await base44.entities.Affiliate.update(affiliate.id, { status: 'Active' });
      load();
    } catch (err) {
      alert('Failed to approve: ' + (err.response?.data?.detail || err.message));
    }
  };

  const viewReferrals = async (affiliate) => {
    setSelectedAffiliate(affiliate);
    const refs = await base44.entities.Referral.filter({ affiliate_id: affiliate.id }, '-created_date', 100);
    setReferrals(refs);
    setDialogOpen(true);
  };

  const filtered = affiliates.filter(a => {
    const q = search.toLowerCase();
    return !q || `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.referral_code?.toLowerCase().includes(q);
  });

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold">Affiliate Program</h1>
            <p className="text-sm text-muted-foreground">{affiliates.length} affiliates registered</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by name, email, or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Affiliate</th>
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Referral Code</th>
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Commission</th>
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Referrals</th>
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{a.first_name} {a.last_name}</p>
                  <p className="text-xs text-muted-foreground">{a.email}</p>
                  {a.company && <p className="text-xs text-muted-foreground">{a.company}</p>}
                </td>
                <td className="px-4 py-3">
                  <code className="text-sm font-bold text-accent bg-accent/5 px-2 py-1 rounded">{a.referral_code}</code>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">${(a.commission_rate || 250).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{a.total_referrals || 0}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[a.status] || 'bg-gray-100 text-gray-500'}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {a.status === 'Pending' && (
                      <Button size="sm" variant="default" className="gap-1.5 h-8" onClick={() => handleApprove(a)}>
                        <UserPlus className="w-3.5 h-3.5" /> Approve
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="gap-1.5 h-8" onClick={() => viewReferrals(a)}>
                      <Eye className="w-3.5 h-3.5" /> Referrals
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Referrals Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Referrals — {selectedAffiliate?.first_name} {selectedAffiliate?.last_name}
            </DialogTitle>
          </DialogHeader>
          {referrals.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No referrals yet.</p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {referrals.map(r => (
                <div key={r.id} className="border border-border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{r.client_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{r.client_email || ''} {r.aircraft_summary ? `· ${r.aircraft_summary}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-muted-foreground">{r.status}</p>
                    <p className="text-xs text-muted-foreground">{r.commission_status} {r.commission_amount ? `· $${r.commission_amount.toLocaleString()}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}