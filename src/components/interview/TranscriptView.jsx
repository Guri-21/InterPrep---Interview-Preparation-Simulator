import { cn } from '@/lib/utils.js';

/**
 * Renders a transcript word-by-word, optionally highlighting:
 *   • the current playback word (uses wordTimestamps when available)
 *   • filler words (orange)
 */
export default function TranscriptView({
  text,
  fillerIndices,
  wordTimestamps,
  currentTime = 0,
  duration = 0,
  isPlaying = false,
  className,
  emptyHint = 'Your transcript will appear here as you speak.',
}) {
  if (!text) {
    return <p className={cn('text-[13px] text-ink-400/80 italic', className)}>{emptyHint}</p>;
  }

  const words = text.split(/\s+/).filter(Boolean);
  let activeIdx = -1;
  if (isPlaying) {
    if (wordTimestamps && wordTimestamps.length > 0) {
      for (let i = 0; i < Math.min(wordTimestamps.length, words.length); i++) {
        if (wordTimestamps[i].time <= currentTime) activeIdx = i;
        else break;
      }
    } else if (duration > 0) {
      activeIdx = Math.min(Math.floor((currentTime / duration) * words.length), words.length - 1);
    }
  }

  return (
    <p className={cn('text-[14px] leading-relaxed text-ink-100', className)}>
      {words.map((word, i) => {
        const isFiller = fillerIndices?.has?.(i);
        const cls = i === activeIdx
          ? 'bg-brand-500/35 text-white px-1 rounded-md'
          : i < activeIdx
            ? 'text-ink-300'
            : isFiller
              ? 'text-warning-400'
              : 'text-ink-100';
        return <span key={i} className={cls}>{word}{' '}</span>;
      })}
    </p>
  );
}
