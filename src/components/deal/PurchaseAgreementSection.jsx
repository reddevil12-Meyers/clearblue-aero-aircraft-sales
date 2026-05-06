import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Download, Eye, Trash2, Mail } from "lucide-react";

export default function PurchaseAgreementSection({ dealId, documentUrls = [], onDocumentAdded, onDocumentRemoved }) {
  const [generating, setGenerating] = useState(false);
  const [previewText, setPreviewText] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await base44.functions.invoke('generatePurchaseAgreement', { dealId });
    setGenerating(false);
    if (res.data?.file_url) {
      onDocumentAdded(res.data.file_url);
      setPreviewText(res.data.text);
      setShowPreview(true);
    }
  };

  const handleRemove = async (url) => {
    if (!window.confirm('Remove this document from the deal?')) return;
    const updated = documentUrls.filter(u => u !== url);
    await base44.entities.Deal.update(dealId, { document_urls: updated });
    onDocumentRemoved(url);
  };

  const getFileName = (url) => {
    const parts = url.split('/');
    return decodeURIComponent(parts[parts.length - 1]);
  };

  return (
    <section className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider">Purchase Agreement</h2>
        <Button onClick={handleGenerate} disabled={generating} size="sm" className="gap-2">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {generating ? 'Generating...' : 'Generate Agreement'}
        </Button>
      </div>

      {documentUrls.length === 0 && !generating && (
        <p className="text-sm text-muted-foreground">No documents generated yet. Click "Generate Agreement" to merge deal data into the purchase agreement template.</p>
      )}

      {documentUrls.length > 0 && (
        <div className="space-y-2">
          {documentUrls.map((url, i) => (
            <div key={i} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{getFileName(url)}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <Button variant="ghost" size="icon" asChild className="h-7 w-7">
                  <a href={url} target="_blank" rel="noopener noreferrer"><Eye className="w-3.5 h-3.5" /></a>
                </Button>
                <Button variant="ghost" size="icon" asChild className="h-7 w-7">
                  <a href={url} download><Download className="w-3.5 h-3.5" /></a>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemove(url)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPreview && previewText && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Document Preview</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowPreview(false)}>Hide</Button>
          </div>
          <pre className="bg-muted/30 rounded-lg p-4 text-xs whitespace-pre-wrap font-mono max-h-96 overflow-y-auto border border-border">
            {previewText}
          </pre>
        </div>
      )}
    </section>
  );
}