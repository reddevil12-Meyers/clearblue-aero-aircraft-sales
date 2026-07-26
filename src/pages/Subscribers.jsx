import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, Search, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import moment from "moment";

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await base44.entities.NewsletterSubscriber.list('-created_date');
      setSubscribers(data);
    } catch (e) {
      console.error('Failed to load subscribers:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (sub) => {
    await base44.entities.NewsletterSubscriber.update(sub.id, { subscribed: !sub.subscribed });
    setSubscribers(prev => prev.map(s => s.id === sub.id ? { ...s, subscribed: !s.subscribed } : s));
  };

  const handleDelete = async (sub) => {
    if (!window.confirm(`Remove ${sub.email} from alert subscribers?`)) return;
    await base44.entities.NewsletterSubscriber.delete(sub.id);
    setSubscribers(prev => prev.filter(s => s.id !== sub.id));
  };

  const filtered = subscribers.filter(s => {
    const q = search.toLowerCase();
    return !q || (s.email || '').toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q);
  });

  const activeCount = subscribers.filter(s => s.subscribed).length;

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-center h-64 flex-col gap-4">
        <p className="text-sm text-muted-foreground">Unable to load subscribers.</p>
        <Button onClick={load} variant="outline">Retry</Button>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold">Alert Subscribers</h1>
            <p className="text-sm text-muted-foreground">{activeCount} active · {subscribers.length} total</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8 text-muted-foreground" />}
          title="No subscribers yet"
          description="Alert signups from the public website will appear here."
        />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Subscribed</th>
                <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Signed Up</th>
                <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {s.name || <span className="text-muted-foreground italic">Not provided</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{s.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.subscribed ? 'Active' : 'Inactive'} />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {s.created_date ? moment(s.created_date).format('MMM D, YYYY') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => handleToggle(s)}>
                        {s.subscribed ? 'Unsubscribe' : 'Resubscribe'}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 text-destructive" onClick={() => handleDelete(s)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}