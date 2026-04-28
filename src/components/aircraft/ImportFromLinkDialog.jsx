import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Loader2, AlertCircle } from "lucide-react";

export default function ImportFromLinkDialog({ open, onClose }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("importAircraftFromLink", { url: url.trim() });
      const data = res.data;
      if (data.error) throw new Error(data.error);

      // Create the aircraft with extracted data
      const aircraft = await base44.entities.Aircraft.create(data.aircraft);
      onClose();
      navigate(`/aircraft/${aircraft.id}`);
    } catch (e) {
      setError(e.message || "Failed to import aircraft. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUrl("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Import Aircraft from Listing URL
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Paste a link from Trade-A-Plane, Controller, ASO, Barnstormers, or any aircraft listing site. We'll extract the details automatically.
          </p>

          <Input
            placeholder="https://www.trade-a-plane.com/search?..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleImport()}
            disabled={loading}
          />

          {error && (
            <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/5 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching and extracting aircraft details…
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button onClick={handleImport} disabled={loading || !url.trim()} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}