import { createContext, useContext } from 'react';
import { useAuth } from '@/lib/AuthContext';

const RoleContext = createContext(undefined);

export function RoleProvider({ children }) {
  const { user } = useAuth();
  const role = user?.role || 'student';
  return <RoleContext.Provider value={{ role }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}