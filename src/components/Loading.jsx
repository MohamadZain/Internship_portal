import { Loader2 } from 'lucide-react';

export default function Loading({ label = 'Loading…', className }) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 text-muted-foreground ${className || ''}`}>
      <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}