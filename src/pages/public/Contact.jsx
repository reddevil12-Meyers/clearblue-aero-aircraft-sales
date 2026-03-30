import { useState } from "react";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";

export default function PublicContact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "info@yourdomain.com",
        subject: `Contact Form: ${form.subject}`,
        body: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`
      });
    } catch {}
    setSending(false);
    setSent(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-primary mb-3">Contact Us</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Ready to buy, sell, or appraise an aircraft? We'd love to hear from you.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Contact Info */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-display font-semibold text-foreground mb-6">Get In Touch</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Location</p>
                  <p className="text-muted-foreground">Based in Florida</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Phone</p>
                  <a href="tel:+13862276840" className="text-muted-foreground hover:text-accent transition-colors">(386) 227-6840</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <p className="text-muted-foreground">info@yourdomain.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-6 border border-border">
            <h3 className="font-semibold text-foreground mb-2">Serving Buyers & Sellers Nationwide</h3>
            <p className="text-sm text-muted-foreground">
              Whether you're looking for your first aircraft or selling a turbine, our team brings decades of aviation experience to every transaction. Appraisals, brokerage, and consulting services available.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card rounded-xl border border-border p-8">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent!</h3>
              <p className="text-muted-foreground">We'll be in touch shortly.</p>
              <Button variant="outline" className="mt-6" onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}>
                Send Another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-xl font-semibold text-foreground mb-1">Send a Message</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Name *</Label>
                  <Input required value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input required type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="your@email.com" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="(555) 000-0000" />
                </div>
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={e => update("subject", e.target.value)} placeholder="How can we help?" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Message *</Label>
                <Textarea required value={form.message} onChange={e => update("message", e.target.value)} placeholder="Tell us about your aircraft needs..." rows={5} />
              </div>
              <Button type="submit" disabled={sending} className="w-full gap-2">
                <Send className="w-4 h-4" />
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}