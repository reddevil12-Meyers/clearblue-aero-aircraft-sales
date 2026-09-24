import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import CollapsibleSection from "@/components/aircraft/CollapsibleSection";

const MAX_CHARS = 600;

export default function OnlineListingDescription({ form, update, disabled = false }) {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const value = form.online_listing_description || "";

  const generate = async () => {
    toast({ title: "AI feature coming soon", description: "AI listing description generation will be available shortly." });
  };

  return (
    <CollapsibleSection
      value="online_listing"
      title="Online Listing Description"
      headerAction={
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={generate}
          disabled={generating || disabled}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          {generating ? 'Generating...' : 'Generate with AI'}
        </Button>
      }
    >
      <p className="text-xs text-muted-foreground mb-4">
        Short classified ad text for Barnstormers and Trade-A-Plane (600 characters or less). Saved with the record and never shown on the public listing.
      </p>
      <Textarea
        value={value}
        onChange={e => update('online_listing_description', e.target.value)}
        rows={6}
        placeholder="Generate with AI or paste classified ad text..."
        disabled={disabled}
      />
      <p className={`text-xs mt-1 text-right ${value.length > MAX_CHARS ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
        {value.length} / {MAX_CHARS} characters
      </p>
    </CollapsibleSection>
  );
}