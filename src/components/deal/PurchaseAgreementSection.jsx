import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Download, Eye, Trash2, ExternalLink } from "lucide-react";
import { buildPurchaseAgreementDocx, getAgreementFilename, blobToBase64 } from "@/utils/purchaseAgreementDoc";

export default function PurchaseAgreementSection({ dealId, deal, aircraft, documentUrls = [], onDocumentAdded, onDocumentRemoved }) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // 1. Build the .docx client-side from deal/aircraft data
      const blob = await buildPurchaseAgreementDocx(deal, aircraft);
      const base64data = await blobToBase64(blob);
      const filename = getAgreementFilename(deal, aircraft);

      // 2. Upload to OneDrive via backend function
      const res = await base44.functions.invoke('uploadDocxToOneDrive', { filename, base64data });
      const webUrl = res.data?.webUrl;
      if (!webUrl) throw new Error('No URL returned from upload');

      // 3. Store the OneDrive link in the deal
      const updatedUrls = [...documentUrls, webUrl];
      await base44.entities.Deal.update(dealId, { document_urls: updatedUrls });
      onDocumentAdded(webUrl);
    } catch (err) {
      alert('Failed to generate agreement: ' + (err?.response?.data?.error || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleRemove = async (url) => {
    if (!window.confirm('Remove this document from the deal?')) return;
    const updated = documentUrls.filter(u => u !== url);
    await base44.entities.Deal.update(dealId, { document_urls: updated });
    onDocumentRemoved(url);
  };

  const getFileName = (url) => {
    try {
      const u = new URL(url);
      return decodeURIComponent(u.pathname.split('/').pop() || url);
    } catch {
      const parts = url.split('/');
      return decodeURIComponent(parts[parts.length - 1]);
    }
  };

  return (
    <section className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider">Purchase Agreement</h2>
        <Button onClick={handleGenerate} disabled={generating} size="sm" className="gap-2">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {generating ? 'Generating...' : 'Generate Word Doc'}
        </Button>
      </div>

      {documentUrls.length === 0 && !generating && (
        <p className="text-sm text-muted-foreground">No documents generated yet. <strong>Save the deal first</strong>, then click "Generate Word Doc" to create a formatted purchase agreement and save it to your OneDrive.</p>
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
                <Button variant="ghost" size="icon" asChild className="h-7 w-7" title="Open in OneDrive">
                  <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a>
                </Button>
                <Button variant="ghost" size="icon" asChild className="h-7 w-7" title="Download">
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
    </section>
  );
}