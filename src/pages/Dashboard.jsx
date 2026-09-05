import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plane, Users, FileText, Handshake, ArrowRight, Clock, Target } from "lucide-react";
import StatsCard from "../components/StatsCard";
import StatusBadge from "../components/StatusBadge";
import { formatCurrency } from "../components/FormatCurrency";
import moment from "moment";

export default function Dashboard() {
  const [aircraft, setAircraft] = useState([]);
  const [clients, setClients] = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Aircraft.list('-created_date', 1000),
      base44.entities.Client.list('-created_date', 50),
      base44.entities.Appraisal.list('-created_date', 50),
      base44.entities.Deal.list('-created_date', 50),
      base44.entities.Activity.list('-created_date', 10),
    ]).then(([a, c, ap, d, act]) => {
      setAircraft(a);
      setClients(c);
      setAppraisals(ap);
      setDeals(d);
      setActivities(act);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const activeDeals = deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage));
  const pipelineValue = activeDeals.reduce((s, d) => s + (d.asking_price || 0), 0);
  const activeAppraisals = appraisals.filter(a => !['Final', 'Delivered'].includes(a.status));
  const availableAircraft = aircraft.filter(a => a.status === 'Available');
  const recentLeads = clients
    .filter(c => c.status === 'Prospect')
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const makeCounts = aircraft
    .filter(a => a.make)
    .reduce((acc, a) => { acc[a.make] = (acc[a.make] || 0) + 1; return acc; }, {});
  const makeList = Object.entries(makeCounts).sort((a, b) => b[1] - a[1]);
  const maxMakeCount = Math.max(1, ...makeList.map(m => m[1]));

  const leadSourceLabel = (c) => {
    const parts = [c.lead_source, c.lead_subsource].filter(Boolean);
    return parts.length ? parts.join(' - ') : '-';
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's your brokerage overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Aircraft" value={aircraft.length} subtitle={`${availableAircraft.length} available`} icon={Plane} />
        <StatsCard title="Clients" value={clients.filter(c => c.status === 'Active').length} subtitle={`${clients.length} total`} icon={Users} />
        <StatsCard title="Appraisals" value={activeAppraisals.length} subtitle="In progress" icon={FileText} />
        <StatsCard title="Pipeline" value={formatCurrency(pipelineValue)} subtitle={`${activeDeals.length} active deals`} icon={Handshake} />
      </div>

      {/* Listings by Make */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-sm flex items-center gap-2"><Plane className="w-4 h-4 text-accent" />Listings by Make</h2>
          <Link to="/aircraft" className="text-xs text-accent hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="px-5 py-4 space-y-2.5">
          {makeList.map(([make, count]) => (
            <div key={make} className="flex items-center gap-3">
              <span className="text-sm font-medium w-28 shrink-0 truncate">{make}</span>
              <div className="flex-1 h-5 bg-muted rounded-md overflow-hidden">
                <div
                  className="h-full bg-primary/80 rounded-md transition-all"
                  style={{ width: `${(count / maxMakeCount) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold w-8 text-right tabular-nums">{count}</span>
            </div>
          ))}
          {makeList.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No aircraft yet</p>
          )}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-sm flex items-center gap-2"><Target className="w-4 h-4 text-accent" />Recent Leads</h2>
          <Link to="/clients" className="text-xs text-accent hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentLeads.slice(0, 6).map(lead => (
            <Link key={lead.id} to={`/clients/${lead.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{lead.first_name} {lead.last_name}</p>
                <p className="text-xs text-muted-foreground truncate">{lead.email || lead.phone || 'No contact info'}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted-foreground hidden sm:inline">{leadSourceLabel(lead)}</span>
                <StatusBadge status={lead.client_type} />
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </Link>
          ))}
          {recentLeads.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No open leads yet</p>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Deals */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">Active Deals</h2>
            <Link to="/deals" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {activeDeals.slice(0, 5).map(deal => (
              <Link key={deal.id} to={`/deals/${deal.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{deal.title}</p>
                  <p className="text-xs text-muted-foreground">{deal.aircraft_summary || 'No aircraft'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{formatCurrency(deal.asking_price)}</span>
                  <StatusBadge status={deal.stage} />
                </div>
              </Link>
            ))}
            {activeDeals.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No active deals</p>
            )}
          </div>
        </div>

        {/* Recent Appraisals */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">Recent Appraisals</h2>
            <Link to="/appraisals" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {appraisals.slice(0, 5).map(ap => (
              <Link key={ap.id} to={`/appraisals/${ap.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{ap.aircraft_summary || ap.appraisal_number || 'Appraisal'}</p>
                  <p className="text-xs text-muted-foreground">{ap.appraisal_type} • {ap.client_name || 'No client'}</p>
                </div>
                <div className="flex items-center gap-3">
                  {ap.market_value && <span className="text-sm font-medium">{formatCurrency(ap.market_value)}</span>}
                  <StatusBadge status={ap.status} />
                </div>
              </Link>
            ))}
            {appraisals.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No appraisals yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-sm">Recent Activity</h2>
        </div>
        <div className="divide-y divide-border">
          {activities.slice(0, 8).map(act => {
            const link = act.deal_id ? `/deals/${act.deal_id}` : act.client_id ? `/clients/${act.client_id}` : act.aircraft_id ? `/aircraft/${act.aircraft_id}` : null;
            const content = (
              <>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{act.subject}</p>
                  <p className="text-xs text-muted-foreground truncate">{act.type} {act.client_name ? `• ${act.client_name}` : ''}</p>
                  {act.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{act.description}</p>}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{moment(act.created_date).fromNow()}</span>
              </>
            );
            return link ? (
              <Link key={act.id} to={link} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/50 transition-colors">
                {content}
              </Link>
            ) : (
              <div key={act.id} className="flex items-center gap-4 px-5 py-3">
                {content}
              </div>
            );
          })}
          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
}