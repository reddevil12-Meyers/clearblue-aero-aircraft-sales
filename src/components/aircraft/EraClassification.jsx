import { Check } from "lucide-react";

const ERAS = [
  { label: "Antique", definition: "Built on or before August 31, 1945 (pre-World War II and early post-war models)" },
  { label: "Classic", definition: "Built between September 1, 1945, and December 31, 1955" },
  { label: "Contemporary", definition: "Built between January 1, 1956, and December 31, 1970" },
  { label: "Late Model", definition: "Built between January 1, 1971 – Present" },
];

const eraForYear = (year) => {
  const y = Number(year);
  if (!y) return null;
  if (y <= 1945) return "Antique";
  if (y <= 1955) return "Classic";
  if (y <= 1970) return "Contemporary";
  return "Late Model";
};

export default function EraClassification({ year }) {
  const active = eraForYear(year);

  return (
    <div className="col-span-2 lg:col-span-3 border-t border-border pt-4">
      <p className="text-xs font-bold text-muted-foreground">Era Classification</p>
      <p className="text-xs text-muted-foreground mt-0.5 mb-3">
        Automatically determined by year of manufacture.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ERAS.map(e => {
          const checked = active === e.label;
          return (
            <div
              key={e.label}
              className={`flex items-start gap-2.5 rounded-lg border p-2.5 ${
                checked ? 'border-accent bg-accent/5' : 'border-border'
              }`}
            >
              <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                checked ? 'border-accent bg-accent text-white' : 'border-muted-foreground/30'
              }`}>
                {checked && <Check className="h-3 w-3" />}
              </div>
              <div>
                <p className={`text-sm font-medium ${checked ? 'text-foreground' : 'text-muted-foreground'}`}>{e.label}</p>
                <p className="text-xs text-muted-foreground">{e.definition}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}