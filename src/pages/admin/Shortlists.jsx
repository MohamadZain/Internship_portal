import { useState, useMemo } from 'react';
import { ListChecks, Plus, Sparkles, X, Loader2, ExternalLink, Check } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';
import { db } from '@/api/base44Client';

import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/ui/use-toast';

export default function Shortlists() {
  const { data: shortlists, loading, reload } = useEntityList('Shortlist', { sort: '-created_date' });
  const { data: applications } = useEntityList('Application', { sort: '-created_date' });
  const { data: internships } = useEntityList('Internship', { sort: '-created_date' });
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState('');
  const [selectedApps, setSelectedApps] = useState({});
  const [publishing, setPublishing] = useState(false);

  const publishedAppIds = useMemo(() => new Set((shortlists || []).map(s => s.application_id).filter(Boolean)), [shortlists]);

  const eligibleApps = useMemo(() => {
    return (applications || []).filter(a =>
      a.internship_id === selectedInternship &&
      !publishedAppIds.has(a.id) &&
      a.status !== 'rejected'
    );
  }, [applications, selectedInternship, publishedAppIds]);

  const toggleApp = (id) => {
    setSelectedApps(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id]; else next[id] = '';
      return next;
    });
  };

  const handlePublish = async () => {
    const appIds = Object.keys(selectedApps);
    if (!selectedInternship) {
      toast({ title: 'Please select an internship.', variant: 'destructive' });
      return;
    }
    if (appIds.length === 0) {
      toast({ title: 'Please select at least one application.', variant: 'destructive' });
      return;
    }

    const internship = (internships || []).find(i => i.id === selectedInternship);
    setPublishing(true);

    try {
      await Promise.all(
        appIds.map((appId, idx) => {
          const app = eligibleApps.find(item => item.id === appId);
          return db.entities.Shortlist.create({
            internship_id: selectedInternship,
            internship_title: internship?.title || app?.internship_title || 'Internship',
            application_id: appId,
            candidate_name: app?.student_name || 'Candidate',
            resume_url: app?.resume_url || '',
            ai_summary: selectedApps[appId] || 'Selected by QSTP for strong fit to role requirements.',
            rank: idx + 1,
            status: 'published',
          });
        })
      );

      toast({ title: 'Shortlist published' });
      setSelectedApps({});
      setSelectedInternship('');
      setOpen(false);
      reload();
    } catch {
      toast({ title: 'Failed to publish shortlist', variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Shortlists" description="Publish and manage shortlisted candidates for internships.">
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
          <Plus className="h-4 w-4" /> Create Shortlist
        </button>
      </PageHeader>

      {loading ? <Loading /> : (shortlists || []).length === 0 ? (
        <EmptyState icon={ListChecks} title="No shortlists yet" description="Publish shortlisted candidates to make them visible to startups." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(shortlists || []).map(s => (
            <div key={s.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{s.candidate_name}</h3>
                  <p className="text-xs text-muted-foreground">{s.internship_title}</p>
                </div>
                {s.rank ? <span className="rounded bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">Rank #{s.rank}</span> : null}
              </div>

              {s.ai_summary ? (
                <div className="mt-3 rounded-xl bg-violet-50/60 p-3 ring-1 ring-inset ring-violet-600/10">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-violet-700">
                    <Sparkles className="h-3.5 w-3.5" /> AI Summary
                  </div>
                  <p className="text-sm text-foreground/85">{s.ai_summary}</p>
                </div>
              ) : null}

              {s.resume_url ? (
                <a href={s.resume_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700">
                  <ExternalLink className="h-4 w-4" /> View Resume
                </a>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !publishing && setOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-semibold text-foreground">Publish shortlist</h2>
              <button onClick={() => !publishing && setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Internship</label>
                <select
                  value={selectedInternship}
                  onChange={e => {
                    setSelectedInternship(e.target.value);
                    setSelectedApps({});
                  }}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="">Choose internship…</option>
                  {(internships || []).map(i => (
                    <option key={i.id} value={i.id}>{i.title} — {i.startup_name}</option>
                  ))}
                </select>
              </div>

              {selectedInternship ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Applications</p>
                  {eligibleApps.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No eligible applications for this internship.</p>
                  ) : (
                    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                      {eligibleApps.map(app => {
                        const checked = Object.prototype.hasOwnProperty.call(selectedApps, app.id);
                        return (
                          <button
                            key={app.id}
                            onClick={() => toggleApp(app.id)}
                            className={`w-full rounded-xl border p-3 text-left transition ${
                              checked ? 'border-violet-300 bg-violet-50/40' : 'border-border bg-white hover:bg-muted/40'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 grid h-5 w-5 place-items-center rounded border ${checked ? 'border-violet-500 bg-violet-500 text-white' : 'border-border'}`}>
                                {checked ? <Check className="h-3.5 w-3.5" /> : null}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-foreground">{app.student_name}</p>
                                <p className="text-xs text-muted-foreground">{app.student_email}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
              <button onClick={() => setOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted" disabled={publishing}>
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
              >
                {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
