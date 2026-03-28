export default function FormatCurrency({ value }) {
  if (value == null || value === '') return <span className="text-muted-foreground">—</span>;
  return (
    <span>
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)}
    </span>
  );
}

export function formatCurrency(value) {
  if (value == null || value === '') return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}