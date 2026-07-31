import { createContext, useContext, useEffect, useState } from 'react';

const RoleContext = createContext(undefined);

const STORAGE_KEY = 'qstp_active_role';

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(() => {
    if (typeof window === 'undefined') return 'admin';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved || 'admin';
  });

  const setRole = (r) => {
    setRoleState(r);
    window.localStorage.setItem(STORAGE_KEY, r);
  };

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, role);
  }, [role]);

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}