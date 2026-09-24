import { useState, useEffect } from 'react';
import { supabase } from '@/api/base44Client';
import { Plus, CheckCircle2, Circle, Clock, Phone, Mail, Users, MessageSquare, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/StatusBadge';

const TYPES = ["Call", "Email", "Meeting", "Note", "Showing", "Follow-up", "Task", "Other"];
const PRIORITIES = ["Low", "Normal", "High", "Urgent"];
const STATUSES = ["Open", "In Progress", "Completed", "Cancelled"];

const TYPE_ICONS = {
  Call: Phone, Email: Mail, Meeting: Users, Note: MessageSquare,
  Showing: Calendar, 'Follow-up': Clock, Task: CheckCircle2, Other: FileText
};

const PRIORITY_COLORS = {
  Low: 'text-slate-500', Normal: 'text-blue-600', High: 'text-orange-600', Urgent: 'text-red-600'
};

function ActivityForm({ clientId, clientName, onSave, onCancel, users }) {
  const [form, setForm] = useState({
    type: 'Call', subject: '', description: '', status: 'Open', priority: 'Normal',
    due_date: '', assigned_to: '', assigned_to_name: '', outcome: '',
    client_id: clientId, client_name: clientName,
    date: new Date().toISOString()
  });
  const [saving, setSaving] = useState(false);

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleUserSelect = (email) => {
    const user = users.find(u => u.email === email);
    update('assigned_to', email);
    update('assigned_to_name', user ? user.full_name : email);
  };

  const save = async () => {
    if (!form.subject) return;
    setSaving(true);
    await supabase.from('activities').insert([form]);
    onSave();
    setSaving(false);
  };

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Type</Label>
          <Select value={form.type} onValueChange={v => update('type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Priority</Label>
          <Select value={form.priority} onValueChange={v => update('priority', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1 col-span-2">
          <Label className="text-xs text-muted-foreground">Subject *</Label>
          <Input value={form.subject} onChange={e => update('subject', e.target.value)} placeholder="e.g. Initial discovery call" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={form.status} onValueChange={v => update('status', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Due Date</Label>
          <Input type="datetime-local" value={form.due_date ? form.due_date.slice(0,16) : ''} onChange={e => update('due_date', e.target.value ? new Date(e.target.value).toISOString() : '')} />
        </div>
        <div className="space-y-1 col-span-2">
          <Label className="text-xs text-muted-foreground">Assign To</Label>
          <Select value={form.assigned_to} onValueChange={handleUserSelect}>
            <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Unassigned</SelectItem>
              {users.map(u => <SelectItem key={u.email} value={u.email}>{u.full_name} ({u.email})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 col-span-2">
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2} placeholder="Details..." />
        </div>
        <div className="space-y-1 col-span-2">
          <Label className="text-xs text-muted-foreground">Outcome / Result</Label>
          <Textarea value={form.outcome} onChange={e => update('outcome', e.target.value)} rows={2} placeholder="What was the result?" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving || !form.subject}>{saving ? 'Saving...' : 'Log Activity'}</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function ActivityCard({ activity, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = TYPE_ICONS[activity.type] || FileText;
  const isOverdue = activity.due_date && !activity.completed && new Date(activity.due_date) < new Date();

  return (
    <div className={`border rounded-lg bg-card overflow-hidden ${activity.completed ? 'opacity-60' : ''} ${isOverdue ? 'border-red-300' : 'border-border'}`}>
      <div className="flex items-center gap-3 p-3">
        <button onClick={() => onToggle(activity)} className="shrink-0">
          {activity.completed
            ? <CheckCircle2 className="w-5 h-5 text-green-500" />
            : <Circle className="w-5 h-5 text-muted-foreground hover:text-green-500 transition-colors" />
          }
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">{activity.type}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm truncate ${activity.completed ? 'line-through' : ''}`}>{activity.subject}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
            {activity.assigned_to_name && <span>→ {activity.assigned_to_name}</span>}
            {activity.due_date && (
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                Due: {new Date(activity.due_date).toLocaleDateString()}
              </span>
            )}
            <span>{new Date(activity.date || activity.created_date).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-medium ${PRIORITY_COLORS[activity.priority] || ''}`}>{activity.priority}</span>
          <StatusBadge status={activity.status} />
          <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-muted rounded">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {expanded && (activity.description || activity.outcome) && (
        <div className="px-10 pb-3 space-y-2 border-t border-border pt-2">
          {activity.description && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Notes</p>
              <p className="text-sm">{activity.description}</p>
            </div>
          )}
          {activity.outcome && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Outcome</p>
              <p className="text-sm text-green-700">{activity.outcome}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClientActivityTab({ clientId, clientName }) {
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = () => supabase.from('activities').select('*').eq('client_id', clientId).order('date', { ascending: false })
    .then(({ data }) => setActivities(data || [])).finally(() => setLoading(false));

  useEffect(() => {
    load();
    supabase.from('user_profiles').select('*').then(({ data }) => setUsers(data || [])).catch(() => {});
  }, [clientId]);

  const handleToggle = async (activity) => {
    const completed = !activity.completed;
    await supabase.from('activities').update({ completed, status: completed ? 'Completed' : 'Open' }).eq('id', activity.id);
    load();
  };

  const filtered = filter === 'all' ? activities
    : filter === 'open' ? activities.filter(a => !a.completed)
    : activities.filter(a => a.completed);

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {['all', 'open', 'done'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${filter === f ? 'bg-white shadow font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
              {f}
            </button>
          ))}
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />Log Activity
        </Button>
      </div>

      {showForm && (
        <ActivityForm
          clientId={clientId}
          clientName={clientName}
          users={users}
          onSave={() => { setShowForm(false); load(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No activities logged yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => (
            <ActivityCard key={a.id} activity={a} onToggle={handleToggle} />
          ))}
        </div>
      )}
    </div>
  );
}