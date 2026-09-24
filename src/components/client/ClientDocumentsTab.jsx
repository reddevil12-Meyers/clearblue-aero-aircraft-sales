import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/api/base44Client';
import { Paperclip, Upload, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = ["Purchase Agreement", "Inspection Report", "Title/Escrow", "Insurance", "Logbooks", "FAA Docs", "Financial", "Correspondence", "Other"];

export default function ClientDocumentsTab({ clientId }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Other' });
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  const load = () => supabase.from('client_documents').select('*').eq('client_id', clientId)
    .then(({ data }) => setDocs(data || [])).finally(() => setLoading(false));

  useEffect(() => { load(); }, [clientId]);

  const handleUpload = async () => {
    if (!form.name) return;
    setUploading(true);
    let file_url = '';
    if (file) {
      const fileName = `clients/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('aircraft-images').upload(fileName, file, { upsert: true });
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('aircraft-images').getPublicUrl(fileName);
        file_url = publicUrl;
      }
    }
    await supabase.from('client_documents').insert([{ ...form, client_id: clientId, file_url }]);
    setShowForm(false);
    setForm({ name: '', category: 'Other' });
    setFile(null);
    load();
    setUploading(false);
  };

  const handleDelete = async (docId) => {
    if (window.confirm('Delete this document?')) {
      await supabase.from('client_documents').delete().eq('id', docId);
      load();
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{docs.length} documents</p>
        <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowForm(!showForm)}>
          <Upload className="w-4 h-4" />Add Document
        </Button>
      </div>

      {showForm && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Document Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Purchase Agreement 2024" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">File (optional)</Label>
            <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current.click()} className="gap-2">
              <Paperclip className="w-4 h-4" />{file ? file.name : 'Choose file...'}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleUpload} disabled={uploading || !form.name}>{uploading ? 'Uploading...' : 'Save'}</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {docs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Paperclip className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.category} · {new Date(doc.created_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {doc.file_url && (
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost"><Download className="w-4 h-4" /></Button>
                  </a>
                )}
                <Button size="icon" variant="ghost" onClick={() => handleDelete(doc.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}