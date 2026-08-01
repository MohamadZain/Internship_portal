const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { Bell, CheckCheck } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';

import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/ui/use-toast';

export default function Notifications() {
  const { data, loading, reload } = useEntityList('Notification', { filter: { recipient_role: 'student' }, sort: '-created_date' });
  const { toast } = useToast();

  const markRead = async (id) => {
    await db.entities.Notification.update(id, { read: true });
    reload();
  };

  const markAllRead = async () => {
    const unread = (data || []).filter(n => !n.read);
    await Promise.all(unread.map(n => db.entities.Notification.update(n.id, { read: true })));
    toast({ title: 'All notifications marked as read' });
    reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Stay up to date on your applications and new opportunities.">
        {data?.some(n => !n.read) && (
          <button onClick={markAllRead} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </PageHeader>

      {loading ? <Loading /> : data.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up. New updates will appear here." />
      ) : (
        <div className="space-y-2">
          {data.map(n => (
            <div key={n.id} className={`flex gap-4 rounded-2xl border bg-white p-4 shadow-sm transition ${n.read ? 'border-border' : 'border-violet-200 bg-violet-50/30'}`}>
              <div className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${n.read ? 'bg-muted text-muted-foreground' : 'bg-violet-100 text-violet-600'}`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${n.read ? 'font-medium text-foreground' : 'font-semibold text-foreground'}`}>{n.title}</p>
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-violet-500" />}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="mt-2 text-xs font-medium text-violet-600 hover:text-violet-700">Mark as read</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}