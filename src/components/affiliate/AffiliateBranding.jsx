import { useState } from "react";
import { supabase } from "@/api/base44Client";
import { Upload, Save, Check, Palette, Building2 } from "lucide-react";

export default function AffiliateBranding({ affiliate, onUpdate }) {
  const [form, setForm] = useState({
    brand_name: affiliate.brand_name || '',
    brand_logo_url: affiliate.brand_logo_url || '',
    brand_color: affiliate.brand_color || '#00447f',
    brand_tagline: affiliate.brand_tagline || '',
    white_label_enabled: affiliate.white_label_enabled || false,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `affiliates/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('aircraft-images').upload(fileName, file, { upsert: true });
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('aircraft-images').getPublicUrl(fileName);
        update('brand_logo_url', publicUrl);
      } else {
        alert('Failed to upload logo. Please try again.');
      }
    } catch {
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from('affiliates').update(form).eq('id', affiliate.id);
      setSaved(true);
      onUpdate();
    } catch (err) {
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Settings Form */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-4 h-4 text-[#00447f]" />
          <h3 className="text-sm font-black text-[#00447f] uppercase tracking-wider">White-Label Settings</h3>
        </div>

        {/* Enable toggle */}
        <div className="flex items-center justify-between py-3 border-b border-gray-50 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-800">Enable White-Label Branding</p>
            <p className="text-xs text-gray-400 mt-0.5">Show your brand on co-branded referral landing pages</p>
          </div>
          <button
            onClick={() => update('white_label_enabled', !form.white_label_enabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.white_label_enabled ? 'bg-[#00447f]' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.white_label_enabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {/* Brand Name */}
        <div className="space-y-1.5 mb-4">
          <label className="text-xs font-bold text-gray-400">Brand Name</label>
          <input
            type="text"
            value={form.brand_name}
            onChange={e => update('brand_name', e.target.value)}
            placeholder="e.g. Your Aviation Company"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors"
          />
        </div>

        {/* Brand Tagline */}
        <div className="space-y-1.5 mb-4">
          <label className="text-xs font-bold text-gray-400">Brand Tagline</label>
          <input
            type="text"
            value={form.brand_tagline}
            onChange={e => update('brand_tagline', e.target.value)}
            placeholder="e.g. Your trusted aviation partner"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors"
          />
        </div>

        {/* Brand Color */}
        <div className="space-y-1.5 mb-4">
          <label className="text-xs font-bold text-gray-400">Brand Primary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.brand_color}
              onChange={e => update('brand_color', e.target.value)}
              className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={form.brand_color}
              onChange={e => update('brand_color', e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div className="space-y-1.5 mb-6">
          <label className="text-xs font-bold text-gray-400">Brand Logo</label>
          <div className="flex items-center gap-3">
            {form.brand_logo_url ? (
              <img src={form.brand_logo_url} alt="Brand logo" className="w-16 h-16 rounded-lg border border-gray-200 object-contain bg-gray-50 p-1" />
            ) : (
              <div className="w-16 h-16 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <Building2 className="w-6 h-6 text-gray-300" />
              </div>
            )}
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
                {uploading ? 'Uploading...' : <><Upload className="w-4 h-4" /> Upload Logo</>}
              </span>
            </label>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 rounded-lg font-bold text-sm text-white transition-all hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ backgroundColor: '#00447f' }}
        >
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Branding</>}
        </button>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-black text-[#00447f] uppercase tracking-wider mb-4">Live Preview</h3>
        <p className="text-xs text-gray-400 mb-4">This is how your co-branded referral page header will appear when a visitor arrives via your link.</p>

        {/* Co-branded header preview */}
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: form.brand_color }}>
            <div className="flex items-center gap-3">
              {form.brand_logo_url ? (
                <img src={form.brand_logo_url} alt="Brand" className="h-8 w-auto max-w-[120px] object-contain" />
              ) : (
                <span className="text-white font-black text-sm">
                  {form.brand_name || 'Your Brand'}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-white text-xs font-bold">In partnership with</p>
              <img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png" alt="ClearBlue Aero" className="h-5 w-auto brightness-0 invert" />
            </div>
          </div>
          <div className="px-5 py-3 bg-gray-50">
            <p className="text-xs text-gray-500">
              {form.brand_tagline || 'Your tagline will appear here'}
            </p>
          </div>
        </div>

        {!form.white_label_enabled && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700">
              White-label branding is currently disabled. Enable it above to show your brand on referral landing pages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}