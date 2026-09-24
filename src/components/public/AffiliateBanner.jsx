import { useState, useEffect } from "react";
import { supabase } from "@/api/base44Client";

export default function AffiliateBanner() {
  const [affiliate, setAffiliate] = useState(null);

  useEffect(() => {
    const code = localStorage.getItem('affiliate_ref');
    if (!code) return;

    supabase.from('affiliates')
      .select('brand_name,brand_color,brand_logo_url,white_label')
      .eq('referral_code', code)
      .single()
      .then(({ data }) => {
        if (data?.white_label) {
          setAffiliate({ ...data, found: true });
        }
      })
      .catch(() => {});
  }, []);

  if (!affiliate) return null;

  return (
    <div
      className="px-6 py-2 flex items-center justify-center gap-3 text-sm flex-wrap"
      style={{ backgroundColor: affiliate.brand_color }}
    >
      {affiliate.brand_logo_url ? (
        <img src={affiliate.brand_logo_url} alt={affiliate.brand_name} className="h-5 w-auto max-w-[120px] object-contain" />
      ) : (
        <span className="text-white font-bold text-xs">{affiliate.brand_name}</span>
      )}
      <span className="text-white/50 text-xs">· in partnership with ·</span>
      <img
        src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png"
        alt="ClearBlue Aero"
        className="h-5 w-auto brightness-0 invert"
      />
    </div>
  );
}