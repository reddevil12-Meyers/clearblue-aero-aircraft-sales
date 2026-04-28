import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, CheckCircle } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await base44.functions.invoke("subscribeNewsletter", { email, name });
      setMessage(res.data.message || "Successfully subscribed!");
      setStatus("success");
    } catch {
      setMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-6" style={{ backgroundColor: '#e8f0f8' }}>
          <Mail className="w-7 h-7" style={{ color: '#00447f' }} />
        </div>
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-3">Stay in the Loop</p>
        <h2 className="text-3xl md:text-4xl font-black text-[#00447f] mb-4">Aircraft Alerts</h2>
        <p className="text-gray-500 text-base mb-8 max-w-md mx-auto">
          Be the first to know when a new aircraft hits our inventory. No spam — just fresh listings.
        </p>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 text-green-600">
            <CheckCircle className="w-10 h-10" />
            <p className="font-semibold text-lg">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#00447f] transition-colors"
            />
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#00447f] transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 rounded-lg font-bold text-sm text-white transition-all hover:brightness-110 disabled:opacity-60 shrink-0"
              style={{ backgroundColor: '#00447f' }}
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="text-red-500 text-sm mt-3">{message}</p>
        )}
      </div>
    </section>
  );
}