import { Link } from "react-router-dom";

const NAVY = "#1B365D";
const LIGHT = "#E8EEF5";

export default function OtherPractices({ practices }) {
  return (
    <section className="py-14 px-4" style={{ backgroundColor: LIGHT }}>
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: NAVY }}>
          Other practices
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {practices.map((p, i) => (
            <span key={p.to} className="flex items-center gap-3">
              <Link to={p.to} className="text-sm font-semibold hover:underline" style={{ color: NAVY }}>
                {p.name}
              </Link>
              {i < practices.length - 1 && <span className="text-gray-300">·</span>}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}