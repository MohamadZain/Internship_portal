import { Link } from 'react-router-dom';
import { Building2, Briefcase, FileText, Users, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';
import StatCard from '@/components/StatCard';
import Loading from '@/components/Loading';
import StatusBadge from '@/components/StatusBadge';

export default function AdminDashboard() {
  const { data: startups, loading: ls } = useEntityList('Startup', { sort: '-created_date' });
  const { data: internships, loading: li } = useEntityList('Internship', { sort: '-created_date' });
  const { data: applications, loading: la } = useEntityList('Application', { sort: '-created_date' });

  const approvedStartups = startups?.filter(s => s.status === 'approved') || [];
  const pendingInternships = internships?.filter(i => i.status === 'pending_approval') || [];
  const pendingStartups = startups?.filter(s => s.status === 'pending') || [];
  const shortlistedApplications = applications?.filter(a => a.status === 'shortlisted') || [];

  return (
    <div className="space-y-7">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 p-6 text-white sm:p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> QSTP Program Administration
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Program Overview</h1>
            <p className="mt-2 max-w-md text-sm text-white/70">Manage startups, approve internships, and use Deema AI to shortlist top candidates.</p>
          </div>
          <Link to="/admin/applications" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-400">
            <Sparkles className="h-4 w-4" /> Analyze with Deema
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Approved Startups" value={ls ? '—' : approvedStartups.length} accent="emerald" sublabel={`${pendingStartups.length} pending review`} />
        <StatCard icon={Briefcase} label="Internships" value={li ? '—' : internships?.length || 0} accent="violet" sublabel={`${pendingInternships.length} awaiting approval`} />
        <StatCard icon={FileText} label="Applications" value={la ? '—' : applications?.length || 0} accent="blue" />
        <StatCard icon={Users} label="Shortlisted" value={shortlistedApplications.length} accent="amber" sublabel="Candidates published to startups" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending approvals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Pending Approvals</h2>
          </div>
          <div className="space-y-3">
            {pendingStartups.length === 0 && pendingInternships.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-white/50 p-8 text-center text-sm text-muted-foreground">
                Nothing pending right now.
              </div>
            ) : (
              <>
                {pendingStartups.slice(0, 3).map(s => (
                  <Link key={s.id} to="/admin/startups" className="block rounded-xl border border-border bg-white p-4 transition hover:border-violet-200 hover:shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-violet-600 font-semibold text-sm">{s.name?.[0]}</div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.industry}</p>
                        </div>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                  </Link>
                ))}
                {pendingInternships.slice(0, 3).map(i => (
                  <Link key={i.id} to="/admin/internship-approval" className="block rounded-xl border border-border bg-white p-4 transition hover:border-violet-200 hover:shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">{i.title}</p>
                        <p className="text-xs text-muted-foreground">{i.startup_name}</p>
                      </div>
                      <StatusBadge status={i.status} />
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { to: '/admin/startups', label: 'Manage Startups', icon: Building2, desc: 'Review & approve' },
              { to: '/admin/internship-approval', label: 'Approve Internships', icon: ShieldCheck, desc: 'Queue pending' },
              { to: '/admin/applications', label: 'View Applications', icon: FileText, desc: 'All applicants' },
              { to: '/admin/shortlists', label: 'View Shortlists', icon: Sparkles, desc: 'Deema AI' },
            ].map(a => (
              <Link key={a.label} to={a.to} className="group flex flex-col gap-2 rounded-2xl border border-border bg-white p-4 transition hover:border-violet-200 hover:shadow-md">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-violet-600"><a.icon className="h-4.5 w-4.5" /></div>
                <p className="font-semibold text-sm text-foreground">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
                <span className="mt-1 flex items-center gap-1 text-xs font-medium text-violet-600 opacity-0 transition group-hover:opacity-100">Open <ArrowRight className="h-3 w-3" /></span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}