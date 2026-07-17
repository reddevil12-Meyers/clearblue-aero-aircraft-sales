import { useState } from "react";
import { Users, DollarSign, TrendingUp, Wallet, Copy, Check, QrCode } from "lucide-react";

export default function AffiliateOverview({ affiliate, referrals }) {
  const [copied, setCopied] = useState(false);
  const referralLink = `${window.location.origin}/?ref=${affiliate.referral_code}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralLink)}`;

  const stats = [
    { icon: Users, label: "Total Referrals", value: affiliate.total_referrals || 0, color: "#00447f" },
    { icon: TrendingUp, label: "Active Referrals", value: affiliate.active_referrals || 0, color: "#C9A84C" },
    { icon: DollarSign, label: "Total Earned", value: `$${(affiliate.total_earnings || 0).toLocaleString()}`, color: "#10b981" },
    { icon: Wallet, label: "Total Paid", value: `$${(affiliate.total_paid || 0).toLocaleString()}`, color: "#6b7280" },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: color + '15' }}>
              <Icon className="w-4.5 h-4.5" style={{ color }} />
            </div>
            <p className="text-2xl font-black text-[#00447f]">{value}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Referral Link + QR */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-black text-[#00447f] uppercase tracking-wider mb-4">Your Referral Link</h3>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={referralLink}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 outline-none"
            />
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:brightness-110"
              style={{ backgroundColor: '#00447f' }}
            >
              {copied ? <><Check className="w-4 h-4 text-green-300" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">Share this link with aircraft owners. When they submit a listing or valuation, the referral is automatically tracked to your account.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-sm font-black text-[#00447f] uppercase tracking-wider mb-4">QR Code</h3>
          <img src={qrUrl} alt="Referral QR Code" className="w-32 h-32 rounded-lg border border-gray-100" />
          <a
            href={qrUrl}
            download={`affiliate-qr-${affiliate.referral_code}.png`}
            className="text-xs text-[#00447f] font-bold mt-3 hover:underline flex items-center gap-1"
          >
            <QrCode className="w-3 h-3" /> Download
          </a>
        </div>
      </div>

      {/* Recent Referrals */}
      {referrals.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-black text-[#00447f] uppercase tracking-wider mb-4">Recent Referrals</h3>
          <div className="space-y-2">
            {referrals.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{r.client_name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400">{r.aircraft_summary || r.client_email || ''}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-50 text-gray-600">{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}