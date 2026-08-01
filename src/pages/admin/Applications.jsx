import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, ExternalLink, Linkedin, Github, Globe, Briefcase, ChevronDown, Eye, Download } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/components/ui/use-toast';

export default function AdminApplications() {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllResumes = () => {
    const resumeRows = (filtered || [])
      .filter((application) => application.resume_url)
      .map((application) => `${application.student_name || 'Unknown'},${application.student_email || ''},${application.resume_url}`);

    if (resumeRows.length === 0) {
      toast({ title: 'No resumes available to download', variant: 'destructive' });
      return;
    }

    const content = ['Student Name,Email,Resume URL', ...resumeRows].join('\n');
    downloadFile(content, 'applicant-resumes.csv', 'text/csv;charset=utf-8;');
    toast({ title: 'Resume export downloaded' });
  };

  const handleExportApplicationsCsv = () => {
    const rows = (filtered || []).map((application) => [
      application.student_name || '',
      application.student_email || '',
      application.student_university || '',
      application.student_major || '',
      application.internship_title || '',
      application.startup_name || '',
      application.status || '',
    ]);

    if (rows.length === 0) {
      toast({ title: 'No applications to export', variant: 'destructive' });
      return;
    }

    const escapeCell = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [
      ['Student Name', 'Email', 'University', 'Degree', 'Internship', 'Startup', 'Status'].map(escapeCell).join(','),
      ...rows.map((row) => row.map(escapeCell).join(',')),
    ].join('\n');

    downloadFile(csv, 'applications.csv', 'text/csv;charset=utf-8;');
    toast({ title: 'Applications CSV exported successfully' });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Applications" description="View every application across the platform. Search and filter by status or applicant.">
        <button onClick={handleDownloadAllResumes} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-violet-700">
          <Download className="h-3.5 w-3.5" /> Download All Applicant Resumes
        </button>
        <button onClick={handleExportApplicationsCsv} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted">
          <FileText className="h-3.5 w-3.5" /> Export Applications CSV
        </button>
      </PageHeader>

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
                  <th className="px-5 py-3 font-semibold">AI Usage</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(a => (
                  <tr key={a.id} className="cursor-pointer transition hover:bg-muted/30" onClick={() => navigate(`/admin/applications/${a.id}`)}>
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
                    <td className="px-5 py-3.5">
                      {typeof a.coverLetterAIScore === 'number' ? (
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          a.coverLetterAIScore < 50 
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
                            : 'bg-rose-50 text-rose-700 ring-rose-600/20'
                        }`}>
                          {a.coverLetterAIScore}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/applications/${a.id}`);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
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