import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Search, ExternalLink, Linkedin, Github, Globe, Briefcase, ChevronDown, Eye, Download,
  Sparkles, GraduationCap, Building2, CalendarClock, X, ListChecks, ArrowRight,
} from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';
import { db } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/components/ui/use-toast';

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Fresh Graduate'];

const LOADING_MESSAGES = [
  'Analyzing resumes...',
  'Matching candidates...',
  'Generating AI summaries...',
  'Preparing shortlist...',
];

const SUMMARY_POOL = [
  'Strong match for the internship requirements. Demonstrated relevant technical experience through multiple academic and personal projects. Recommended for interview.',
  'Excellent academic background with relevant coursework and internship experience. Portfolio demonstrates strong hands-on skills.',
  'Shows strong problem-solving ability and technical fundamentals. Limited industry experience but high potential.',
  'Well-rounded candidate with a track record of shipping projects end-to-end and collaborating effectively in team settings.',
  'Solid technical foundation backed by coursework and self-driven projects. Would benefit from mentorship but ramps quickly.',
  'Highly motivated candidate whose project history aligns closely with the role. Clear, confident communicator in application materials.',
];

function FilterSelect({ icon: Icon, value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />}
      <select
        value={value}
        onChange={onChange}
        className={`w-full appearance-none rounded-xl border border-border bg-white py-2.5 ${Icon ? 'pl-10' : 'pl-4'} pr-9 text-sm shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20`}
      >
        <option value="all">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export default function AdminApplications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, loading } = useEntityList('Application', { sort: '-created_date' });
  const { data: shortlists, reload: reloadShortlists } = useEntityList('Shortlist', { sort: '-created_date' });

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [university, setUniversity] = useState('all');
  const [degree, setDegree] = useState('all');
  const [academicYear, setAcademicYear] = useState('all');
  const [startupFilter, setStartupFilter] = useState('all');
  const [internshipFilter, setInternshipFilter] = useState('all');

  const [topCount, setTopCount] = useState(5);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [duplicateDialog, setDuplicateDialog] = useState(null); // { existing }
  const [successBanner, setSuccessBanner] = useState(null); // { shortlistId, count }
  const intervalRef = useRef(null);

  useEffect(() => () => intervalRef.current && clearInterval(intervalRef.current), []);

  const universities = useMemo(() => {
    const set = new Set();
    (data || []).forEach(a => { if (a.student_university) set.add(a.student_university); });
    return Array.from(set).sort();
  }, [data]);

  const degrees = useMemo(() => {
    const set = new Set();
    (data || []).forEach(a => { if (a.student_major) set.add(a.student_major); });
    return Array.from(set).sort();
  }, [data]);

  const startups = useMemo(() => {
    const set = new Set();
    (data || []).forEach(a => { if (a.startup_name) set.add(a.startup_name); });
    return Array.from(set).sort();
  }, [data]);

  const internshipTitles = useMemo(() => {
    const set = new Set();
    (data || []).forEach(a => {
      if (!a.internship_title) return;
      if (startupFilter !== 'all' && a.startup_name !== startupFilter) return;
      set.add(a.internship_title);
    });
    return Array.from(set).sort();
  }, [data, startupFilter]);

  const filtered = useMemo(() => {
    return (data || []).filter(a => {
      const mq = !query || a.student_name?.toLowerCase().includes(query.toLowerCase()) || a.internship_title?.toLowerCase().includes(query.toLowerCase()) || a.startup_name?.toLowerCase().includes(query.toLowerCase());
      const ms = statusFilter === 'all' || a.status === statusFilter;
      const mu = university === 'all' || a.student_university === university;
      const md = degree === 'all' || a.student_major === degree;
      const may = academicYear === 'all' || a.student_academic_year === academicYear;
      const mst = startupFilter === 'all' || a.startup_name === startupFilter;
      const mi = internshipFilter === 'all' || a.internship_title === internshipFilter;
      return mq && ms && mu && md && may && mst && mi;
    });
  }, [data, query, statusFilter, university, degree, academicYear, startupFilter, internshipFilter]);

  const showDeemaAnalyze = startupFilter !== 'all' && internshipFilter !== 'all';

  const clearFilters = () => {
    setUniversity('all');
    setDegree('all');
    setAcademicYear('all');
    setStartupFilter('all');
    setInternshipFilter('all');
  };

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

  const hasActiveFilters = statusFilter !== 'all' || university !== 'all' || degree !== 'all' || academicYear !== 'all' || startupFilter !== 'all' || internshipFilter !== 'all' || Boolean(query);

  const handleDownloadFilteredApplications = () => {
    if (filtered.length === 0) {
      toast({ title: 'No applications match the current filters', variant: 'destructive' });
      return;
    }

    // Mock ZIP/CSV bulk download of the currently filtered applications only.
    const rows = filtered.map((application) => `${application.student_name || 'Unknown'},${application.student_email || ''},${application.resume_url || ''}`);
    const content = ['Student Name,Email,Resume URL', ...rows].join('\n');
    downloadFile(content, 'filtered-applications.zip', 'application/zip');
    toast({ title: 'Filtered applications downloaded', description: `${filtered.length} application(s) exported.` });
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

  const startLoadingAnimation = () => {
    setLoadingMsgIdx(0);
    intervalRef.current = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 650);
  };

  const stopLoadingAnimation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const runAnalysis = async ({ replaceId } = {}) => {
    const pool = filtered.filter(a => a.startup_name === startupFilter && a.internship_title === internshipFilter);
    if (pool.length === 0) {
      toast({ title: 'No applications match the selected filters.', variant: 'destructive' });
      return;
    }

    setAnalyzing(true);
    startLoadingAnimation();

    setTimeout(async () => {
      try {
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const chosen = shuffled.slice(0, Math.min(topCount, shuffled.length));
        const shuffledSummaries = [...SUMMARY_POOL].sort(() => Math.random() - 0.5);

        const candidates = chosen.map((application, idx) => ({
          application_id: application.id,
          candidate_name: application.student_name,
          student_university: application.student_university || '',
          student_major: application.student_major || '',
          resume_url: application.resume_url || '',
          ai_summary: shuffledSummaries[idx % shuffledSummaries.length],
          status: 'under_review',
        }));

        if (replaceId) {
          await db.entities.Shortlist.delete(replaceId);
        }

        await Promise.all(
          candidates.map((c) => db.entities.Application.update(c.application_id, { status: 'under_review' }))
        );

        const first = pool[0];
        const created = await db.entities.Shortlist.create({
          startup_id: first.startup_id,
          startup_name: first.startup_name,
          internship_id: first.internship_id,
          internship_title: first.internship_title,
          top_count: topCount,
          status: 'draft',
          candidates,
        });

        await reloadShortlists();
        setSuccessBanner({ shortlistId: created.id, count: candidates.length, internshipTitle: first.internship_title, startupName: first.startup_name });
      } catch {
        toast({ title: 'Failed to generate shortlist', variant: 'destructive' });
      } finally {
        stopLoadingAnimation();
        setAnalyzing(false);
      }
    }, 2500);
  };

  const handleAnalyzeClick = () => {
    const existing = (shortlists || []).find(
      s => s.startup_name === startupFilter && s.internship_title === internshipFilter
    );
    if (existing) {
      setDuplicateDialog({ existing });
      return;
    }
    runAnalysis();
  };

  const handleReanalyze = () => {
    const existingId = duplicateDialog?.existing?.id;
    setDuplicateDialog(null);
    runAnalysis({ replaceId: existingId });
  };

  const handleOpenExisting = () => {
    const existingId = duplicateDialog?.existing?.id;
    setDuplicateDialog(null);
    if (existingId) navigate(`/admin/shortlists/${existingId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Applications" description="View every application across the platform. Filter candidates and run Deema AI shortlisting.">
        {hasActiveFilters && (
          <button onClick={handleDownloadFilteredApplications} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-violet-700">
            <Download className="h-3.5 w-3.5" /> Download Filtered Applications
          </button>
        )}
        <button onClick={handleExportApplicationsCsv} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted">
          <FileText className="h-3.5 w-3.5" /> Export Applications CSV
        </button>
      </PageHeader>

      {/* New filters */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Filters</p>
          <button onClick={clearFilters} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-rose-500">
            <X className="h-3.5 w-3.5" /> Clear Filters
          </button>
        </div>
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FilterSelect icon={GraduationCap} value={university} onChange={e => setUniversity(e.target.value)} options={universities} placeholder="All universities" />
            <FilterSelect icon={GraduationCap} value={degree} onChange={e => setDegree(e.target.value)} options={degrees} placeholder="All degrees" />
            <FilterSelect icon={CalendarClock} value={academicYear} onChange={e => setAcademicYear(e.target.value)} options={ACADEMIC_YEARS} placeholder="All academic years" />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Internship</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FilterSelect icon={Building2} value={startupFilter} onChange={e => { setStartupFilter(e.target.value); setInternshipFilter('all'); }} options={startups} placeholder="All startups" />
            <FilterSelect icon={Briefcase} value={internshipFilter} onChange={e => setInternshipFilter(e.target.value)} options={internshipTitles} placeholder="All internships" />
          </div>
        </div>
      </div>

      {/* Deema Analyze */}
      {showDeemaAnalyze && (
        <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50/60 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-600/10 px-2.5 py-1 text-xs font-semibold text-violet-700">
                <Sparkles className="h-3.5 w-3.5" /> Deema AI
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{internshipFilter} — {startupFilter}</p>
              <p className="text-xs text-muted-foreground">
                {filtered.filter(a => a.startup_name === startupFilter && a.internship_title === internshipFilter).length} matching application(s) ready for analysis.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select value={topCount} onChange={e => setTopCount(Number(e.target.value))} className="w-full appearance-none rounded-xl border border-border bg-white py-2.5 pl-4 pr-9 text-sm font-medium outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20">
                  {[5, 10, 15].map(n => <option key={n} value={n}>Top {n}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <button onClick={handleAnalyzeClick} className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700">
                <Sparkles className="h-4 w-4" /> Analyze with Deema
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success banner */}
      {successBanner && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
              <ListChecks className="h-4.5 w-4.5" />
            </div>
            <p className="text-sm text-emerald-800">
              <span className="font-semibold">Shortlist generated</span> — {successBanner.count} candidate(s) for {successBanner.internshipTitle} at {successBanner.startupName}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/admin/shortlists/${successBanner.shortlistId}`)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
              View Shortlist <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setSuccessBanner(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by applicant, internship, or startup…" className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['all', 'applied', 'under_review', 'shortlisted', 'rejected'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${statusFilter === f ? 'bg-violet-600 text-white' : 'bg-white text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted'}`}>{f.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No applications found" description="Try adjusting your filters, or applications will appear here once students start applying." />
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

      {/* Duplicate analysis dialog */}
      {duplicateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDuplicateDialog(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-600/10">
              <ListChecks className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-foreground">A shortlist already exists for this internship.</h2>
            <p className="mt-1 text-sm text-muted-foreground">You can open the existing shortlist or re-analyze to replace it with a new one.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={handleOpenExisting} className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                Open Existing
              </button>
              <button onClick={handleReanalyze} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
                <Sparkles className="h-4 w-4" /> Re-analyze
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analyzing overlay */}
      {analyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative flex flex-col items-center rounded-3xl border border-border bg-white px-10 py-10 shadow-2xl">
            <div className="relative">
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30">
                <Sparkles className="h-7 w-7 text-white animate-pulse" />
              </div>
              <div className="absolute -inset-3 animate-ping rounded-3xl border-2 border-violet-400/30" />
            </div>
            <p className="mt-5 text-base font-bold text-foreground">Deema AI is analyzing candidates…</p>
            <p className="mt-1 text-sm text-muted-foreground">{LOADING_MESSAGES[loadingMsgIdx]}</p>
            <div className="mt-4 flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-2 w-2 animate-bounce rounded-full bg-violet-500" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
