import { cn } from '@/lib/utils.js';

/**
 * InterPrep wordmark. The "I" is rendered as a gradient stack to mirror the
 * favicon. Used in the navbar and on the landing page.
 */
export default function Logo({ className, size = 24, withWordmark = true }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-ink-100', className)}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
        <defs>
          <linearGradient id="ip-logo-g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#6b6fff" />
            <stop offset="0.55" stopColor="#8a55ff" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="#0a0a0c" />
        <rect x="0.5" y="0.5" width="63" height="63" rx="13.5" stroke="url(#ip-logo-g)" strokeOpacity="0.4" />
        <path
          d="M16 44V20h6v24h-6Zm10 0V20h12c5.5 0 9.5 3.8 9.5 9 0 5.2-4 9-9.5 9H32v6h-6Zm6-12h5.6c2 0 3.4-1.3 3.4-3 0-1.8-1.4-3-3.4-3H32v6Z"
          fill="url(#ip-logo-g)"
        />
      </svg>
      {withWordmark && (
        <span className="font-semibold tracking-tight text-[15px]">
          Inter<span className="text-gradient-brand">Prep</span>
        </span>
      )}
    </span>
  );
}
