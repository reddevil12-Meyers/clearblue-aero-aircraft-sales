import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, AlertCircle } from "lucide-react";
import AffiliateOverview from "@/components/affiliate/AffiliateOverview";
import AffiliateReferrals from "@/components/affiliate/AffiliateReferrals";
import AffiliateEarnings from "@/components/affiliate/AffiliateEarnings";
import AffiliateBranding from "@/components/affiliate/AffiliateBranding";

export default function AffiliateDashboard() {
  const [affiliate, setAffiliate] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const res = await base44.functions.invoke('getAffiliateDashboard', {});
      setAffiliate(res.data.affiliate);
      setReferrals(res.data.referrals || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load affiliate data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#f5f6f8]">
      <div className="w-8 h-8 border-4 border-[#00447f]/20 border-t-[#00447f] rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-md shadow-sm">
        <AlertCircle className="w-12 h-12 text-[#C9A84C] mx-auto mb-4" />
        <h2 className="text-xl font-black text-[#00447f] mb-2">No Affiliate Account</h2>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <Link to="/affiliate-program" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm text-white" style={{ backgroundColor: '#00447f' }}>
          Apply Now
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <header className="bg-[#00447f] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png" alt="ClearBlue Aero" className="h-9 w-auto" />
            <span className="text-white/30 text-sm">|</span>
            <span className="text-white text-sm font-bold">Affiliate Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm hidden sm:block">{affiliate.first_name} {affiliate.last_name}</span>
            <button
              onClick={() => base44.auth.logout()}
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {affiliate.status === 'Pending' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-amber-800 text-sm">
              Your application is pending review. You'll receive an email once your affiliate account is approved.
              You can still configure your branding settings below.
            </p>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#00447f]">Welcome, {affiliate.first_name}!</h1>
          <p className="text-gray-500 text-sm mt-1">Referral Code: <span className="font-bold text-[#00447f]">{affiliate.referral_code}</span></p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="bg-white border border-gray-100">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <AffiliateOverview affiliate={affiliate} referrals={referrals} />
          </TabsContent>
          <TabsContent value="referrals" className="mt-6">
            <AffiliateReferrals referrals={referrals} />
          </TabsContent>
          <TabsContent value="earnings" className="mt-6">
            <AffiliateEarnings affiliate={affiliate} referrals={referrals} />
          </TabsContent>
          <TabsContent value="branding" className="mt-6">
            <AffiliateBranding affiliate={affiliate} onUpdate={loadData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}