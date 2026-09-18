import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MAKES } from "@/lib/aircraftOptions";

const PREVIEW_FIELDS = [
  ["Make", "make"],
  ["Model", "model"],
  ["Year", "year"],
  ["Registration", "registration"],
  ["Serial Number", "serial_number"],
  ["Total Time", "total_time", v => v ? `${v} hrs` : null],
  ["Engine Time", "engine_time_smoh", (v, obj) => v ? `${v} hrs ${obj.engine_time_type || "SMOH"}` : null],
  ["Engine", "engine_model", (v, obj) => [obj.engine_manufacturer, v].filter(Boolean).join(" ") || null],
  ["Num Engines", "num_engines"],
  ["Avionics Suite", "avionics_suite"],
  ["Avionics Details", "avionics_details"],
  ["Asking Price", "asking_price", v => v ? `$${Number(v).toLocaleString()}` : null],
  ["Location", "location"],
  ["Interior Condition", "interior_condition"],
  ["Exterior Condition", "exterior_condition"],
  ["ADS-B", "adsb_compliant", v => v === true ? "Compliant" : v === false ? "Not listed" : null],
  ["Damage History", "damage_history"],
];

// Entity-required fields. If the listing didn't contain one of these, the user
// completes it in the dialog instead of the import failing with an error.
const REQUIRED_FIELDS = [
  { key: "make", label: "Make", type: "select" },
  { key: "model", label: "Model" },
  { key: "year", label: "Year", type: "number" },
  { key: "registration", label: "Registration (N-Number)" },
];

export default function ImportFromLinkDialog({ open, onClose }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null); // extracted aircraft data before saving
  const navigate = useNavigate();

  const handleFetch = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setPreview(null);
    try {
      const res = await base44.functions.invoke("importAircraftFromLink", { url: url.trim() });
      const data = res.data;
      if (data.error) throw new Error(data.error);
      setPreview(data.aircraft);
    } catch (e) {
      setError(e.message || "Failed to import aircraft. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key, value) => setPreview(p => ({ ...p, [key]: value }));

  const missingRequired = preview
    ? REQUIRED_FIELDS.filter(f => preview[f.key] == null || preview[f.key] === "")
    : [];

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const aircraft = await base44.entities.Aircraft.create(preview);
      handleClose();
      navigate(`/aircraft/${aircraft.id}`);
    } catch (e) {
      setError(e.message || "Failed to save aircraft.");
      setSaving(false);
    }
  };

  const handleClose = () => {
    setUrl("");
    setError("");
    setPreview(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Import Aircraft from Listing URL
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {!preview ? (
            <>
              <p className="text-sm text-muted-foreground">
                Paste a link from Gardner Aircraft, Trade-A-Plane, Controller, ASO, Barnstormers, or any aircraft listing site. We'll extract the details automatically.
              </p>

              <Input
                placeholder="https://www.gardneraircraft.com/planeviewspec.php?id=785"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleFetch()}
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
                <Button onClick={handleFetch} disabled={loading || !url.trim()} className="gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  Fetch Details
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Aircraft details extracted. Please review before importing.
              </div>

              {missingRequired.length > 0 && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-3">
                  <p className="text-sm font-medium text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    Some required fields weren't found in this listing — fill them in below to complete the import.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {missingRequired.map(f => (
                      <div key={f.key} className="space-y-1.5">
                        <Label className="text-xs font-bold text-amber-900">{f.label}</Label>
                        {f.type === "select" ? (
                          <Select value={preview.make || ""} onValueChange={v => updateField("make", v)}>
                            <SelectTrigger><SelectValue placeholder="Select make..." /></SelectTrigger>
                            <SelectContent>
                              {MAKES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={f.type || "text"}
                            value={preview[f.key] ?? ""}
                            onChange={e => updateField(f.key, f.type === "number" ? (e.target.value ? Number(e.target.value) : "") : e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg border border-border divide-y divide-border text-sm">
                {PREVIEW_FIELDS.map(([label, key, fmt]) => {
                  const raw = preview[key];
                  const display = fmt ? fmt(raw, preview) : (raw != null && raw !== "" ? String(raw) : null);
                  if (!display) return null;
                  return (
                    <div key={key} className="flex gap-3 px-3 py-2">
                      <span className="text-muted-foreground w-36 shrink-0">{label}</span>
                      <span className="font-medium text-foreground">{display}</span>
                    </div>
                  );
                })}
                {preview.notes && (
                  <div className="px-3 py-2">
                    <span className="text-muted-foreground block mb-1">Notes</span>
                    <span className="font-medium text-foreground text-xs leading-relaxed">{preview.notes}</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/5 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-between gap-2 pt-2">
                <Button variant="ghost" onClick={() => { setPreview(null); setError(""); }} disabled={saving}>
                  ← Try a different URL
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleClose} disabled={saving}>Cancel</Button>
                  <Button onClick={handleConfirm} disabled={saving || missingRequired.length > 0} className="gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {saving ? "Importing..." : "Confirm & Import"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}