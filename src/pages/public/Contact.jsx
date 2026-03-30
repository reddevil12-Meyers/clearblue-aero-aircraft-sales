import { useState } from "react";
import { Phone, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PublicContact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "info@flyclearblue.com",
        subject: `Contact Form Submission from ${form.name}`,
        body: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`
      });
    } catch {}
    setSending(false);
    setSent(true);
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-[#1a3a5c] py-12 text-center">
        <h1 className="text-4xl font-bold text-white">Contact Us</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-start">

        {/* Left: Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#5b99cc]">We work with you as a team.</h2>
          <p className="text-gray-600 leading-relaxed">
            If you are still reading, we're thrilled to have your undivided attention. Let us know how we can work together to get you what you're looking for and want.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#1a3a5c]/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-[#1a3a5c]" />
              </div>
              <p className="text-gray-700">
                <strong>Want to Talk?</strong>{" "}
                Call us at{" "}
                <a href="tel:+13862276840" className="text-[#5b99cc] hover:underline">(386) 227-6840</a>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#1a3a5c]/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#1a3a5c]" />
              </div>
              <p className="text-gray-700">
                <strong>Rather E-mail?</strong>{" "}
                E-mail us at{" "}
                <a href="mailto:info@flyclearblue.com" className="text-[#5b99cc] hover:underline">info@flyclearblue.com</a>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div>
          <h2 className="text-2xl font-bold text-[#1a3a5c] mb-6">We'd love to hear from you.</h2>

          {sent ? (
            <div className="text-center py-12 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Message Sent!</h3>
              <p className="text-gray-500 mb-6">We'll be in touch shortly.</p>
              <button className="text-sm text-[#5b99cc] underline" onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: "" }); }}>
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Name *" value={form.name} onChange={e => update("name", e.target.value)} />
              <input required type="email" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="E-mail *" value={form.email} onChange={e => update("email", e.target.value)} />
              <input required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Telephone *" value={form.phone} onChange={e => update("phone", e.target.value)} />
              <textarea required rows={6} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Message *" value={form.message} onChange={e => update("message", e.target.value)} />
              <div className="flex items-center gap-4">
                <button type="submit" disabled={sending} className="bg-[#1a3a5c] text-white px-5 py-2 rounded text-sm font-medium hover:bg-[#14304d] transition-colors">
                  {sending ? "Sending..." : "Send message"}
                </button>
                <button type="button" onClick={() => setForm({ name: "", email: "", phone: "", message: "" })} className="text-sm text-gray-500 underline">
                  clear
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}