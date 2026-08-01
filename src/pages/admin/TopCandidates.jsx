import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Check, Loader2, ChevronDown, ArrowLeft, Award } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';
import { db } from '@/api/base44Client';

import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/ui/use-toast';

export default function TopCandidates() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const candidates = location.state?.candidates || [];
  const matchingCriteria = location.state?.matchingCriteria || null;
  const { data: internships } = useEntityList('Internship', { sort: '-created_date' });
  const { data: applications } = useEntityList('Application', { sort: '-created_date' });
  const [selected, setSelected] = useState(new Set(candidates.map((_, i) => i)));
  const [selectedInternship, setSelectedInternship] = useState('');
  const [publishing, setPublishing] = useState(false);

  const publishedInternships = internships.filter(i => i.status === 'published' || i.status === 'pending_approval' || i.status === 'closed');

  const toggle = (idx) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === candidates.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(candidates.map((_, i) => i)));
    }
  };

  const handlePublish = async () => {
    if (!selectedInternship) {
      toast({ title: 'Choose an internship first.', variant: 'destructive' });
      return;
    }
    if (selected.size === 0) {
      toast({ title: 'Select at least one candidate.', variant: 'destructive' });
      return;
    }

    const internship = publishedInternships.find(i => i.id === selectedInternship);
    const selectedCandidates = candidates.filter((_, idx) => selected.has(idx));

    setPublishing(true);
    try {
      await Promise.all(
        selectedCandidates.map((candidate, idx) => {
          const application = (applications || []).find(
            (app) => app.internship_id === selectedInternship && app.student_name === candidate.name
          );

          return db.entities.Shortlist.create({
            internship_id: selectedInternship,
            internship_title: internship?.title || 'Internship',
            application_id: application?.id || '',
            candidate_name: candidate.name,
            ai_summary: Array.isArray(candidate.bullets) ? candidate.bullets.join(' ') : 'Recommended by Deema AI.',
            resume_url: application?.resume_url || '',
            rank: idx + 1,
            status: 'published',
          });
        })
      );

      toast({ title: 'Shortlist published successfully' });
      navigate('/admin/shortlists');
    } catch {
      toast({ title: 'Failed to publish shortlist', variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  };

  if (candidates.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Top Candidates" description="Publish AI-ranked candidates to the shortlist." />
        <EmptyState icon={Award} title="No analyzed candidates" description="Run candidate analysis first, then publish top candidates from this page." />
        <button onClick={() => navigate('/admin/analyze-candidates')} className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> Back to Analyze Candidates
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Top Candidates" description="Review and publish AI-ranked candidates to an internship shortlist." />
      {matchingCriteria ? (
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Matching Criteria</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {matchingCriteria.internshipType || 'Internship'} · {matchingCriteria.degreeType || 'Degree'} · {matchingCriteria.academicYear || 'Academic Year'}
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-foreground">Internship</label>
        <div className="relative max-w-xl">
          <select
            value={selectedInternship}
            onChange={e => setSelectedInternship(e.target.value)}
            className="w-full appearance-none rounded-xl border border-border bg-white py-2.5 pl-4 pr-10 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="">Choose internship…</option>
            {publishedInternships.map(i => (
              <option key={i.id} value={i.id}>{i.title} — {i.startup_name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Candidates ({selected.size}/{candidates.length} selected)</p>
          <button onClick={toggleAll} className="text-sm font-medium text-violet-600 hover:text-violet-700">
            {selected.size === candidates.length ? 'Unselect all' : 'Select all'}
          </button>
        </div>

        <div className="space-y-3">
          {candidates.map((candidate, idx) => (
            <button
              key={`${candidate.name}-${idx}`}
              onClick={() => toggle(idx)}
              className={`w-full rounded-xl border p-4 text-left transition ${
                selected.has(idx) ? 'border-violet-300 bg-violet-50/40' : 'border-border bg-white hover:bg-muted/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 grid h-5 w-5 place-items-center rounded border ${selected.has(idx) ? 'border-violet-500 bg-violet-500 text-white' : 'border-border'}`}>
                  {selected.has(idx) && <Check className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{candidate.name}</p>
                  <div className="mt-2 rounded-lg bg-violet-50 p-3 ring-1 ring-inset ring-violet-600/10">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-violet-700">
                      <Sparkles className="h-3.5 w-3.5" /> AI Summary
                    </div>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-foreground/85">
                      {(candidate.bullets || []).slice(0, 3).map((bullet, bulletIdx) => (
                        <li key={bulletIdx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button onClick={() => navigate('/admin/analyze-candidates')} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60"
        >
          {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
          Publish Shortlist
        </button>
      </div>
    </div>
  );
}
