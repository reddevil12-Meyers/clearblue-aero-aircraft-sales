import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileSpreadsheet } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ImportIcaoLookupDialog({ open, onClose }) {
  const [csvText, setCsvText] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const importCsv = async (payload) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("importIcaoLookupCsv", payload);
      setResult(res.data);
      setCsvText("");
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Import failed.");
    } finally {
      setBusy(false);
    }
  };

  const handlePasteImport = () => {
    if (!csvText.trim()) return;
    importCsv({ csvText });
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      await importCsv({ fileUrl: file_url });
    } catch (e) {
      setError(e?.message || "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setCsvText(""); setResult(null); setError(null); onClose(); } }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" /> Import OpenSky Aircraft Metadata CSV
          </DialogTitle>
          <DialogDescription>
            Paste a CSV subset or upload a file. Rows are matched on registration and the icao24
            lookup is upserted. Columns: registration, icao24, typecode, model, operator (a header
            row is detected automatically).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Textarea
            rows={6}
            placeholder={"registration,icao24,typecode,model,operator\nN123AB,a1b2c3,C172,Cessna 172,Private"}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="font-mono text-xs"
          />
          <label className="cursor-pointer">
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors">
              <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload CSV file instead"}
            </span>
          </label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {result && result.ok && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
            <p>
              <span className="font-bold">Created:</span> {result.created} ·{" "}
              <span className="font-bold">Updated:</span> {result.updated} ·{" "}
              <span className="font-bold">Skipped:</span> {result.skipped.length}
            </p>
            {result.skipped.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Skipped rows: {result.skipped.map((s) => `${s.registration || "?"} (${s.reason})`).join(", ")}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button onClick={handlePasteImport} disabled={busy || uploading || !csvText.trim()}>
            {busy ? "Importing..." : "Import Pasted CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}