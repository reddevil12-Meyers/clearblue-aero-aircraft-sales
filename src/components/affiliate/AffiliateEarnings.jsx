import { DollarSign, Wallet, TrendingUp, Clock } from "lucide-react";

export default function AffiliateEarnings({ affiliate, referrals }) {
  const pending = (referrals || []).filter(r => r.commission_status === 'Pending' || r.commission_status === 'Approved');
  const paid = (referrals || []).filter(r => r.commission_status === 'Paid');
  const pendingTotal = pending.reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  const paidTotal = paid.reduce((sum, r) => sum + (r.commission_amount || 0), 0);

  const cards = [
    { icon: DollarSign, label: "Total Earned", value: `$${(affiliate.total_earnings || 0).toLocaleString()}`, sub: "Lifetime earnings", color: "#10b981" },
    { icon: Wallet, label: "Total Paid Out", value: `$${(affiliate.total_paid || 0).toLocaleString()}`, sub: "Payments received", color: "#6b7280" },
    { icon: Clock, label: "Pending", value: `$${pendingTotal.toLocaleString()}`, sub: `${pending.length} referrals`, color: "#f59e0b" },
    { icon: TrendingUp, label: "Commission Rate", value: `$${(affiliate.commission_rate || 250).toLocaleString()}`, sub: "Per closed deal", color: "#00447f" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: color + '15' }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="text-2xl font-black text-[#00447f]">{value}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
            <p className="text-xs text-gray-300 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Commission History */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-black text-[#00447f] uppercase tracking-wider mb-4">Commission History</h3>
        {referrals && referrals.filter(r => r.commission_amount).length > 0 ? (
          <div className="space-y-2">
            {referrals.filter(r => r.commission_amount).map(r => (
              <div key={r.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{r.client_name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400">{r.aircraft_summary || ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#00447f]">${r.commission_amount.toLocaleString()}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    r.commission_status === 'Paid' ? 'bg-green-50 text-green-700' :
                    r.commission_status === 'Approved' ? 'bg-blue-50 text-blue-600' :
                    r.commission_status === 'Voided' ? 'bg-red-50 text-red-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {r.commission_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm py-8 text-center">No commissions earned yet. Keep sharing your referral link!</p>
        )}
      </div>
    </div>
  );
}