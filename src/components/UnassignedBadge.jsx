import { AlertTriangle } from 'lucide-react';

function UnassignedBadge({ compact = false }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-md border border-amber-500 bg-amber-100 font-bold text-amber-900',
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
      ].join(' ')}
    >
      <AlertTriangle className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
      未上架 / Unassigned
    </span>
  );
}

export default UnassignedBadge;
