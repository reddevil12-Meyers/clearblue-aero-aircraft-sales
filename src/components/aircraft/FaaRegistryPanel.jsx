import { BookOpen, Info, Plane } from "lucide-react";

const NAVY = "#00447f";
const GOLD = "#C9A84C";

// Placeholder staff panel — the FAA registry ingest is not implemented yet.
// AircraftRegistrySnapshot records (source=faa_master) will render here once
// the ingest lands. OpenSky data stays activity-only; FAA is title data.
export default function FaaRegistryPanel({ registration }) {
  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: NAVY }}>
        <div className="flex items-center gap-2">
          <span className="inline-block w-1 h-4 rounded-full" style={{ backgroundColor: GOLD }} />
          <p className="text-xs font-bold uppercase tracking-widest text-white">
            FAA registration snapshot (coming next)
          </p>
        </div>
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-white"
          style={{ color: NAVY, borderColor: GOLD }}
        >
          Placeholder
        </span>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3">
          <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: NAVY }} />
          <div className="text-sm space-y-1.5">
            <p className="font-medium text-foreground">
              Two different data sources — don't mix them up:
            </p>
            <p className="flex items-start gap-1.5 text-muted-foreground">
              <Plane className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                <strong className="text-foreground">OpenSky (ADS-B panel above)</strong> is{" "}
                <em>activity</em> data — where and when the aircraft has flown.
              </span>
            </p>
            <p className="flex items-start gap-1.5 text-muted-foreground">
              <BookOpen className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                <strong className="text-foreground">FAA registry</strong> is <em>title and
                registration</em> data — certificate issue/expiration dates, status codes,
                Mode S code, and registered owner type and location. OpenSky must never be
                used as a source for registration history.
              </span>
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          This panel will pull the latest FAA master-file snapshot for{" "}
          <span className="font-semibold" style={{ color: NAVY }}>
            {registration || "this aircraft"}
          </span>{" "}
          (certificate dates, registration status, Mode S code, owner type and location)
          once the ingest is connected. No data is collected yet.
        </p>
      </div>
    </div>
  );
}