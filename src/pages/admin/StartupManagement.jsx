import { useState, useMemo } from 'react';
import { Building2, Search, Check, X, Loader2, MapPin, Briefcase, FileText, Users, Eye } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';
import { db } from '@/api/base44Client';

import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/ui/use-toast';

export default function StartupManagement() {
  const { data, loading, reload } = useEntityList('Startup', { sort: '-created_date' });
  const { data: internships } = useEntityList('Internship', { sort: '-created_date' });
  const { data: applications } = useEntityList('Application', { sort: '-created_date' });
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [expandedDashboard, setExpandedDashboard] = useState({});

  const filtered = useMemo(() => {
    return (data || []).filter(s => {
      const mq = !query || s.name?.toLowerCase().includes(query.toLowerCase()) || s.industry?.toLowerCase().includes(query.toLowerCase());
      const mf = filter === 'all' || s.status === filter;
      return mq && mf;
    });
  }, [data, query, filter]);

  const startupStats = useMemo(() => {
    const startupList = data || [];
    const internshipList = internships || [];
    const applicationList = applications || [];

    const map = {};
    startupList.forEach((startup) => {
      const startupName = (startup.name || '').trim().toLowerCase();
      const internshipItems = internshipList.filter((internship) => {
        if (startup.id && internship.startup_id && internship.startup_id === startup.id) return true;
        return startupName && (internship.startup_name || '').trim().toLowerCase() === startupName;
      });

      const applicationItems = applicationList.filter((application) => {
        if (startup.id && application.startup_id && application.startup_id === startup.id) return true;
        if (startupName && (application.startup_name || '').trim().toLowerCase() === startupName) return true;
        return internshipItems.some((internship) => internship.id === application.internship_id);
      });

      map[startup.id] = {
        internships: internshipItems,
        applications: applicationItems,
      };
    });

    return map;
  }, [data, internships, applications]);

  const summary = useMemo(() => {
    const startupList = data || [];
    const internshipList = internships || [];
    const applicationList = applications || [];

    return {
      totalCompanies: startupList.length,
      activeInternships: internshipList.filter((internship) => ['published', 'pending_approval'].includes(internship.status)).length,
      totalApplications: applicationList.length,
    };
  }, [data, internships, applications]);

  const setStatus = async (id, status, label) => {
    setBusy(id);
    try {
      await db.entities.Startup.update(id, { status });
      toast({ title: `Startup ${label}` });
      reload();
    } catch {
      toast({ title: 'Action failed', variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const toggleReadMore = (startupId) => {
    setExpandedDescriptions((prev) => ({ ...prev, [startupId]: !prev[startupId] }));
  };

  const toggleDashboard = (startupId) => {
    setExpandedDashboard((prev) => ({ ...prev, [startupId]: !prev[startupId] }));
  };

  const renderDescription = (startup) => {
    const text = startup.description || startup.about || 'No description provided.';
    const isExpanded = expandedDescriptions[startup.id];
    if (text.length <= 180) return <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>;

    return (
      <div className="space-y-1">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isExpanded ? text : `${text.slice(0, 180)}...`}
        </p>
        <button onClick={() => toggleReadMore(startup.id)} className="text-xs font-medium text-violet-600 hover:text-violet-700">
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Startup Management" description="Monitor company activity, applications, and startup profiles in one place." />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Companies</p>
          <div className="mt-2 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-violet-600" />
            <p className="text-2xl font-bold text-foreground">{summary.totalCompanies}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Internship Positions</p>
          <div className="mt-2 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-emerald-600" />
            <p className="text-2xl font-bold text-foreground">{summary.activeInternships}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Applications</p>
          <div className="mt-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <p className="text-2xl font-bold text-foreground">{summary.totalApplications}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search startups…" className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20" />
        </div>
        <div className="flex gap-1.5">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filter === f ? 'bg-violet-600 text-white' : 'bg-white text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted'}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No startups found" description="Try changing your search or filter." />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filtered.map(s => (
            <div key={s.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">{s.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{s.location || s.city || 'Location not provided'}</span>
                  </div>
                </div>
                <StatusBadge status={s.status || 'pending'} />
              </div>

              <div className="mt-3">{renderDescription(s)}</div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Internships</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{startupStats[s.id]?.internships?.length || 0}</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Applications</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{startupStats[s.id]?.applications?.length || 0}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => toggleDashboard(s.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700">
                  <Eye className="h-3.5 w-3.5" /> {expandedDashboard[s.id] ? 'Hide Dashboard' : 'View Dashboard'}
                </button>
                <button onClick={() => setStatus(s.id, 'approved', 'approved')} disabled={busy === s.id} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                  {busy === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve
                </button>
                <button onClick={() => setStatus(s.id, 'rejected', 'rejected')} disabled={busy === s.id} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-200 hover:bg-rose-50 disabled:opacity-60">
                  <X className="h-3.5 w-3.5" /> Reject
                </button>
              </div>

              {expandedDashboard[s.id] ? (
                <div className="mt-4 space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-sm font-semibold text-foreground">Startup Dashboard</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-lg bg-white p-3 ring-1 ring-inset ring-border">
                      <p className="text-xs font-medium text-muted-foreground">Pending Approval Internships</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {(startupStats[s.id]?.internships || []).filter((internship) => internship.status === 'pending_approval').length}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white p-3 ring-1 ring-inset ring-border">
                      <p className="text-xs font-medium text-muted-foreground">Shortlisted Applications</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {(startupStats[s.id]?.applications || []).filter((application) => application.status === 'shortlisted').length}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Latest internships</p>
                    {(startupStats[s.id]?.internships || []).slice(0, 3).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No internships posted yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {(startupStats[s.id]?.internships || []).slice(0, 3).map((internship) => (
                          <div key={internship.id} className="flex items-center justify-between rounded-lg bg-white p-2.5 ring-1 ring-inset ring-border">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">{internship.title}</p>
                              <p className="text-xs text-muted-foreground">{internship.duration || 'Duration not specified'}</p>
                            </div>
                            <StatusBadge status={internship.status || 'draft'} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
