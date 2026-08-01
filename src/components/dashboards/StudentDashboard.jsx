import { Link } from 'react-router-dom';
import { Sparkles, FileText, Bell, Search, ArrowRight, TrendingUp } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import InternshipCard from '@/components/InternshipCard';
import Loading from '@/components/Loading';
import StatusBadge from '@/components/StatusBadge';

import { useEffect, useState } from 'react';

export default function StudentDashboard() {
  const { data: internships, loading: loadingInt } = useEntityList('Internship', { filter: { status: 'published' }, sort: '-created_date' });
  const { data: applications, loading: loadingApp } = useEntityList('Application', { sort: '-created_date' });
  const { data: notifications, loading: loadingNotif } = useEntityList('Notification', { filter: { recipient_role: 'student' }, sort: '-created_date' });

  const featured = (internships || []).filter(i => i.is_featured).slice(0, 3);
  const featuredList = featured.length ? featured : (internships || []).slice(0, 3);

  return (
    <div className="space-y-7">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 p-6 text-white sm:p-8">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 right-20 h-40 w-40 rounded-full bg-indigo-300/20 blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Powered by Deema AI matching
          </div>
          <h1 className="mt-4 max-w-lg text-2xl font-bold tracking-tight sm:text-3xl">
            Find your next internship at QSTP
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/80">
            Browse opportunities from innovative startups, apply with one click, and get AI-matched to roles that fit your skills.
          </p>
          <Link to="/internships" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-lg transition hover:bg-white/90">
            <Search className="h-4 w-4" /> Browse Internships
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Search} label="Open Internships" value={loadingInt ? '—' : (internships?.length || 0)} accent="violet" sublabel="Currently accepting applications" />
        <StatCard icon={FileText} label="My Applications" value={loadingApp ? '—' : (applications?.length || 0)} accent="blue" sublabel="Across all internships" />
        <StatCard icon={Bell} label="Notifications" value={loadingNotif ? '—' : (notifications?.filter(n => !n.read).length || 0)} accent="amber" sublabel="Unread updates" />
      </div>

      {/* Featured */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><TrendingUp className="h-5 w-5 text-violet-500" /> Featured Internships</h2>
            <p className="text-sm text-muted-foreground">Hand-picked opportunities from top QSTP startups</p>
          </div>
          <Link to="/internships" className="hidden items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 sm:flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loadingInt ? <Loading /> : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredList.map(i => <InternshipCard key={i.id} internship={i} />)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* My Applications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">My Applications</h2>
            <Link to="/applications" className="text-sm font-medium text-violet-600 hover:text-violet-700">View all</Link>
          </div>
          <div className="space-y-3">
            {loadingApp ? <Loading /> : applications?.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-white/50 p-8 text-center text-sm text-muted-foreground">
                No applications yet. Browse internships to get started.
              </div>
            ) : applications?.slice(0, 4).map(a => (
              <Link key={a.id} to={`/applications`} className="block rounded-xl border border-border bg-white p-4 transition hover:border-violet-200 hover:shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground text-sm line-clamp-1">{a.internship_title}</p>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{a.student_university}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Notifications</h2>
            <Link to="/notifications" className="text-sm font-medium text-violet-600 hover:text-violet-700">View all</Link>
          </div>
          <div className="space-y-2">
            {loadingNotif ? <Loading /> : notifications?.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-white/50 p-8 text-center text-sm text-muted-foreground">
                You're all caught up.
              </div>
            ) : notifications?.slice(0, 5).map(n => (
              <div key={n.id} className="flex gap-3 rounded-xl border border-border bg-white p-3.5">
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-500">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}