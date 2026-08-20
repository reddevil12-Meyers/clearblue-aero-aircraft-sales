import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import EmployeeQrCard from "@/components/employee/EmployeeQrCard";
import EmployeeLeadsDialog from "@/components/employee/EmployeeLeadsDialog";

const STATUS_STYLES = {
  Active: "bg-green-50 text-green-700",
  Inactive: "bg-gray-100 text-gray-500",
};

const generateCode = (first, last, existing) => {
  const base = (((first || "")[0] || "") + (last || ""))
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8) || "REP";
  let code = base;
  let n = 1;
  const set = new Set(existing);
  while (set.has(code)) {
    code = base + n;
    n += 1;
  }
  return code;
};

const emptyForm = { first_name: "", last_name: "", email: "", phone: "", title: "Sales Manager", status: "Active", notes: "" };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [leadsEmployee, setLeadsEmployee] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Employee.list("-created_date");
    setEmployees(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (e) => {
    setEditing(e);
    setForm({
      first_name: e.first_name || "", last_name: e.last_name || "", email: e.email || "",
      phone: e.phone || "", title: e.title || "Sales Manager", status: e.status || "Active", notes: e.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await base44.entities.Employee.update(editing.id, { ...form });
      } else {
        const code = generateCode(form.first_name, form.last_name, employees.map((e) => e.referral_code));
        await base44.entities.Employee.create({ ...form, referral_code: code, total_leads: 0, active_leads: 0, deals_closed: 0 });
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      alert("Failed to save: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e) => {
    if (window.confirm(`Delete ${e.first_name} ${e.last_name}? Tracked leads will remain but be unlinked.`)) {
      await base44.entities.Employee.delete(e.id);
      await load();
    }
  };

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return !q || `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) || (e.email || "").toLowerCase().includes(q) || (e.referral_code || "").toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold">Employee Tracking</h1>
            <p className="text-sm text-muted-foreground">{employees.length} employees · QR codes for business cards</p>
          </div>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Add Employee</Button>
      </div>

      <div className="mb-4">
        <Input placeholder="Search by name, email, or code..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Employee</th>
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Title</th>
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Referral Code</th>
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">QR Code</th>
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Leads</th>
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{e.first_name} {e.last_name}</p>
                  <p className="text-xs text-muted-foreground">{e.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{e.title || "Sales Manager"}</td>
                <td className="px-4 py-3"><code className="text-sm font-bold text-accent bg-accent/5 px-2 py-1 rounded">{e.referral_code}</code></td>
                <td className="px-4 py-3"><EmployeeQrCard employee={e} /></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{e.total_leads || 0}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[e.status] || STATUS_STYLES.Active}`}>{e.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="ghost" className="gap-1.5 h-8" onClick={() => setLeadsEmployee(e)}><Eye className="w-3.5 h-3.5" /> Leads</Button>
                    <Button size="sm" variant="ghost" className="gap-1.5 h-8" onClick={() => openEdit(e)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="gap-1.5 h-8 text-destructive" onClick={() => handleDelete(e)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>First Name *</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Last Name *</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          {!editing && <p className="text-xs text-muted-foreground">A unique referral code is generated automatically for the QR code.</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.first_name || !form.last_name}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <EmployeeLeadsDialog employee={leadsEmployee} open={!!leadsEmployee} onOpenChange={(o) => { if (!o) setLeadsEmployee(null); }} />
    </div>
  );
}