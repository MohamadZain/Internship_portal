import { cn } from '@/lib/utils';

export default function EmptyState({ icon: Icon, title, description, children, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/50 px-6 py-16 text-center', className)}>
      {Icon && (
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-violet-500 ring-1 ring-violet-600/10">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <p className="mt-4 text-base font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}