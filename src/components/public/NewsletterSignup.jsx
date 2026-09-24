import { useState } from "react";
import { supabase } from "@/api/base44Client";
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
      const { error } = await supabase.from('newsletter_subscribers').upsert({ email, name }, { onConflict: 'email' });
      setMessage("Successfully subscribed!");
      setStatus("success");
    } catch {
      setMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <section
      className="py-20 bg-cover bg-center relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,30,60,0.82), rgba(0,30,60,0.82)), url('https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/8ad5201c0_generated_image.png')"
      }}
    >
      <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-6" style={{ backgroundColor: 'rgba(232,240,248,0.15)' }}>
          <Mail className="w-7 h-7 text-[#C9A84C]" />
        </div>
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-3">Stay in the Loop</p>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Aircraft Alerts</h2>
        <p className="text-white/70 text-base mb-8 max-w-md mx-auto">
          Be the first to know when a new aircraft hits our inventory. No spam, just fresh listings.
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