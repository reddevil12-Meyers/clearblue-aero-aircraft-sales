import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Video, Send, CheckCircle, Loader2 } from "lucide-react";

export default function AircraftInquiryBox({ aircraft }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const reg = aircraft?.registration || "";

  const subject = reg
    ? `Aircraft Inquiry: ${aircraft.year} ${aircraft.make} ${aircraft.model} (N${reg})`
    : `Aircraft Inquiry: ${aircraft.year} ${aircraft.make} ${aircraft.model}`;

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await base44.functions.invoke("submitContactForm", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject,
        message: form.message
      });
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="bg-[#00447f] text-white rounded-2xl p-6 sm:p-8 text-center">
      <h3 className="text-2xl sm:text-3xl font-black tracking-wide mb-3 uppercase">
        Have Questions About {reg}?
      </h3>


      {/* Action buttons */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <a
          href="tel:+13862276840"
          className="inline-flex items-center justify-center gap-2 py-4 px-10 rounded-lg font-bold text-base border border-white text-white bg-transparent transition-all hover:bg-white/10"
        >
          <Video className="w-5 h-5" /> Schedule a Virtual Tour
        </a>
        <a
          href="tel:+13862276840"
          className="inline-flex items-center justify-center gap-2 py-4 px-10 rounded-lg font-bold text-base transition-all hover:brightness-110"
          style={{ backgroundColor: '#C9A84C', color: '#00447f' }}
        >
          <Phone className="w-5 h-5" /> Call (386) 227-6840
        </a>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Or send an inquiry</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      {/* Inquiry form */}
      {status === "success" ? (
        <div className="flex flex-col items-center gap-3 py-6 text-white">
          <CheckCircle className="w-12 h-12 text-[#C9A84C]" />
          <p className="font-bold text-lg">Inquiry Sent!</p>
          <p className="text-white/70 text-sm max-w-sm">
            Thanks for your interest. A ClearBlue Aero specialist will reach out shortly.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-2 text-xs font-semibold text-white/70 hover:text-white underline underline-offset-2"
          >
            Send another inquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 max-w-md mx-auto text-left">
          <p className="text-white/80 text-sm text-center mb-1 leading-relaxed">
            Please use this form for more info about this aircraft. We strive to do our best to make your experience as smooth and hassle-free as possible. We are here to assist!
          </p>
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/50 outline-none focus:border-[#C9A84C] transition-colors"
          />
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/50 outline-none focus:border-[#C9A84C] transition-colors"
          />
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone (optional)"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/50 outline-none focus:border-[#C9A84C] transition-colors"
          />
          <textarea
            name="message"
            rows={3}
            value={form.message}
            onChange={handleChange}
            placeholder="How can we help?"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/50 outline-none focus:border-[#C9A84C] transition-colors resize-none"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm text-white transition-all hover:brightness-110 disabled:opacity-60"
            style={{ backgroundColor: '#C9A84C', color: '#00447f' }}
          >
            {status === "loading" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
            ) : (
              <><Send className="w-4 h-4" /> Send Inquiry</>
            )}
          </button>
          {status === "error" && (
            <p className="text-red-300 text-xs text-center">
              Something went wrong. Please try again or call us directly.
            </p>
          )}
        </form>
      )}

      {/* Footer */}
      <div className="mt-6 pt-5 border-t border-white/10 text-xs text-white space-y-1">
        <p>Monday – Friday, 8 AM – 6 PM EST</p>
        <p>sales@flyclearblue.com</p>
      </div>
    </div>
  );
}