import { useState } from "react";
import { Link } from "react-router-dom";
import { Calculator, ArrowRight } from "lucide-react";

const NAVY = "#00447f";
const GOLD = "#C9A84C";

const fmt = (n) => "$" + Math.round(n).toLocaleString();

export default function LoanCalculator() {
  const [price, setPrice] = useState(500000);
  const [downPct, setDownPct] = useState(15);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const loanAmount = Math.max(0, price * (1 - downPct / 100));
  const n = Math.max(1, Math.round(years * 12));
  const r = rate / 100 / 12;
  const monthly = r > 0
    ? (loanAmount * r) / (1 - Math.pow(1 + r, -n))
    : loanAmount / n;
  const totalPaid = monthly * n;
  const totalInterest = totalPaid - loanAmount;

  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:border-[#00447f] focus:ring-2 focus:ring-[#00447f]/20";
  const labelCls = "block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="grid lg:grid-cols-2">
        {/* Inputs */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: NAVY }}>
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-black" style={{ color: NAVY }}>Aircraft Loan Calculator</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className={labelCls}>Purchase Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" min="0" value={price} onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))} className={inputCls + " pl-7"} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Down Payment — {downPct}% ({fmt(price * downPct / 100)})</label>
              <input type="range" min="0" max="50" step="1" value={downPct} onChange={(e) => setDownPct(Number(e.target.value))} className="w-full accent-[#00447f]" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span><span>50%</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Interest Rate (APR)</label>
                <div className="relative">
                  <input type="number" min="0" step="0.1" value={rate} onChange={(e) => setRate(Math.max(0, Number(e.target.value)))} className={inputCls + " pr-7"} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
              <div>
                <label className={labelCls}>Term of Loan — {years} years</label>
                <select value={years} onChange={(e) => setYears(Number(e.target.value))} className={inputCls}>
                  {[5, 10, 15, 20, 25].map((y) => (
                    <option key={y} value={y}>{y} years</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="p-8 flex flex-col justify-center" style={{ backgroundColor: NAVY }}>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-white/60 text-sm font-medium">Loan Amount</span>
              <span className="text-white font-bold text-lg">{fmt(loanAmount)}</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="py-2">
              <p className="text-white/60 text-sm font-medium mb-1">Estimated Monthly Payment</p>
              <p className="text-4xl font-black" style={{ color: GOLD }}>{fmt(monthly)}</p>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex justify-between items-baseline">
              <span className="text-white/60 text-sm font-medium">Total Interest</span>
              <span className="text-white font-bold text-lg">{fmt(totalInterest)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-white/60 text-sm font-medium">Total of Payments</span>
              <span className="text-white font-bold text-lg">{fmt(totalPaid)}</span>
            </div>
          </div>
          <Link to="/contact" className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded font-bold text-sm transition-all hover:brightness-110" style={{ backgroundColor: GOLD, color: NAVY }}>
            Request a FREE Quote <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-white/35 text-xs mt-4 leading-relaxed">
            Estimates only. Actual rates and terms depend on credit profile, aircraft, and lender requirements.
          </p>
        </div>
      </div>
    </div>
  );
}