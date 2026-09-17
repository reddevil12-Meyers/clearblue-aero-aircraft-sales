import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, SearchCheck, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NAVY = "#00447f";
const GOLD = "#C9A84C";
const COVERAGE_DAYS = 30;

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  quiet: "bg-slate-100 text-slate-600 border-slate-200",
  no_hex: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-600 border-red-200",
  unknown: "bg-slate-100 text-slate-500 border-slate-200",
};
const STATUS_LABELS = {
  active: "Active",
  quiet: "Quiet",
  no_hex: "No Hex",
  error: "Error",
  unknown: "Unknown",
};

function formatDuration(min) {
  if (min == null) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export default function FlightActivitySection({
  aircraftId,
  tailNumber,
  icao24,
  icao24Source,
  icao24VerifiedAt,
  adsbStatus,
  adsbLastSeenAt,
  adsbPublicVisible,
  adsbSummaryText,
  priorityAdsb,
  onFieldChange,
}) {
  const [events, setEvents] = useState(null); // null = loading
  const [resolving, setResolving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadEvents = async () => {
    if (!aircraftId) {
      setEvents([]);
      return;
    }
    try {
      const all = await base44.entities.AircraftFlightEvent.filter({ aircraft_id: aircraftId });
      const cutoff = Date.now() - COVERAGE_DAYS * 24 * 60 * 60 * 1000;
      setEvents(
        all
          .filter((e) => new Date(e.first_seen).getTime() >= cutoff)
          .sort((a, b) => new Date(b.first_seen) - new Date(a.first_seen))
      );
    } catch (_) {
      setEvents([]);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [aircraftId]);

  // Staff manual hex entry — marked manual so automation never overwrites it
  const handleIcao24Change = (value) => {
    const hex = value.trim().toLowerCase();
    onFieldChange("icao24", hex);
    if (hex) {
      onFieldChange("icao24_source", "manual");
      onFieldChange("icao24_verified_at", new Date().toISOString());
    }
  };

  const resolveIcao24 = async () => {
    setResolving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await base44.functions.invoke("resolveAircraftIcao24", { aircraftId });
      const data = res.data || {};
      if (data.resolved && data.updates) {
        Object.entries(data.updates).forEach(([k, v]) => onFieldChange(k, v));
        setMessage(`Resolved ${data.updates.icao24} (source: ${data.updates.icao24_source}).`);
      } else if (data.adsb_status === "no_hex") {
        onFieldChange("adsb_status", "no_hex");
        setMessage("No lookup match — enter the ICAO24 hex manually.");
      } else {
        setMessage("Skipped — a manual hex is already set or no tail number is present.");
      }
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to resolve ICAO24.");
    } finally {
      setResolving(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    setError(null);
    setMessage(null);
    try {
      const res = await base44.functions.invoke("refreshAircraftAdsB", { aircraftId });
      const data = res.data || {};
      ["adsb_status", "adsb_last_seen_at", "adsb_last_lat", "adsb_last_lon", "adsb_summary_text"].forEach(
        (k) => {
          if (data[k] !== undefined) onFieldChange(k, data[k]);
        }
      );
      setMessage("ADS-B refreshed from OpenSky.");
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to refresh ADS-B data.");
    } finally {
      setRefreshing(false);
    }
  };

  const generateSummary = async () => {
    setSummarizing(true);
    setError(null);
    setMessage(null);
    try {
      const res = await base44.functions.invoke("generateAdsBSummary", { aircraftId });
      const data = res.data || {};
      Object.entries(data.updates || {}).forEach(([k, v]) => onFieldChange(k, v));
      setMessage("Summary regenerated from stored flight history.");
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to generate summary.");
    } finally {
      setSummarizing(false);
    }
  };

  const busy = resolving || refreshing || summarizing;
  const status = STATUS_LABELS[adsbStatus] ? adsbStatus : "unknown";

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      {/* Navy/gold header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: NAVY }}>
        <div className="flex items-center gap-2">
          <span className="inline-block w-1 h-4 rounded-full" style={{ backgroundColor: GOLD }} />
          <p className="text-xs font-bold uppercase tracking-widest text-white">ADS-B / Activity</p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-white ${STATUS_STYLES[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      <div className="p-4 space-y-5">
        {/* Identification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Tail Number</Label>
            <Input
              value={tailNumber || ""}
              onChange={(e) => onFieldChange("tail_number", e.target.value.toUpperCase().trim())}
              placeholder="N123AB"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">ICAO24 (hex)</Label>
            <Input
              value={icao24 || ""}
              onChange={(e) => handleIcao24Change(e.target.value)}
              placeholder="a1b2c3"
              maxLength={6}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Source</Label>
            <p className="text-sm text-foreground pt-1.5">{icao24Source || "—"}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Last Verified</Label>
            <p className="text-sm text-foreground pt-1.5">
              {icao24VerifiedAt
                ? new Date(icao24VerifiedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Show ADS-B on public listing</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Display flight activity on the public aircraft page.
              </p>
            </div>
            <Switch
              checked={adsbPublicVisible || false}
              onCheckedChange={(v) => onFieldChange("adsb_public_visible", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Priority ADS-B ingest</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Always process nightly, even past the 40-aircraft cap.
              </p>
            </div>
            <Switch
              checked={priorityAdsb || false}
              onCheckedChange={(v) => onFieldChange("priority_adsb", v)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="gap-2" onClick={resolveIcao24} disabled={busy}>
            <SearchCheck className={`w-4 h-4 ${resolving ? "animate-pulse" : ""}`} />
            {resolving ? "Resolving..." : "Resolve Hex"}
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={refresh} disabled={busy}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh ADS-B Now"}
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={generateSummary} disabled={busy}>
            <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
            {summarizing ? "Generating..." : "Generate Summary"}
          </Button>
        </div>

        {/* Editable summary */}
        <div>
          <Label className="text-xs font-bold text-muted-foreground">ADS-B Summary (editable)</Label>
          <Textarea
            className="mt-1.5"
            rows={2}
            value={adsbSummaryText || ""}
            onChange={(e) => onFieldChange("adsb_summary_text", e.target.value)}
            placeholder="e.g. 12 flights in the last 30 days. Most frequent airports: KEVB, KORL. Last seen 2 days ago."
          />
        </div>

        {/* Flight history table */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: NAVY }}>
              Flight History — Last 30 Days
            </p>
            <p className="text-xs text-muted-foreground">
              Last seen:{" "}
              {adsbLastSeenAt
                ? new Date(adsbLastSeenAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "—"}
            </p>
          </div>
          {events === null ? (
            <div className="py-6 text-center text-sm text-muted-foreground border border-dashed border-border rounded-md">
              Loading flight history…
            </div>
          ) : events.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground border border-dashed border-border rounded-md">
              No flight activity recorded in the last 30 days.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: NAVY }} className="text-left">
                    {["Date", "Callsign", "Dep", "Arr", "Duration"].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: GOLD }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e.id} className="border-t border-border">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(e.first_seen).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-3 py-2">{e.callsign || "—"}</td>
                      <td className="px-3 py-2 font-medium">{e.dep_airport || "—"}</td>
                      <td className="px-3 py-2 font-medium">{e.arr_airport || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatDuration(e.duration_min)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {message && (
          <p className="text-sm font-medium" style={{ color: NAVY }}>
            {message}
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}