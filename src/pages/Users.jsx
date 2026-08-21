import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Plus, Trash2, Edit2, Mail, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.User.list('-created_date', 100),
      base44.entities.UserActivity.list('-timestamp', 50)
    ]).then(([userList, activityList]) => {
      setUsers(userList);
      setActivity(activityList);
      setLoading(false);
    });
  }, []);

  const handleInviteUser = async () => {
    if (!inviteEmail) return;
    try {
      await base44.functions.invoke('inviteUser', { email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      setInviteRole('user');
      setInviteOpen(false);
      const updatedUsers = await base44.entities.User.list('-created_date', 100);
      setUsers(updatedUsers);
    } catch (error) {
      alert('Failed to invite user: ' + error.message);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingUser) return;
    try {
      await base44.functions.invoke('updateUserRole', { targetEmail: editingUser.email, newRole: editingUser.newRole });
      setEditingUser(null);
      const updatedUsers = await base44.entities.User.list('-created_date', 100);
      setUsers(updatedUsers);
      const updatedActivity = await base44.entities.UserActivity.list('-timestamp', 50);
      setActivity(updatedActivity);
    } catch (error) {
      alert('Failed to update role: ' + error.message);
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`Delete user ${email}? This action cannot be undone.`)) return;
    try {
      // Note: Direct user deletion may not be available via SDK. Contact support if needed.
      alert('User deletion must be performed through the dashboard admin panel.');
    } catch (error) {
      alert('Failed to delete user: ' + error.message);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Management"
        subtitle="Invite employees, manage roles, and track team activity"
        actionLabel="Invite User"
        onAction={() => setInviteOpen(true)}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" /> Team Members ({users.length})
            </h2>
            {users.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users yet.</p>
            ) : (
              <div className="space-y-3">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        {u.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={u.role || 'user'} />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => setEditingUser({ ...u, newRole: u.role })}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Role</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">User: {u.email}</label>
                              <Select value={editingUser?.newRole || 'user'} onValueChange={val => setEditingUser({ ...u, newRole: val })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="employee">Employee</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                              <Button onClick={handleUpdateRole}>Save Role</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteUser(u.email)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activity.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No activity yet.</p>
            ) : (
              activity.slice(0, 15).map((log, i) => (
                <div key={i} className="text-sm border-l-2 border-muted pl-3 py-1">
                  <p className="font-medium text-foreground">{log.action}</p>
                  <p className="text-muted-foreground text-xs">{log.user_email}</p>
                  {log.description && <p className="text-muted-foreground text-xs">{log.description}</p>}
                  <p className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <Input type="email" placeholder="employee@company.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button onClick={handleInviteUser} disabled={!inviteEmail}>Send Invite</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}