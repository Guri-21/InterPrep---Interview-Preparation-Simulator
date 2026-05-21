import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind-aware className composer. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Format an integer number of seconds as MM:SS. */
export function fmtTime(secs) {
  const s = Math.max(0, Math.round(secs));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** Human-friendly time-limit label ("60s", "2 min", "1:30 min"). */
export function fmtLimit(secs) {
  if (secs < 60) return `${secs}s`;
  if (secs % 60 === 0) return `${secs / 60} min`;
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')} min`;
}

export function fmtRelativeDate(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.round(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function wordCount(str) {
  return (str || '').trim().split(/\s+/).filter(Boolean).length;
}

/** Pick a deterministic-ish ID. */
export function nanoid(len = 10) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

export function avg(nums) {
  if (!nums || nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Promise-based sleep. */
export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/** Capitalize the first character. */
export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Choose the appropriate greeting for the time of day. */
export function timeOfDayGreeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}
