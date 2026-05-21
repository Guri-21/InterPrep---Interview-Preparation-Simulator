/**
 * Minimal client-side preferences cache.
 *
 * Sessions, the question library, and the user profile all live on the server
 * (see backend/). The only thing we still keep in localStorage are non-secret,
 * device-local UI preferences (e.g. reduce-motion, palette opt-ins). Anything
 * that needs to survive across devices belongs in the backend.
 */

const NS = 'interprep';
const SCHEMA_VERSION = 2;

function k(key) {
  return `${NS}:v${SCHEMA_VERSION}:${key}`;
}

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(k(key));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed?.data ?? fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, data) {
  try {
    localStorage.setItem(
      k(key),
      JSON.stringify({ version: SCHEMA_VERSION, updatedAt: Date.now(), data }),
    );
    return true;
  } catch {
    return false;
  }
}

/* ─── Preferences (device-local) ────────────────────────────────── */

export const PREFS_KEY = 'prefs';

const DEFAULT_PREFS = {
  reduceMotion: false,
  // Future flags — keep around so Settings UI can toggle them visually.
  showDevtools: false,
};

export function loadPrefs() {
  return { ...DEFAULT_PREFS, ...safeRead(PREFS_KEY, {}) };
}

export function savePrefs(patch) {
  const next = { ...loadPrefs(), ...patch };
  safeWrite(PREFS_KEY, next);
  return next;
}
