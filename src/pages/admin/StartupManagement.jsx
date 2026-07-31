import { useState, useMemo } from 'react';
import { Building2, Search, Check, X, Loader2 } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';
import { db } from '@/api/base44Client';

import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/ui/use-toast';

export default function StartupManagement() {
  const { data, loading, reload } = useEntityList('Startup', { sort: '-created_date' });
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(null);

  const filtered = useMemo(() => {
    return (data || []).filter(s => {
      const mq = !query || s.name?.toLowerCase().includes(query.toLowerCase()) || s.industry?.toLowerCase().includes(query.toLowerCase());
      const mf = filter === 'all' || s.status === filter;
      return mq && mf;
    });
  }, [data, query, filter]);

  const setStatus = async (id, status, label) => {
    setBusy(id);
    try {
      await db.entities.Startup.update(id, { status });
      toast({ title: `Startup ${label}` });
      reload();
    } catch {
      toast({ title: 'Action failed', variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Startup Management" description="Review and approve startup profiles." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search startups…" className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20" />
        </div>
        <div className="flex gap-1.5">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filter === f ? 'bg-violet-600 text-white' : 'bg-white text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted'}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No startups found" description="Try changing your search or filter." />
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{s.name}</h3>
                  <p className="text-sm text-muted-foreground">{s.industry || '—'}</p>
                </div>
                <StatusBadge status={s.status || 'pending'} />
              </div>

              <div className="mt-3 flex gap-2">
                <button onClick={() => setStatus(s.id, 'approved', 'approved')} disabled={busy === s.id} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                  {busy === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve
                </button>
                <button onClick={() => setStatus(s.id, 'rejected', 'rejected')} disabled={busy === s.id} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-200 hover:bg-rose-50 disabled:opacity-60">
                  <X className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
