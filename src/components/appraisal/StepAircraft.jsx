import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TYPES = ["Desktop", "On-Site Inspection", "Pre-Purchase", "Insurance", "Estate/Tax", "Litigation Support", "Financing"];
const PURPOSES = ["Sale/Purchase", "Insurance", "Estate Planning", "Tax Reporting", "Financing", "Litigation", "Partnership Dissolution", "Donation", "Other"];
const MODES = ["Desktop", "Extended Desktop", "Full Appraisal"];

export default function StepAircraft({ form, update, aircraft, clients }) {
  const [acOpen, setAcOpen] = useState(false);
  const handleAircraftSelect = (id) => {
    const ac = aircraft.find(a => a.id === id);
    update('aircraft_id', id);
    update('aircraft_summary', ac ? `${ac.year} ${ac.make} ${ac.model} (${ac.registration})` : '');
    setAcOpen(false);
  };

  const handleClientSelect = (id) => {
    const cl = clients.find(c => c.id === id);
    update('client_id', id);
    update('client_name', cl ? `${cl.first_name} ${cl.last_name}` : '');
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Subject Aircraft</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1.5 lg:col-span-2">
            <Label className="text-xs text-muted-foreground">Aircraft *</Label>
            <Popover open={acOpen} onOpenChange={setAcOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  role="combobox"
                  aria-expanded={acOpen}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {form.aircraft_id
                    ? aircraft.find(a => a.id === form.aircraft_id)
                      ? `${aircraft.find(a => a.id === form.aircraft_id).year} ${aircraft.find(a => a.id === form.aircraft_id).make} ${aircraft.find(a => a.id === form.aircraft_id).model} (${aircraft.find(a => a.id === form.aircraft_id).registration})`
                      : form.aircraft_summary || 'Select aircraft...'
                    : 'Select aircraft...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search aircraft..." />
                  <CommandList>
                    <CommandEmpty>No aircraft found.</CommandEmpty>
                    <CommandGroup>
                      {aircraft.map(a => (
                        <CommandItem
                          key={a.id}
                          value={`${a.year} ${a.make} ${a.model} ${a.registration}`}
                          onSelect={() => handleAircraftSelect(a.id)}
                        >
                          <Check className={cn("mr-2 h-4 w-4", form.aircraft_id === a.id ? "opacity-100" : "opacity-0")} />
                          {a.year} {a.make} {a.model} ({a.registration})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5 lg:col-span-2">
            <Label className="text-xs text-muted-foreground">Client</Label>
            <Select value={form.client_id || ''} onValueChange={handleClientSelect}>
              <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Appraisal Setup</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Appraisal Mode *</Label>
            <Select value={form.appraisal_mode || ''} onValueChange={v => update('appraisal_mode', v)}>
              <SelectTrigger><SelectValue placeholder="Select mode..." /></SelectTrigger>
              <SelectContent>{MODES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Appraisal Type</Label>
            <Select value={form.appraisal_type || ''} onValueChange={v => update('appraisal_type', v)}>
              <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
              <SelectContent>{TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Purpose</Label>
            <Select value={form.purpose || ''} onValueChange={v => update('purpose', v)}>
              <SelectTrigger><SelectValue placeholder="Select purpose..." /></SelectTrigger>
              <SelectContent>{PURPOSES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Appraisal Number</Label>
            <Input value={form.appraisal_number || ''} onChange={e => update('appraisal_number', e.target.value)} placeholder="Auto-generated if blank" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Appraisal Date</Label>
            <Input type="date" value={form.appraisal_date || ''} onChange={e => update('appraisal_date', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Effective Date of Value</Label>
            <Input type="date" value={form.effective_date || ''} onChange={e => update('effective_date', e.target.value)} />
          </div>
        </div>
      </div>

      {form.aircraft_id && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
          <p className="text-sm font-medium text-accent-foreground">
            ✓ Subject aircraft selected: <strong>{form.aircraft_summary}</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Proceed to the Records tab to document logbook and compliance data.
          </p>
        </div>
      )}
    </div>
  );
}