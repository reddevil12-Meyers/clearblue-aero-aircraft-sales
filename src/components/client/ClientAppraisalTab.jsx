import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';

export default function ClientAppraisalTab({ clientId }) {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Appraisal.filter({ client_id: clientId })
      .then(setAppraisals).finally(() => setLoading(false));
  }, [clientId]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{appraisals.length} appraisals for this client</p>
        <Link to="/appraisals/new">
          <Button size="sm" variant="outline" className="gap-2"><Plus className="w-4 h-4" />New Appraisal</Button>
        </Link>
      </div>
      {appraisals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No appraisals for this client yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {appraisals.map(ap => (
            <Link key={ap.id} to={`/appraisals/${ap.id}`} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-medium">{ap.aircraft_summary || ap.appraisal_number || 'Appraisal'}</p>
                <p className="text-sm text-muted-foreground">{ap.appraisal_type} · {ap.appraisal_date || '-'}</p>
              </div>
              <div className="flex items-center gap-4">
                {ap.market_value && <span className="text-sm font-semibold">${ap.market_value.toLocaleString()}</span>}
                <StatusBadge status={ap.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}