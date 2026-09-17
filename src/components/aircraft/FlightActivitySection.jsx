import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, SearchCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function FlightActivitySection({
  aircraftId,
  tailNumber,
  icao24,
  icao24Source,
  adsbStatus,
  priorityAdsb,
  onFieldChange,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const refresh = async () => {
    setRefreshing(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("refreshAircraftAdsB", { aircraftId });
      setResult(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to refresh ADS-B data.");
    } finally {
      setRefreshing(false);
    }
  };

  const resolveIcao24 = async () => {
    setResolving(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("resolveAircraftIcao24", { aircraftId });
      const data = res.data || {};
      if (data.resolved && data.updates) {
        Object.entries(data.updates).forEach(([k, v]) => onFieldChange(k, v));
      } else if (data.adsb_status === "no_hex") {
        onFieldChange("adsb_status", "no_hex");
      }
      setResult(data);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to resolve ICAO24.");
    } finally {
      setResolving(false);
    }
  };

  // Staff manual entry — marked as manual so automation never overwrites it
  const handleIcao24Change = (value) => {
    const hex = value.trim().toLowerCase();
    onFieldChange("icao24", hex);
    if (hex) {
      onFieldChange("icao24_source", "manual");
      onFieldChange("icao24_verified_at", new Date().toISOString());
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-muted-foreground">Tail Number (ADS-B)</Label>
          <Input
            value={tailNumber || ""}
            onChange={(e) => onFieldChange("tail_number", e.target.value.toUpperCase().trim())}
            placeholder="N123AB"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-muted-foreground">
            ICAO 24-bit Address (hex)
            {icao24Source && <span className="ml-1.5 font-normal text-muted-foreground/70">({icao24Source})</span>}
          </Label>
          <Input
            value={icao24 || ""}
            onChange={(e) => handleIcao24Change(e.target.value)}
            placeholder="e.g. a1b2c3 — enter manually if lookup fails"
            maxLength={6}
          />
          {adsbStatus === "no_hex" && (
            <p className="text-xs text-amber-600">
              No lookup match found — enter the ICAO24 hex manually above.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <div>
          <p className="text-sm font-medium text-foreground">Priority ADS-B ingest</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Always process this aircraft in the nightly flight-history ingest, even past the 40-aircraft cap.
          </p>
        </div>
        <Switch
          checked={priorityAdsb || false}
          onCheckedChange={(v) => onFieldChange("priority_adsb", v)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={resolveIcao24}
          disabled={resolving || refreshing}
        >
          <SearchCheck className={`w-4 h-4 ${resolving ? "animate-pulse" : ""}`} />
          {resolving ? "Resolving..." : "Resolve ICAO24 from Lookup"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={refresh}
          disabled={refreshing || resolving || !aircraftId}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh ADS-B now"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
          {result.skipped && (
            <p className="text-muted-foreground">
              {result.reason === "manual_icao24"
                ? "Skipped — a manual ICAO24 is already set and will not be overwritten."
                : result.reason === "no_tail_number"
                ? "Skipped — no tail number set on this aircraft."
                : "Skipped."}
            </p>
          )}
          {result.resolved && result.updates && (
            <p>
              <span className="font-bold">Resolved:</span> {result.updates.icao24}{" "}
              (source: {result.updates.icao24_source})
            </p>
          )}
          {result.adsb_status && (
            <p>
              <span className="font-bold">ADS-B status:</span> {result.adsb_status}
            </p>
          )}
          {result.adsb_last_seen_at && (
            <p>
              <span className="font-bold">Last seen:</span>{" "}
              {new Date(result.adsb_last_seen_at).toLocaleString()}
            </p>
          )}
          {result.adsb_summary_text && (
            <p className="text-muted-foreground">{result.adsb_summary_text}</p>
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Tail-number resolution checks the ICAO lookup table first; if there is no match it will not
        guess. Manually entered hex values are never overwritten automatically.
      </p>
    </div>
  );
}