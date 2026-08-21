import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart3, Loader2, RefreshCw, TrendingUp, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const MAKE_OPTIONS = [
  "Cessna", "Piper", "Beechcraft", "Cirrus", "Mooney",
  "Diamond", "Columbia", "Pilatus", "TBM", "Grumman"
];
const BATCH_SIZE = 2;

const fmtMoney = (n) => (n == null ? "—" : `$${Number(n).toLocaleString()}`);
const fmtNum = (n) => (n == null ? "—" : Number(n).toLocaleString());
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function MarketReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [selectedMakes, setSelectedMakes] = useState(MAKE_OPTIONS);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await base44.entities.MarketReport.list("-run_date", 50);
      setReports(data);
      if (data.length > 0) setExpanded(data[0].id);
    } catch (e) {
      setError(e.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleMake = (make) => {
    setSelectedMakes(prev =>
      prev.includes(make) ? prev.filter(m => m !== make) : [...prev, make]
    );
  };

  const handleRun = async () => {
    if (selectedMakes.length === 0) return;
    setRunning(true);
    setError(null);
    setProgress({ completed: 0, total: selectedMakes.length });
    try {
      // Start the report (gathers the first batch and returns a report id)
      let res = await base44.functions.invoke("runMarketReport", { makes: selectedMakes });
      let data = res.data || {};
      let reportId = data.report_id;
      let completed = data.completed || 0;
      setProgress({ completed, total: selectedMakes.length });

      // Drive remaining batches sequentially so each call stays well under the timeout
      while (completed < selectedMakes.length) {
        const batch = selectedMakes.slice(completed, completed + BATCH_SIZE);
        res = await base44.functions.invoke("runMarketReport", { report_id: reportId, batch });
        data = res.data || {};
        completed = data.completed || completed + batch.length;
        setProgress({ completed, total: selectedMakes.length });
      }

      // Finalize: aggregate, generate narrative, send email
      await base44.functions.invoke("runMarketReport", { report_id: reportId, finalize: true });
      await load();
    } catch (e) {
      setError(e.message || "Failed to run report");
    } finally {
      setRunning(false);
    }
  };

  const active = reports.find(r => r.id === expanded);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Market Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Weekly aggregated aircraft market data gathered from Trade-A-Plane, Controller, Hangar 67, AirMart, and more.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {running && progress.total > 0 && (
            <div className="text-xs text-muted-foreground">
              Gathering {progress.completed}/{progress.total} makes…
            </div>
          )}
          <Button onClick={handleRun} disabled={running || selectedMakes.length === 0} className="gap-2">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {running ? "Running..." : "Run Report Now"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-xs font-medium text-muted-foreground">Makes to include:</span>
        {MAKE_OPTIONS.map(m => (
          <label key={m} className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <Checkbox checked={selectedMakes.includes(m)} onCheckedChange={() => toggleMake(m)} />
            {m}
          </label>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 text-sm">
          {error}
          <Button variant="ghost" size="sm" onClick={load} className="ml-3">Retry</Button>
        </div>
      )}

      {!loading && reports.length === 0 && !error && (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <Plane className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-medium">No reports yet</p>
          <p className="text-sm text-muted-foreground mt-1">Click "Run Report Now" to generate the first market report, or wait for the weekly schedule.</p>
        </div>
      )}

      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Report list */}
          <div className="space-y-2">
            {reports.map(r => (
              <button
                key={r.id}
                onClick={() => setExpanded(r.id)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  expanded === r.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{fmtDate(r.run_date)}</p>
                  <Badge variant={r.status === "Completed" ? "default" : r.status === "Running" ? "secondary" : "destructive"}>
                    {r.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {r.total_listings || 0} listings · {r.by_make?.length || 0} makes
                </p>
              </button>
            ))}
          </div>

          {/* Report detail */}
          {active && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold mb-3">Report — {fmtDate(active.run_date)}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Listings Sampled", value: active.total_listings || 0 },
                    { label: "Avg Asking Price", value: fmtMoney(active.avg_asking_price) },
                    { label: "Avg Sold Price", value: fmtMoney(active.avg_sold_price) },
                    { label: "Avg Total Time", value: `${fmtNum(active.avg_total_time)} hrs` },
                    { label: "Avg Engine SMOH", value: `${fmtNum(active.avg_engine_time)} hrs` },
                    { label: "Avg Year", value: active.avg_year || "—" },
                    { label: "Sold Sampled", value: active.total_sold || 0 },
                    { label: "Manufacturers", value: active.by_make?.length || 0 },
                  ].map(s => (
                    <div key={s.label} className="bg-card border border-border rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-lg font-bold mt-1">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {active.summary && (
                <div className="bg-muted/40 border-l-4 border-primary rounded-r-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-line">{active.summary}</p>
                </div>
              )}

              {/* By make */}
              {active.by_make?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Breakdown by Manufacturer</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted text-muted-foreground">
                          <th className="text-left p-2 font-medium">Make</th>
                          <th className="text-center p-2 font-medium">Listings</th>
                          <th className="text-center p-2 font-medium">Sold</th>
                          <th className="text-right p-2 font-medium">Avg Asking</th>
                          <th className="text-right p-2 font-medium">Avg Sold</th>
                          <th className="text-right p-2 font-medium">Avg TT</th>
                          <th className="text-center p-2 font-medium">Avg Year</th>
                        </tr>
                      </thead>
                      <tbody>
                        {active.by_make.map((row, i) => (
                          <tr key={i} className="border-b border-border">
                            <td className="p-2 font-medium">{row.make}</td>
                            <td className="text-center p-2">{row.count}</td>
                            <td className="text-center p-2">{row.sold_count || 0}</td>
                            <td className="text-right p-2">{fmtMoney(row.avg_asking_price)}</td>
                            <td className="text-right p-2">{fmtMoney(row.avg_sold_price)}</td>
                            <td className="text-right p-2">{fmtNum(row.avg_total_time)}</td>
                            <td className="text-center p-2">{row.avg_year || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* By model */}
              {active.by_model?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Breakdown by Model (Top {active.by_model.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted text-muted-foreground">
                          <th className="text-left p-2 font-medium">Make</th>
                          <th className="text-left p-2 font-medium">Model</th>
                          <th className="text-center p-2 font-medium">Count</th>
                          <th className="text-right p-2 font-medium">Avg Asking</th>
                          <th className="text-right p-2 font-medium">Avg Sold</th>
                          <th className="text-right p-2 font-medium">Avg TT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {active.by_model.map((row, i) => (
                          <tr key={i} className="border-b border-border">
                            <td className="p-2">{row.make}</td>
                            <td className="p-2 font-medium">{row.model}</td>
                            <td className="text-center p-2">{row.count}</td>
                            <td className="text-right p-2">{fmtMoney(row.avg_asking_price)}</td>
                            <td className="text-right p-2">{fmtMoney(row.avg_sold_price)}</td>
                            <td className="text-right p-2">{fmtNum(row.avg_total_time)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* By engine type */}
              {active.by_engine_type?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Breakdown by Engine Type</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted text-muted-foreground">
                          <th className="text-left p-2 font-medium">Engine Type</th>
                          <th className="text-center p-2 font-medium">Count</th>
                          <th className="text-right p-2 font-medium">Avg Asking</th>
                          <th className="text-right p-2 font-medium">Avg Sold</th>
                          <th className="text-right p-2 font-medium">Avg TT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {active.by_engine_type.map((row, i) => (
                          <tr key={i} className="border-b border-border">
                            <td className="p-2 font-medium">{row.engine_type}</td>
                            <td className="text-center p-2">{row.count}</td>
                            <td className="text-right p-2">{fmtMoney(row.avg_asking_price)}</td>
                            <td className="text-right p-2">{fmtMoney(row.avg_sold_price)}</td>
                            <td className="text-right p-2">{fmtNum(row.avg_total_time)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Sources: {(active.sources_searched || []).join(", ")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}