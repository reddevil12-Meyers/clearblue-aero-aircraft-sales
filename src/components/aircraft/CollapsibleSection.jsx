import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function CollapsibleSection({ value, title, headerAction, children }) {
  return (
    <AccordionItem value={value} className="bg-card rounded-xl border border-border overflow-hidden">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <span className="flex-1 text-left text-sm font-semibold text-foreground uppercase tracking-wider">{title}</span>
        {headerAction && (
          <span
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2"
          >
            {headerAction}
          </span>
        )}
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-4">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}