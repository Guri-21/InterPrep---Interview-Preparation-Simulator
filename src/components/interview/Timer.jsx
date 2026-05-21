import { fmtTime } from '@/lib/utils.js';
import { cn } from '@/lib/utils.js';

export default function Timer({ elapsed, limit, active }) {
  const pct = limit > 0 ? Math.min((elapsed / limit) * 100, 100) : 0;
  const overshooting = elapsed > limit;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-mono text-[34px] leading-none tracking-tight tabular-nums text-gradient">
          {fmtTime(elapsed)}
        </div>
        <div className="text-[11.5px] text-ink-400">
          target {fmtTime(limit)}
        </div>
      </div>
      <div className="progress-track">
        <div
          className={cn(
            'progress-fill',
            overshooting && 'bg-gradient-to-r from-warning-500 to-danger-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-1.5 text-[11px]">
        <span className={cn('inline-block w-1.5 h-1.5 rounded-full', active ? 'bg-danger-400 animate-pulseSoft' : 'bg-ink-500')} />
        <span className="text-ink-300">{active ? 'Recording' : 'Idle'}</span>
      </div>
    </div>
  );
}
