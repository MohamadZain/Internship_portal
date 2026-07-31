import { Users, FileText, Sparkles, ExternalLink } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';

export default function ShortlistedCandidates() {
  const { data, loading } = useEntityList('Shortlist', { sort: '-created_date' });

  return (
    <div className="space-y-6">
      <PageHeader title="Shortlisted Candidates" description="Candidates shortlisted by QSTP using Deema AI for your internships." />

      {loading ? <Loading /> : data.length === 0 ? (
        <EmptyState icon={Users} title="No shortlisted candidates yet" description="When QSTP publishes a shortlist for your internship, candidates will appear here with their AI summary." />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {data.map(s => (
            <div key={s.id} className="flex flex-col rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">
                  {s.candidate_name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">{s.candidate_name}</h3>
                  <p className="text-xs text-muted-foreground">{s.internship_title}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-violet-50/50 p-4 ring-1 ring-inset ring-violet-600/10">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700">
                  <Sparkles className="h-3.5 w-3.5" /> AI Summary
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">{s.ai_summary}</p>
              </div>

              {s.resume_url && (
                <a href={s.resume_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700">
                  <ExternalLink className="h-4 w-4" /> View Resume
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}