const HEIGHTS = [45, 72, 28, 88, 55, 38, 95, 62, 42, 80, 32, 70, 52, 90, 25, 65, 48, 85, 35, 75, 58, 40, 100, 30, 68, 50, 82, 22, 60, 78, 44, 92];

/**
 * Compact animated waveform — purely cosmetic.
 * Toggle `active` to start the per-bar pulse animation.
 */
export default function Waveform({ active = false, className = '' }) {
  return (
    <div className={`flex items-end justify-center gap-[3px] h-[110px] ${className}`}>
      {HEIGHTS.map((h, i) => (
        <div
          key={i}
          className={`waveform-bar ${active ? 'active' : ''}`}
          style={{
            '--h': `${h * 1.0}px`,
            '--d': `${(0.32 + (i % 7) * 0.06).toFixed(2)}s`,
            animationDelay: `${((i * 0.047) % 0.65).toFixed(3)}s`,
          }}
        />
      ))}
    </div>
  );
}
