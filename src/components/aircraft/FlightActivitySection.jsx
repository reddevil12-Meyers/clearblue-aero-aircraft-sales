import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function FlightActivitySection({ aircraftId }) {
  const [refreshing, setRefreshing] = useState(false);
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

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Pull the latest ADS-B position and status for this aircraft from the OpenSky Network.
      </p>
      <Button
        size="sm"
        variant="outline"
        className="gap-2"
        onClick={refresh}
        disabled={refreshing || !aircraftId}
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        {refreshing ? "Refreshing..." : "Refresh ADS-B now"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
          <p>
            <span className="font-bold">ADS-B status:</span> {result.adsb_status}
          </p>
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
    </div>
  );
}