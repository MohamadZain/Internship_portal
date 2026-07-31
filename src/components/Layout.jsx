import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, FileText, Bell, Plus, Users, ShieldCheck,
  Sparkles, ListChecks, Building2, Menu, X, ChevronDown
} from 'lucide-react';
import { useRole } from '@/lib/RoleContext';
import { cn } from '@/lib/utils';

const NAV = {
  student: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/internships', label: 'Browse Internships', icon: Search },
    { to: '/applications', label: 'My Applications', icon: FileText },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ],
  startup: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/startup/create-internship', label: 'Create Internship', icon: Plus },
    { to: '/startup/shortlisted', label: 'Shortlisted Candidates', icon: Users },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/startups', label: 'Startup Management', icon: Building2 },
    { to: '/admin/internship-approval', label: 'Internship Approval', icon: ShieldCheck },
    { to: '/admin/applications', label: 'Applications', icon: FileText },
    { to: '/admin/analyze-candidates', label: 'Analyze Candidates', icon: Sparkles },
    { to: '/admin/shortlists', label: 'Shortlists', icon: ListChecks },
  ],
};

const ROLE_META = {
  student: { label: 'Student', desc: 'Browse & apply' },
  startup: { label: 'Startup', desc: 'Hire talent' },
  admin: { label: 'QSTP Admin', desc: 'Program owner' },
};

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-600/30">
        <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-white font-heading">QSTP Talent</p>
        <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Internship Platform</p>
      </div>
    </div>
  );
}

function RoleSwitcher() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const switchRole = (key) => { setRole(key); setOpen(false); navigate('/dashboard'); };
  const meta = ROLE_META[role];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/60 px-3 py-2.5 text-left transition hover:bg-sidebar-accent"
      >
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/20 text-violet-300">
          {role === 'student' && <Users className="h-4 w-4" />}
          {role === 'startup' && <Building2 className="h-4 w-4" />}
          {role === 'admin' && <ShieldCheck className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-sm font-semibold text-white">{meta.label}</p>
          <p className="text-[11px] text-sidebar-foreground/60">{meta.desc}</p>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-sidebar-foreground/50 transition', open && 'rotate-180')} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 z-40 mb-2 overflow-hidden rounded-xl border border-sidebar-border bg-[hsl(232_30%_11%)] shadow-2xl">
            {Object.entries(ROLE_META).map(([key, m]) => (
              <button
                key={key}
                onClick={() => switchRole(key)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-sidebar-accent',
                  role === key && 'bg-sidebar-accent/60'
                )}
              >
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500/15 text-violet-300">
                  {key === 'student' && <Users className="h-3.5 w-3.5" />}
                  {key === 'startup' && <Building2 className="h-3.5 w-3.5" />}
                  {key === 'admin' && <ShieldCheck className="h-3.5 w-3.5" />}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-white">{m.label}</p>
                  <p className="text-[10px] text-sidebar-foreground/50">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Layout() {
  const { role } = useRole();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = NAV[role];

  const currentLabel = items.find(i => location.pathname.startsWith(i.to) && i.to !== '/dashboard')?.label
    || items.find(i => i.to === location.pathname)?.label
    || 'Dashboard';

  const SidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo />
        <button className="lg:hidden text-sidebar-foreground/60" onClick={() => setMobileOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-dark px-3 py-2">
        <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">Menu</p>
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-sidebar-primary/15 text-white ring-1 ring-inset ring-sidebar-primary/30'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-4.5 w-4.5 shrink-0', isActive ? 'text-violet-300' : 'text-sidebar-foreground/50 group-hover:text-white')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <RoleSwitcher />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">{SidebarContent}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 shadow-2xl">{SidebarContent}</div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-white/80 px-4 backdrop-blur lg:px-8">
          <button className="lg:hidden text-foreground" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{ROLE_META[role].label}</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="font-medium text-foreground">{currentLabel}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}