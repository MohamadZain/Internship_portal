import { useState, useMemo } from 'react';
import { FileText, Search } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';

const FILTERS = ['all', 'applied', 'under_review', 'shortlisted', 'rejected'];

export default function Applications() {
  const { data, loading } = useEntityList('Application', { sort: '-created_date' });
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return (data || []).filter(a => {
      const matchesQuery = !query || a.internship_title?.toLowerCase().includes(query.toLowerCase()) || a.student_name?.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === 'all' || a.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [data, query, filter]);

  return (
    <div className="space-y-6">
      <PageHeader title="My Applications" description="Track the status of your internship applications." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search applications…" className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filter === f ? 'bg-violet-600 text-white' : 'bg-white text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted'}`}>
              {f.replace('_', ' ')}
            </button>
          ))}