import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle } from "lucide-react";

export default function AircraftEntryForm({ engineType }) {
  const [form, setForm] = useState({ registration: "", make: "", model: "", year: "", serial_number: "", total_time: "", engine_time_smoh: "", avionics_suite: "", interior_condition: "", exterior_condition: "", asking_price: "", location: "", notes: "", contact_name: "", contact_email: "", contact_phone: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.functions.invoke("submitListing", { ...form, engine_type: engineType === "twin" ? "Piston" : "Piston", num_engines: engineType === "twin" ? 2 : 1 });
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Submission Received!</h2>
        <p className="text-muted-foreground">Thank you for submitting your aircraft. Our team will review your listing and contact you within 1-2 business days.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-16 px-6 text-center">
        <h1 className="font-display text-4xl font-bold mb-2">List Your {engineType === "twin" ? "Twin" : "Single"}-Engine Aircraft</h1>
        <p className="text-primary-foreground/75">Provide the details below and we'll be in touch shortly.</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Aircraft Info */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-lg text-foreground mb-2">Aircraft Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Registration (N-Number)", key: "registration", required: true },
                { label: "Year", key: "year", type: "number", required: true },
                { label: "Make", key: "make", required: true },
                { label: "Model", key: "model", required: true },
                { label: "Serial Number", key: "serial_number" },
                { label: "Total Time (hrs)", key: "total_time", type: "number" },
                { label: "Engine Time SMOH (hrs)", key: "engine_time_smoh", type: "number" },
                { label: "Location (Airport)", key: "location" },
                { label: "Asking Price ($)", key: "asking_price", type: "number" },
              ].map(({ label, key, type, required }) => (
                <div key={key} className="space-y-1">
                  <Label>{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
                  <Input type={type || "text"} value={form[key]} onChange={(e) => set(key, e.target.value)} required={required} />
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {[
                { label: "Interior Condition", key: "interior_condition", options: ["New/Refurbished", "Excellent", "Good", "Fair", "Poor"] },
                { label: "Exterior Condition", key: "exterior_condition", options: ["New/Refurbished", "Excellent", "Good", "Fair", "Poor"] },
                { label: "Avionics Suite", key: "avionics_suite", options: ["Garmin G1000", "Garmin G3X", "Garmin GTN 750/650", "Avidyne IFD", "Aspen EFD", "King Digital", "Collins Pro Line", "Steam Gauges", "Mixed/Upgraded", "Other"] },
              ].map(({ label, key, options }) => (
                <div key={key} className="space-y-1">
                  <Label>{label}</Label>
                  <Select onValueChange={(v) => set(key, v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <Label>Additional Notes</Label>
              <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Describe any upgrades, damage history, recent maintenance, etc." rows={4} />
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-lg text-foreground mb-2">Your Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Full Name", key: "contact_name", required: true },
                { label: "Email", key: "contact_email", type: "email", required: true },
                { label: "Phone", key: "contact_phone", type: "tel" },
              ].map(({ label, key, type, required }) => (
                <div key={key} className="space-y-1">
                  <Label>{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
                  <Input type={type || "text"} value={form[key]} onChange={(e) => set(key, e.target.value)} required={required} />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit My Aircraft"}
          </Button>
        </form>
      </div>
    </div>
  );
}