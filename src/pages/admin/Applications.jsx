import { useState, useMemo } from 'react';
import { FileText, Search, ExternalLink, Linkedin, Github, Globe, Briefcase, ChevronDown } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';

export default function AdminApplications() {
  const { data, loading } = useEntityList('Application', { sort: '-created_date' });
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [internshipFilter, setInternshipFilter] = useState('all');

  const internshipTitles = useMemo(() => {
    const set = new Set();
    (data || []).forEach(a => { if (a.internship_title) set.add(a.internship_title); });
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    return (data || []).filter(a => {
      const mq = !query || a.student_name?.toLowerCase().includes(query.toLowerCase()) || a.internship_title?.toLowerCase().includes(query.toLowerCase()) || a.startup_name?.toLowerCase().includes(query.toLowerCase());
      const mf = filter === 'all' || a.status === filter;
      const mi = internshipFilter === 'all' || a.internship_title === internshipFilter;
      return mq && mf && mi;
    });
  }, [data, query, filter, internshipFilter]);

  return (
    <div className="space-y-6">
      <PageHeader title="Applications" description="View every application across the platform. Search and filter by status or applicant." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by applicant, internship, or startup…" className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20" />
        </div>
        <div className="relative sm:w-64">
          <Briefcase className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select value={internshipFilter} onChange={e => setInternshipFilter(e.target.value)} className="w-full appearance-none rounded-xl border border-border bg-white py-2.5 pl-10 pr-9 text-sm shadow-sm outline-none transition focus:border-violet-400">
            <option value="all">All internships</option>
            {internshipTitles.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['all', 'applied', 'under_review', 'shortlisted', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filter === f ? 'bg-violet-600 text-white' : 'bg-white text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted'}`}>{f.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No applications found" description="Applications will appear here once students start applying." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Applicant</th>
                  <th className="px-5 py-3 font-semibold">Internship</th>
                  <th className="px-5 py-3 font-semibold">Startup</th>
                  <th className="px-5 py-3 font-semibold">Links</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(a => (
                  <tr key={a.id} className="transition hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground">{a.student_name}</p>
                      <p className="text-xs text-muted-foreground">{a.student_email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-foreground">{a.internship_title}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{a.startup_name}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {a.resume_url && <a href={a.resume_url} target="_blank" rel="noreferrer" className="hover:text-violet-600" title="Resume"><ExternalLink className="h-4 w-4" /></a>}
                        {a.linkedin && <a href={a.linkedin} target="_blank" rel="noreferrer" className="hover:text-violet-600" title="LinkedIn"><Linkedin className="h-4 w-4" /></a>}
                        {a.github && <a href={a.github} target="_blank" rel="noreferrer" className="hover:text-violet-600" title="GitHub"><Github className="h-4 w-4" /></a>}
                        {a.portfolio && <a href={a.portfolio} target="_blank" rel="noreferrer" className="hover:text-violet-600" title="Portfolio"><Globe className="h-4 w-4" /></a>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}