import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CollapsibleSection from "@/components/aircraft/CollapsibleSection";

const MAX_CHARS = 600;

export default function OnlineListingDescription({ form, update, disabled = false }) {
  const [generating, setGenerating] = useState(false);
  const value = form.online_listing_description || "";

  const generate = async () => {
    setGenerating(true);
    try {
      const specs = [
        form.year && form.make && form.model ? `${form.year} ${form.make} ${form.model}` : null,
        form.registration ? `Registration: ${form.registration}` : null,
        form.total_time ? `Airframe Total Time: ${form.total_time} hrs` : null,
        form.engine_time_smoh ? `Engine Time: ${form.engine_time_smoh} hrs ${form.engine_time_type || 'SMOH'}` : null,
        form.engine_manufacturer || form.engine_model ? `Engine: ${[form.engine_manufacturer, form.engine_model].filter(Boolean).join(' ')}` : null,
        form.engine_type ? `Engine Type: ${form.engine_type}` : null,
        form.propeller_time ? `Propeller Total Time: ${form.propeller_time} hrs` : null,
        form.avionics_suite ? `Avionics: ${form.avionics_suite}` : null,
        form.avionics_details ? `Avionics Details: ${form.avionics_details}` : null,
        form.interior_condition ? `Interior: ${form.interior_condition}` : null,
        form.exterior_condition ? `Exterior: ${form.exterior_condition}` : null,
        form.paint_year ? `Paint Year: ${form.paint_year}` : null,
        form.interior_year ? `Interior Year: ${form.interior_year}` : null,
        form.adsb_compliant ? `ADS-B: Compliant` : null,
        form.damage_history ? `Damage History: ${form.damage_history}` : null,
        form.damage_history !== 'None' && form.damage_details ? `Damage Details: ${form.damage_details}` : null,
        form.annual_due ? `Annual Due: ${form.annual_due}` : null,
        form.factory_air_conditioning ? `Factory Air Conditioning: Yes` : null,
        form.useful_load ? `Useful Load: ${form.useful_load} lbs` : null,
        form.fuel_capacity ? `Fuel Capacity: ${form.fuel_capacity} gal` : null,
        form.asking_price ? `Asking Price: $${Number(form.asking_price).toLocaleString()}` : null,
        form.location ? `Location: ${form.location}` : null,
      ].filter(Boolean).join('\n');

      const result = await base44.functions.invoke('generateOnlineListingDescription', { specs });
      update('online_listing_description', result.data.description || '');
    } catch (error) {
      console.error('Online listing description error:', error);
      alert('Failed to generate the online listing description. Please try again.');
    } finally {
      setGenerating(false);
    }
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