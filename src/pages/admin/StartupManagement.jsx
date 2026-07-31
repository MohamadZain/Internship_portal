const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useMemo } from 'react';
import { Building2, Search, Check, X, Globe, Loader2 } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';

import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import StatusBadge from '@/components/StatusBadge';
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