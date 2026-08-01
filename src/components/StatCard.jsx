import { cn } from '@/lib/utils';

export default function StatCard({ icon: Icon, label, value, sublabel, accent = 'violet', className }) {
  const accents = {
    violet: 'bg-violet-50 text-violet-600 ring-violet-600/10',
    blue: 'bg-blue-50 text-blue-600 ring-blue-600/10',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-600/10',
    amber: 'bg-amber-50 text-amber-600 ring-amber-600/10',
    rose: 'bg-rose-50 text-rose-600 ring-rose-600/10',
    indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-600/10',
  };
  return (
    <div className={cn('rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md', className)}>
      <div className="flex items-center justify-between">
        <div className={cn('grid h-10 w-10 place-items-center rounded-xl ring-1', accents[accent])}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-foreground font-heading">{value}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
      {sublabel && <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  );
}