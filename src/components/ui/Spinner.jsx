import { cn } from '@/lib/utils.js';

export default function Spinner({ className, size = 16, label }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-ink-300', className)} role="status" aria-live="polite">
      <span
        className="inline-block rounded-full border-2 border-current border-r-transparent animate-spin"
        style={{ width: size, height: size }}
      />
      {label && <span className="text-[12.5px]">{label}</span>}
    </span>
  );
}
