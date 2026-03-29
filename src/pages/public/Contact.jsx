import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Mail, Clock, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: 'sales@flyclearblue.com',
      subject: `Website Contact: ${form.subject}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`,
    });
    setSent(true);
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#1a3a5c] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Contact Us</h1>
          <p className="text-blue-200 text-lg">We'd love to hear from you. Reach out about buying, selling, or appraising your aircraft.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-[#1a3a5c] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Get in Touch</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#e8f0f8] rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#1a3a5c]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <a href="tel:+13862276840" className="text-[#1a3a5c] hover:underline text-lg">(386) 227-6840</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#e8f0f8] rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#1a3a5c]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <a href="mailto:sales@flyclearblue.com" className="text-[#1a3a5c] hover:underline">sales@flyclearblue.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#e8f0f8] rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#1a3a5c]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Business Hours</p>
                  <p className="text-gray-600">Monday – Friday, 8 AM – 6 PM ET</p>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-[#f5f8fc] rounded-xl p-6">
              <h3 className="font-semibold text-[#1a3a5c] mb-2">ClearBlue Aero, Inc.</h3>
              <p className="text-sm text-gray-600">A Veteran Owned Aircraft Brokerage</p>
              <p className="text-sm text-gray-600 mt-1">Aircraft Sales · Acquisitions · Appraisals · Leasing</p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-[#1a3a5c] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Send a Message</h2>
            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-800 text-lg">Message Sent!</h3>
                <p className="text-green-600 mt-1">We'll get back to you as soon as possible.</p>
                <Button className="mt-4 bg-[#1a3a5c]" onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}>
                  Send Another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Name *</Label>
                    <Input required value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(555) 000-0000" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input required type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={e => update('subject', e.target.value)} placeholder="How can we help?" />
                </div>
                <div className="space-y-1.5">
                  <Label>Message *</Label>
                  <Textarea required value={form.message} onChange={e => update('message', e.target.value)} rows={5} placeholder="Tell us about your aircraft or what you're looking for..." />
                </div>
                <Button type="submit" disabled={sending} className="w-full bg-[#1a3a5c] hover:bg-[#0f2740] gap-2">
                  <Send className="w-4 h-4" />{sending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}