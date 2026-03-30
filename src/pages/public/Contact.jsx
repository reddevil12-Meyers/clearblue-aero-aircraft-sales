import { useState } from "react";
import { Phone, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      <div className="bg-primary py-12 text-center">
        <h1 className="text-4xl font-display font-bold text-white">Contact Us</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-start">

        {/* Left: Info */}
        <div className="space-y-6">
          <div>
            <h2 className="text-accent font-semibold text-lg mb-2">We work with you as a team.</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are still reading, we're thrilled to have your undivided attention. Let us know how we can work together to get you what you're looking for and want.
            </p>
          </div>

          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-accent" />
              </div>
              <p className="text-foreground">
                <strong>Want to Talk?</strong>{" "}
                Call us at{" "}
                <a href="tel:+13862276840" className="text-accent hover:underline">(386) 227-6840</a>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-accent" />
              </div>
              <p className="text-foreground">
                <strong>Rather E-mail?</strong>{" "}
                E-mail us at{" "}
                <a href="mailto:info@flyclearblue.com" className="text-accent hover:underline">info@flyclearblue.com</a>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">We'd love to hear from you.</h2>

          {sent ? (
            <div className="text-center py-12 border border-border rounded-xl">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent!</h3>
              <p className="text-muted-foreground mb-6">We'll be in touch shortly.</p>
              <Button variant="outline" onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: "" }); }}>
                Send Another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                required
                placeholder="Name *"
                value={form.name}
                onChange={e => update("name", e.target.value)}
              />
              <Input
                required
                type="email"
                placeholder="E-mail *"
                value={form.email}
                onChange={e => update("email", e.target.value)}
              />
              <Input
                required
                placeholder="Telephone *"
                value={form.phone}
                onChange={e => update("phone", e.target.value)}
              />
              <Textarea
                required
                placeholder="Message *"
                rows={6}
                value={form.message}
                onChange={e => update("message", e.target.value)}
              />
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={sending} className="gap-2">
                  {sending ? "Sending..." : "Send message"}
                </Button>
                <button
                  type="button"
                  onClick={() => setForm({ name: "", email: "", phone: "", message: "" })}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
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