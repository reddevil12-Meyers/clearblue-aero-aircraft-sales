import { Users } from "lucide-react";

const STATUS_STYLES = {
  'Lead': 'bg-blue-50 text-blue-600',
  'Contacted': 'bg-purple-50 text-purple-600',
  'Broker Agreement Signed': 'bg-amber-50 text-amber-700',
  'Aircraft Listed': 'bg-indigo-50 text-indigo-600',
  'Closed': 'bg-green-50 text-green-700',
  'Lost': 'bg-gray-100 text-gray-500',
};

export default function AffiliateReferrals({ referrals }) {
  if (!referrals || referrals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
        <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <p className="text-gray-400 text-sm">No referrals yet. Share your referral link to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Client</th>
            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Aircraft</th>
            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Source</th>
            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Status</th>
            <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Commission</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map(r => (
            <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
              <td className="px-5 py-3">
                <p className="text-sm font-medium text-gray-800">{r.client_name || 'Unknown'}</p>
                {r.client_email && <p className="text-xs text-gray-400">{r.client_email}</p>}
              </td>
              <td className="px-5 py-3 text-sm text-gray-500">{r.aircraft_summary || '—'}</td>
              <td className="px-5 py-3 text-xs text-gray-400">{r.source || '—'}</td>
              <td className="px-5 py-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-500'}`}>
                  {r.status}
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                {r.commission_amount ? (
                  <>
                    <p className="text-sm font-bold text-[#00447f]">${r.commission_amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{r.commission_status}</p>
                  </>
                ) : (
                  <span className="text-xs text-gray-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}