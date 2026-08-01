import { Link } from 'react-router-dom';
import { Building2, Clock, MapPin, ArrowRight } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

export default function InternshipCard({ internship, showStatus = false }) {
  return (
    <Link
      to={`/internships/${internship.id}`}
      className="group flex flex-col rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground group-hover:text-violet-700 transition line-clamp-1">{internship.title}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span className="truncate">{internship.startup_name}</span>
          </div>
        </div>
        {showStatus && <StatusBadge status={internship.status} />}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{internship.description}</p>

      {internship.skills_required?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {internship.skills_required.slice(0, 3).map(s => (
            <span key={s} className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-600/10">
              {s}
            </span>
          ))}
          {internship.skills_required.length > 3 && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              +{internship.skills_required.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {internship.duration && (
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{internship.duration}</span>
          )}
          {internship.location && (
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{internship.location}</span>
          )}
        </div>
        <span className="flex items-center gap-1 font-medium text-violet-600 opacity-0 transition group-hover:opacity-100">
          View <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}