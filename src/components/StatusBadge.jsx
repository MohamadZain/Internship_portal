import { cn } from '@/lib/utils';

const STYLES = {
  // Application statuses
  applied: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  under_review: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  shortlisted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  // Internship statuses
  draft: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  pending_approval: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  closed: 'bg-slate-100 text-slate-500 ring-slate-400/20',
  // Startup statuses
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

const LABELS = {
  applied: 'Applied',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  published: 'Published',
  closed: 'Closed',
  pending: 'Pending',
  approved: 'Approved',
};

export default function StatusBadge({ status, className }) {
  const style = STYLES[status] || 'bg-slate-100 text-slate-600 ring-slate-500/20';
  const label = LABELS[status] || status;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset capitalize', style, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}