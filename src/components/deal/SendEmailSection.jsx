import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, ChevronDown, ChevronUp } from "lucide-react";

export default function SendEmailSection({ deal, documentUrls = [] }) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState(`Purchase Agreement – ${deal.aircraft_summary || deal.title}`);
  const [body, setBody] = useState(`Please find the attached purchase agreement for ${deal.aircraft_summary || deal.title}.\n\nPlease review and contact us with any questions.\n\nThank you.`);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const getFileName = (url) => {
    const parts = url.split('/');
    return decodeURIComponent(parts[parts.length - 1]);
  };

  const handleSend = async () => {
    if (!to) return;
    setSending(true);
    setSent(false);
    await base44.functions.invoke('sendDealEmail', {
      to,
      subject,
      body,
      attachment_url: attachmentUrl || undefined,
      attachment_name: attachmentUrl ? getFileName(attachmentUrl) : undefined
    });
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section className="bg-card rounded-xl border border-border p-6">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setOpen(o => !o)}
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider">Send Email</h2>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">To (email address)</Label>
            <Input value={to} onChange={e => setTo(e.target.value)} placeholder="buyer@example.com" type="email" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Message</Label>
            <Textarea value={body} onChange={e => setBody(e.target.value)} rows={5} />
          </div>
          {documentUrls.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Attach Document (optional)</Label>
              <Select value={attachmentUrl} onValueChange={setAttachmentUrl}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a document to attach..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>No attachment</SelectItem>
                  {documentUrls.map((url, i) => (
                    <SelectItem key={i} value={url}>{getFileName(url)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center gap-3 pt-1">
            <Button onClick={handleSend} disabled={sending || !to} className="gap-2">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending...' : 'Send Email'}
            </Button>
            {sent && <span className="text-sm text-green-600 font-medium">Email sent successfully!</span>}
          </div>
        </div>
      )}
    </section>
  );
}