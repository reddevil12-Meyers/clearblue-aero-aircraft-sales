import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Trash2, Upload } from "lucide-react";

export default function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState({ title: '', body: '', image_url: '', active: true, sort_order: '' });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  useEffect(() => {
    if (!isNew) {
      supabase.from('announcements').select('*').eq('id', id).single().then(({ data }) => {
        if (data) setForm({ ...data });
        setLoading(false);
      });
    }
  }, [id, isNew]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `announcements/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('aircraft-images').upload(fileName, file, { upsert: true });
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('aircraft-images').getPublicUrl(fileName);
        update('image_url', publicUrl);
      }
    } catch { /* ignore */ }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    if (data.sort_order !== '' && data.sort_order != null) data.sort_order = Number(data.sort_order);
    else delete data.sort_order;
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;

    if (isNew) {
      await supabase.from('announcements').insert([data]);
    } else {
      await supabase.from('announcements').update(data).eq('id', id);
    }
    setSaving(false);
    navigate('/announcements');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this announcement?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    navigate('/announcements');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/announcements')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-display font-semibold">
            {isNew ? 'New Announcement' : 'Edit Announcement'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Title</Label>
            <Input value={form.title || ''} onChange={e => update('title', e.target.value)} placeholder="Announcement title..." />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Body / Content</Label>
            <Textarea value={form.body || ''} onChange={e => update('body', e.target.value)} rows={6} placeholder="Write the announcement content..." />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Image</Label>
            {form.image_url && (
              <div className="mb-2 w-full h-48 rounded-lg overflow-hidden bg-muted">
                <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors">
                {uploading ? 'Uploading...' : <><Upload className="w-4 h-4" /> Upload Image</>}
              </span>
            </label>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Sort Order</Label>
            <Input type="number" value={form.sort_order ?? ''} onChange={e => update('sort_order', e.target.value)} placeholder="Lower shows first (optional)" />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-sm font-medium text-foreground">Active</p>
              <p className="text-xs text-muted-foreground mt-0.5">When enabled, this announcement appears on the public site.</p>
            </div>
            <Switch checked={form.active ?? true} onCheckedChange={v => update('active', v)} />
          </div>
        </div>
      </div>
    </div>
  );
}
