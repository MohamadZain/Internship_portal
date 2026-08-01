const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';

export function useEntityList(entityName, { sort = '-created_date', limit = 100, filter = {} } = {}) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = filter && Object.keys(filter).length > 0
        ? await db.entities[entityName].filter(filter, sort, limit)
        : await db.entities[entityName].list(sort, limit);
      setData(items || []);
      setError(null);
    } catch (e) {
      setError(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [entityName, sort, limit, JSON.stringify(filter), user?.id]);

  useEffect(() => { load(); }, [load]);

  return { data: data || [], loading, error, reload: load };
}