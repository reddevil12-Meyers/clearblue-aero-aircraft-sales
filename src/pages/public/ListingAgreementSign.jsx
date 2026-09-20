import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SignaturePad from "@/components/agreement/SignaturePad";
import useNoIndex from "@/hooks/useNoIndex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ShieldCheck, Loader2, FileSignature, AlertCircle } from "lucide-react";

const usd = (n) =>
  n == null || isNaN(Number(n)) ? null : "$" + Number(n).toLocaleString("en-US");

// Public online signing page for a listing agreement, reached by secure token.
export default function ListingAgreementSign() {
  useNoIndex();
  const { token } = useParams();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ack, setAck] = useState({});
  const [signature, setSignature] = useState(null);
  const [printedName, setPrintedName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    base44.functions.invoke("getListingAgreementByToken", { token })
      .then((res) => {
        const a = res.data.agreement;
        setAgreement(a);
        if (a.status === "Signed") {
          setSigned(true);
          setPdfUrl(a.pdf_url);
        }
      })
      .catch(() => setError("We couldn't find this agreement. The link may be invalid or expired."))
      .finally(() => setLoading(false));
  }, [token]);

  // Once signed, pick up the executed PDF as soon as it's generated
  useEffect(() => {
    if (!signed || pdfUrl) return;
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      try {
        const res = await base44.functions.invoke("getListingAgreementByToken", { token });
        if (res.data.agreement.pdf_url) {
          setPdfUrl(res.data.agreement.pdf_url);
          clearInterval(timer);
        }
      } catch (_) { /* retry */ }
      if (tries >= 10) clearInterval(timer);
    }, 4000);
    return () => clearInterval(timer);
  }, [signed, pdfUrl, token]);

  const allAcked = agreement
    ? agreement.acknowledgments.every((a) => ack[a.id])
    : false;
  const canSign = allAcked && printedName.trim().length > 1;

  const handleSign = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await base44.functions.invoke("signListingAgreement", {
        token,
        acknowledged: agreement.acknowledgments.map((a) => a.id),
        signature_data_url: signature || "",
        printed_name: printedName.trim(),
      });
      setPdfUrl(res.data.pdf_url || null);
      setSigned(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-[#00447f] animate-spin" />
        <p className="mt-4 text-sm text-slate-500">Loading your agreement...</p>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
        <h1 className="mt-4 text-xl font-semibold text-slate-800">Agreement not found</h1>
        <p className="mt-2 text-sm text-slate-500">{error || "This link is invalid or the agreement is no longer available."}</p>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-[#00447f] px-6 py-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-[#c9a227] flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-white">Agreement Signed</h1>
            <p className="mt-2 text-sm text-blue-100">
              Thank you{agreement.client_name ? `, ${agreement.client_name.split(" ")[0]}` : ""} — your listing
              agreement{agreement.aircraft_summary ? ` for ${agreement.aircraft_summary}` : ""} is complete.
            </p>
          </div>
          <div className="p-6 sm:p-8 text-center">
            <p className="text-sm text-slate-600 leading-relaxed">
              A copy of your fully executed agreement is on its way to your email. We'll be in touch shortly
              about listing your aircraft and next steps.
            </p>
            {pdfUrl ? (
              <a href={pdfUrl} target="_blank" rel="noreferrer">
                <Button className="mt-5 bg-[#c9a227] hover:bg-[#b08d1e] text-slate-900 font-semibold">
                  Download a Copy (PDF)
                </Button>
              </a>
            ) : (
              <p className="mt-5 text-xs text-slate-400">Your PDF copy is being prepared — it will appear here in a moment.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="bg-[#00447f] rounded-2xl px-6 py-8 text-center shadow-sm">
        <div className="inline-flex items-center gap-2 text-white">
          <FileSignature className="w-5 h-5" />
          <span className="text-xs tracking-widest uppercase font-semibold">ClearBlue Aero</span>
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-white">Aircraft Listing Agreement</h1>
        <p className="mt-2 text-sm text-blue-100">
          {agreement.client_name ? `Prepared for ${agreement.client_name}` : "Please review and sign below"}
        </p>
      </div>

      {/* Key facts */}
      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aircraft</p>
        <p className="text-sm font-medium text-slate-900 mt-1">{agreement.aircraft_summary || "As described in the agreement"}</p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Listing Price</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{usd(agreement.asking_price) || "TBD"}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Commission</p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {agreement.commission_rate != null && agreement.commission_rate > 0 ? `${agreement.commission_rate}%` : "As agreed"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Term</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{agreement.term_months || 6} months</p>
        </div>
      </div>

      {/* Agreement body */}
      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-5 sm:p-7">
        {agreement.sections.map((s) => (
          <div key={s.heading} className="mb-5 last:mb-0">
            <h3 className="text-sm font-bold text-slate-900">{s.heading}</h3>
            {s.body.map((p, i) => (
              <p key={i} className="mt-2 text-sm leading-relaxed text-slate-600">{p}</p>
            ))}
          </div>
        ))}
      </div>

      {/* Acknowledgments + signature */}
      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-5 sm:p-7">
        <h3 className="text-sm font-bold text-slate-900">Before you sign</h3>
        <p className="text-xs text-slate-500 mt-1">Please check each box to acknowledge your agreement.</p>
        <div className="mt-4 space-y-3">
          {agreement.acknowledgments.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAck((prev) => ({ ...prev, [a.id]: !prev[a.id] }))}
              className={`w-full flex items-start gap-3 text-left rounded-lg border p-3 transition-colors ${
                ack[a.id] ? "border-[#00447f] bg-blue-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span
                className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border shrink-0 ${
                  ack[a.id] ? "bg-[#00447f] border-[#00447f]" : "border-slate-300 bg-white"
                }`}
              >
                {ack[a.id] && <Check className="w-3.5 h-3.5 text-white" />}
              </span>
              <span className="text-xs leading-relaxed text-slate-600">{a.text}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold text-slate-900">Your signature</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Sign exactly as your name appears on the aircraft registration. If you don't draw a signature, your typed
            printed name will be used as your signature.
          </p>
          <SignaturePad onChange={setSignature} />
          <div className="mt-4">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Printed name</label>
            <Input
              className="mt-1.5"
              value={printedName}
              onChange={(e) => setPrintedName(e.target.value)}
              placeholder="Your full legal name"
            />
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <Button
            onClick={handleSign}
            disabled={!canSign || submitting}
            className="mt-6 w-full h-12 bg-[#c9a227] hover:bg-[#b08d1e] text-slate-900 font-semibold text-base"
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Signing...</>
            ) : (
              "Sign Listing Agreement"
            )}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            The date, time, and your device's IP address are recorded when you sign.
          </p>
        </div>
      </div>
    </div>
  );
}