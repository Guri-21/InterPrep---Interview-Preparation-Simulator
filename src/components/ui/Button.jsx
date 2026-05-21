import { forwardRef } from 'react';
import { cn } from '@/lib/utils.js';

const VARIANTS = {
  primary:
    'bg-white text-ink-950 hover:bg-ink-50 active:scale-[0.985] shadow-glow-sm hover:shadow-glow',
  brand:
    'text-white bg-gradient-to-r from-brand-500 via-brand-400 to-cyan-400 hover:shadow-glow active:scale-[0.985] shadow-glow-sm',
  glass:
    'bg-white/[0.06] hover:bg-white/[0.10] text-ink-100 border border-white/[0.08] backdrop-blur-xl active:scale-[0.985]',
  ghost:
    'bg-transparent hover:bg-white/[0.05] text-ink-200',
  danger:
    'bg-danger-500/15 hover:bg-danger-500/25 text-danger-400 border border-danger-500/30 active:scale-[0.985]',
  outline:
    'border border-white/[0.10] hover:border-white/[0.18] text-ink-100 hover:bg-white/[0.03]',
};

const SIZES = {
  sm: 'h-8  px-3   text-[12.5px] rounded-lg gap-1.5',
  md: 'h-10 px-4   text-[13.5px] rounded-xl gap-2',
  lg: 'h-12 px-5   text-[14px]   rounded-xl gap-2',
  xl: 'h-14 px-7   text-[15px]   rounded-2xl gap-2.5',
};

const Button = forwardRef(function Button(
  { variant = 'glass', size = 'md', className, leftIcon, rightIcon, children, loading, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-200 ease-out-expo',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent animate-spin" /> : leftIcon}
      <span className="truncate">{children}</span>
      {!loading && rightIcon}
    </button>
  );
});

export default Button;
