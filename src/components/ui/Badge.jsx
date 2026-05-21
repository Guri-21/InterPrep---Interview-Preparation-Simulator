import { cn } from '@/lib/utils.js';

const VARIANTS = {
  default:  'bg-white/[0.05] text-ink-200 border-white/[0.07]',
  brand:    'bg-brand-500/15 text-brand-300 border-brand-500/30',
  success:  'bg-success-500/15 text-success-400 border-success-500/30',
  warning:  'bg-warning-500/15 text-warning-400 border-warning-500/30',
  danger:   'bg-danger-500/15 text-danger-400 border-danger-500/30',
  outline:  'bg-transparent text-ink-200 border-white/[0.10]',
  live:     'bg-success-500/15 text-success-400 border-success-500/30',
};

export default function Badge({ children, variant = 'default', className, dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border',
        'text-[10.5px] font-medium tracking-wider uppercase',
        VARIANTS[variant],
        className,
      )}
    >
      {dot && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulseSoft" />}
      {children}
    </span>
  );
}
