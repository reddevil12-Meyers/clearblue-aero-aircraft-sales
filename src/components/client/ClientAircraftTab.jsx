import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plane, Plus, X, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/StatusBadge';

export default function ClientAircraftTab({ clientId }) {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [allAircraft, setAllAircraft] = useState([]);
  const [selectedAircraftId, setSelectedAircraftId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([
      base44.entities.Aircraft.filter({ seller_id: clientId }),
      base44.entities.Aircraft.list('-created_date', 500)
    ]).then(([linked, all]) => {
      setAircraft(linked);
      const linkedIds = new Set(linked.map(a => a.id));
      setAllAircraft(all.filter(a => !linkedIds.has(a.id)));
      setLoading(false);
    });
  }, [clientId]);

  const handleLinkAircraft = async () => {
    if (!selectedAircraftId) return;
    const aircraft_to_link = allAircraft.find(a => a.id === selectedAircraftId);
    await base44.entities.Aircraft.update(selectedAircraftId, { seller_id: clientId });
    setAircraft([...aircraft, aircraft_to_link]);
    setAllAircraft(allAircraft.filter(a => a.id !== selectedAircraftId));
    setSelectedAircraftId('');
    setShowLinkDialog(false);
  };

  const handleUnlinkAircraft = async (aircraftId) => {
    if (!window.confirm('Unlink this aircraft from the client?')) return;
    await base44.entities.Aircraft.update(aircraftId, { seller_id: null });
    const unlinked = aircraft.find(a => a.id === aircraftId);
    setAircraft(aircraft.filter(a => a.id !== aircraftId));
    setAllAircraft([...allAircraft, unlinked]);
  };

  const filteredAvailable = allAircraft.filter(a => {
    const text = `${a.year} ${a.make} ${a.model} ${a.registration}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{aircraft.length} aircraft linked as owner</p>
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2"><Plus className="w-4 h-4" />Link Aircraft</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Aircraft to Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Search aircraft..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              {filteredAvailable.length > 0 ? (
                <Select value={selectedAircraftId} onValueChange={setSelectedAircraftId}>
                  <SelectTrigger><SelectValue placeholder="Select aircraft..." /></SelectTrigger>
                  <SelectContent>
                    {filteredAvailable.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.year} {a.make} {a.model} ({a.registration})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No unlinked aircraft available</p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
                <Button onClick={handleLinkAircraft} disabled={!selectedAircraftId}>Link Aircraft</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {aircraft.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Plane className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No aircraft linked to this client yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {aircraft.map(ac => (
            <div key={ac.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <Link to={`/aircraft/${ac.id}`} className="flex items-center gap-3 flex-1">
                <Plane className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{ac.year} {ac.make} {ac.model}</p>
                  <p className="text-sm text-muted-foreground">{ac.registration} · {ac.location || '—'}</p>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                {ac.asking_price && <span className="text-sm font-semibold">${ac.asking_price.toLocaleString()}</span>}
                <StatusBadge status={ac.status} />
                <button onClick={() => handleUnlinkAircraft(ac.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Unlink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}