import { Link } from 'react-router-dom';
import { Briefcase, Users, FileText, Plus, Eye, Clock } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import Loading from '@/components/Loading';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';

export default function StartupDashboard() {
  const { data: internships, loading } = useEntityList('Internship', { sort: '-created_date' });
  const { data: shortlists } = useEntityList('Shortlist', { sort: '-created_date' });

  const published = internships?.filter(i => i.status === 'published') || [];
  const pending = internships?.filter(i => i.status === 'pending_approval') || [];
  const totalApps = internships?.length || 0;

  return (
    <div className="space-y-7">
      <PageHeader
        title="Startup Dashboard"
        description="Manage your internship postings and review candidates shortlisted by QSTP."
      >
        <Link to="/startup/create-internship" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700">
          <Plus className="h-4 w-4" /> Create Internship
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="Total Internships" value={loading ? '—' : totalApps} accent="violet" />
        <StatCard icon={Eye} label="Published" value={loading ? '—' : published.length} accent="emerald" sublabel="Visible to students" />
        <StatCard icon={Clock} label="Pending Approval" value={loading ? '—' : pending.length} accent="amber" sublabel="Awaiting QSTP review" />
        <StatCard icon={Users} label="Shortlisted Candidates" value={shortlists?.length || 0} accent="blue" sublabel="Ready to review" />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">My Internships</h2>
        {loading ? <Loading /> : internships?.length === 0 ? (
          <EmptyState icon={Briefcase} title="No internships yet" description="Create your first internship posting to start receiving applications.">
            <Link to="/startup/create-internship" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
              <Plus className="h-4 w-4" /> Create Internship
            </Link>
          </EmptyState>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Title</th>
                  <th className="px-5 py-3 font-semibold">Duration</th>
                  <th className="px-5 py-3 font-semibold">Deadline</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {internships.map(i => (
                  <tr key={i.id} className="transition hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground">{i.title}</p>
                      <p className="text-xs text-muted-foreground">{i.startup_name}</p>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{i.duration || '—'}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{i.deadline ? new Date(i.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={i.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}