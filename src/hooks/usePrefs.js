import { useCallback, useState } from 'react';
import { loadPrefs, savePrefs } from '@/lib/storage.js';

export default function usePrefs() {
  const [prefs, setPrefs] = useState(() => loadPrefs());
  const update = useCallback((patch) => {
    const next = savePrefs(patch);
    setPrefs(next);
    return next;
  }, []);
  return { prefs, update };
}
