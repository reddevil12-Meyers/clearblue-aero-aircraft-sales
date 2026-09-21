import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSignature, Copy, Check, ExternalLink, Loader2, Send } from "lucide-react";

// Staff dialog: converts a lead into a listing client — creates/advances the deal,
// generates the listing agreement, and emails the client a secure signing link.
// Pass `client` (then pick the aircraft) or `aircraft` (then pick the client).
export default function ConvertToListingDialog({ open, onClose, client = null, aircraft = null, onCreated }) {
  const [options, setOptions] = useState([]);
  const [refId, setRefId] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [termMonths, setTermMonths] = useState("3");
  const [signerEmail, setSignerEmail] = useState("");
  const [loadingOpts, setLoadingOpts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const selectingClient = !!aircraft;

  useEffect(() => {
    if (!open) return;
    setResult(null);
    setError("");
    setCopied(false);
    setRefId("");
    (async () => {
      setLoadingOpts(true);
      try {
        if (aircraft) {
          setAskingPrice(aircraft.asking_price != null ? String(aircraft.asking_price) : "");
          setSignerEmail("");
          const clients = await base44.entities.Client.list("last_name", 200);
          setOptions(clients.map((c) => ({
            id: c.id,
            label: `${c.first_name} ${c.last_name}`,
            email: c.email || "",
          })));
          if (aircraft.seller_id) {
            setRefId(aircraft.seller_id);
            const seller = clients.find((c) => c.id === aircraft.seller_id);
            if (seller) setSignerEmail(seller.email || "");
          }
        } else if (client) {
          setSignerEmail(client.email || "");
          const list = await base44.entities.Aircraft.list("-created_date", 200);
          const owned = list.filter((a) => a.seller_id === client.id);
          const pool = owned.length ? owned : list;
          setOptions(pool.map((a) => ({
            id: a.id,
            label: `${a.year || ""} ${a.make || ""} ${a.model || ""}${a.registration ? ` (${a.registration})` : ""}`.trim(),
            price: a.asking_price,
          })));
        }
      } catch (_) {
        setOptions([]);
      } finally {
        setLoadingOpts(false);
      }
    })();
  }, [open, client, aircraft]);

  const selectRef = (id) => {
    setRefId(id);
    const opt = options.find((o) => o.id === id);
    if (aircraft) {
      if (opt) setSignerEmail(opt.email || "");
    } else if (opt && opt.price != null) {
      setAskingPrice(String(opt.price));
    }
  };

  const ready = refId && askingPrice && commissionRate && (signerEmail || "").trim();

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        asking_price: Number(askingPrice),
        commission_rate: Number(commissionRate),
        term_months: Number(termMonths) || 6,
        signer_email: (signerEmail || "").trim(),
      };
      if (aircraft) {
        payload.client_id = refId;
        payload.aircraft_id = aircraft.id;
      } else {
        payload.client_id = client.id;
        payload.aircraft_id = refId;
      }
      const res = await base44.functions.invoke("createListingAgreement", payload);
      setResult(res.data);
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clientName = client ? `${client.first_name || ""} ${client.last_name || ""}`.trim() : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-primary" />
            {result ? "Listing agreement sent" : "Generate Listing Agreement"}
          </DialogTitle>
          <DialogDescription>
            {result
              ? "The client has been emailed a secure link to review and sign the listing agreement online."
              : aircraft
                ? "Create the listing agreement for this aircraft, email the owner a secure signing link, and move the deal to \u201cListing Agreement Being Prepared\u201d."
                : `Create the listing agreement${clientName ? ` for ${clientName}` : ""}, email them a secure signing link, and move the deal to \u201cListing Agreement Being Prepared\u201d.`}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Signing link</p>
              <p className="text-xs break-all text-foreground">{result.link}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={copyLink} variant="outline" className="flex-1 gap-2">
                {copied ? (
                  <><Check className="w-4 h-4 text-green-500" /> Copied</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy Link</>
                )}
              </Button>
              <a href={result.link} target="_blank" rel="noreferrer" className="flex-1">
                <Button className="w-full gap-2">
                  <ExternalLink className="w-4 h-4" /> Open Signing Page
                </Button>
              </a>
            </div>
            <Button variant="ghost" className="w-full" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {selectingClient ? "Owner (client)" : "Aircraft to list"}
              </Label>
              <Select value={refId} onValueChange={selectRef}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingOpts
                        ? "Loading..."
                        : selectingClient
                          ? "Select client..."
                          : "Select aircraft..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {options.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Asking Price ($)</Label>
                <Input type="number" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Commission (%)</Label>
                <Input type="number" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} placeholder="e.g. 10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Term (mo)</Label>
                <Input type="number" value={termMonths} onChange={(e) => setTermMonths(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Signer email</Label>
              <Input
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                placeholder="Where to send the agreement"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={submit} disabled={!ready || submitting || loadingOpts} className="w-full gap-2">
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Create &amp; Send Agreement</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}