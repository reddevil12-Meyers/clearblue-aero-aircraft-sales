import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, CheckCircle } from "lucide-react";

export default function PublicContact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.integrations.Core.SendEmail({
      to: "info@example.com",
      subject: `Website Contact: ${form.subject || "General Inquiry"} - ${form.name}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`,
    });
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-20 px-6 text-center">
        <h1 className="font-display text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-primary-foreground/75 text-lg">We'd love to hear from you. Reach out anytime.</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Get In Touch</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Whether you're looking to buy, sell, or get an appraisal, our team is here to help. Contact us and we'll respond within one business day.
          </p>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="bg-accent/10 rounded-lg p-3 shrink-0">
                <Phone className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Phone</p>
                <p className="text-muted-foreground text-sm">(555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-accent/10 rounded-lg p-3 shrink-0">
                <Mail className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p className="text-muted-foreground text-sm">info@aviationbrokerage.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-accent/10 rounded-lg p-3 shrink-0">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Location</p>
                <p className="text-muted-foreground text-sm">Based in the United States<br />Available nationwide</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div>
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-xl text-foreground mb-2">Message Sent!</h3>
              <p className="text-muted-foreground">Thanks for reaching out. We'll be in touch within one business day.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Full Name <span className="text-destructive">*</span></Label>
                  <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label>Email <span className="text-destructive">*</span></Label>
                  <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Subject</Label>
                  <Select onValueChange={(v) => set("subject", v)}>
                    <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                    <SelectContent>
                      {["Buying an Aircraft", "Selling an Aircraft", "Appraisal Inquiry", "Insurance", "General Question"].map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Message <span className="text-destructive">*</span></Label>
                <Textarea value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us how we can help..." rows={5} required />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}