import { Link } from 'react-router-dom';
import { Plus, Briefcase } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';

export default function StartupInternships() {
  const { data, loading } = useEntityList('Internship', { sort: '-created_date' });

  return (
    <div className="space-y-6">
      <PageHeader title="My Internships" description="Manage your internship postings and their approval status.">
        <Link to="/startup/create-internship" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700">
          <Plus className="h-4 w-4" /> Create Internship
        </Link>
      </PageHeader>

      {loading ? <Loading /> : data.length === 0 ? (
        <EmptyState icon={Briefcase} title="No internships yet" description="Create your first internship posting to start hiring.">
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
                <th className="px-5 py-3 font-semibold">Skills</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map(i => (
                <tr key={i.id} className="bg-white">
                  <td className="px-5 py-3 font-medium text-foreground">{i.title}</td>
                  <td className="px-5 py-3 text-muted-foreground">{i.duration || '—'}</td>
                  <td className="px-5 py-3 text-muted-foreground">{i.deadline ? new Date(i.deadline).toLocaleDateString() : '—'}</td>
                  <td className="px-5 py-3 text-muted-foreground">{i.skills_required?.join(', ') || '—'}</td>
                  <td className="px-5 py-3"><StatusBadge status={i.status || 'draft'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
