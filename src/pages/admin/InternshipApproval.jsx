const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useMemo } from 'react';
import { ShieldCheck, Search, Check, X, Clock, Loader2 } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';

import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/ui/use-toast';

export default function InternshipApproval() {
  const { data, loading, reload } = useEntityList('Internship', { sort: '-created_date' });
  const { toast } = useToast();
  const [filter, setFilter] = useState('pending_approval');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(null);

  const filtered = useMemo(() => {
    return (data || []).filter(i => {
      const mf = filter === 'all' || i.status === filter;
      const mq = !query || i.title?.toLowerCase().includes(query.toLowerCase()) || i.startup_name?.toLowerCase().includes(query.toLowerCase());
      return mf && mq;
    });
  }, [data, filter, query]);

  const setStatus = async (id, status, label) => {
    setBusy(id);
    try {
      await db.entities.Internship.update(id, { status });
      toast({ title: `Internship ${label}` });
      reload();
    } catch {
      toast({ title: 'Action failed', variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title=" Postings Approval" description="Review and approve internship postings before they become visible to students." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search internships…" className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['pending_approval', 'published', 'closed', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filter === f ? 'bg-violet-600 text-white' : 'bg-white text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted'}`}>{f.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={Clock} title="No internships in this queue" description="Internships awaiting approval will appear here." />
      ) : (
        <div className="space-y-4">
          {filtered.map(i => (
            <div key={i.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{i.title}</h3>
                    <StatusBadge status={i.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{i.startup_name} · {i.duration} {i.location ? `· ${i.location}` : ''}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{i.description}</p>
                  {i.skills_required?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {i.skills_required.map(s => <span key={s} className="rounded bg-violet-50 px-2 py-0.5 text-xs text-violet-700 ring-1 ring-inset ring-violet-600/10">{s}</span>)}
                    </div>
                  )}
                </div>
                {i.status === 'pending_approval' && (
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => setStatus(i.id, 'published', 'approved & published')} disabled={busy === i.id} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">
                      {busy === i.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve
                    </button>
                    <button onClick={() => setStatus(i.id, 'closed', 'rejected')} disabled={busy === i.id} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-200 transition hover:bg-rose-50 disabled:opacity-60">
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}