import { cn } from "@/lib/utils";

const statusColors = {
  // Deal stages
  "Lead": "bg-slate-100 text-slate-700",
  "Qualification": "bg-blue-50 text-blue-700",
  "Showing": "bg-indigo-50 text-indigo-700",
  "Offer": "bg-violet-50 text-violet-700",
  "Negotiation": "bg-purple-50 text-purple-700",
  "Pre-Buy Inspection": "bg-amber-50 text-amber-700",
  "Escrow": "bg-orange-50 text-orange-700",
  "Closing": "bg-cyan-50 text-cyan-700",
  "Closed Won": "bg-green-50 text-green-700",
  "Closed Lost": "bg-red-50 text-red-700",
  // Appraisal statuses
  "Draft": "bg-slate-100 text-slate-600",
  "In Progress": "bg-blue-50 text-blue-700",
  "Review": "bg-amber-50 text-amber-700",
  "Final": "bg-green-50 text-green-700",
  "Delivered": "bg-emerald-50 text-emerald-700",
  // Aircraft statuses
  "Available": "bg-green-50 text-green-700",
  "Under Contract": "bg-amber-50 text-amber-700",
  "Sold": "bg-slate-100 text-slate-500",
  "Off Market": "bg-red-50 text-red-600",
  "Appraisal Only": "bg-blue-50 text-blue-700",
  // Client statuses
  "Active": "bg-green-50 text-green-700",
  "Prospect": "bg-blue-50 text-blue-700",
  "Inactive": "bg-slate-100 text-slate-500",
  "Closed": "bg-slate-100 text-slate-500",
  // Priority
  "Low": "bg-slate-100 text-slate-600",
  "Medium": "bg-blue-50 text-blue-700",
  "High": "bg-orange-50 text-orange-700",
  "Urgent": "bg-red-50 text-red-700",
  // Payment
  "Pending": "bg-amber-50 text-amber-700",
  "Invoiced": "bg-blue-50 text-blue-700",
  "Paid": "bg-green-50 text-green-700",
  // Client type
  "Buyer": "bg-blue-50 text-blue-700",
  "Seller": "bg-purple-50 text-purple-700",
  "Both": "bg-indigo-50 text-indigo-700",
  "Appraiser Client": "bg-amber-50 text-amber-700",
};

export default function StatusBadge({ status, className }) {
  if (!status) return null;
  const colors = statusColors[status] || "bg-slate-100 text-slate-600";
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      colors,
      className
    )}>
      {status}
    </span>
  );
}