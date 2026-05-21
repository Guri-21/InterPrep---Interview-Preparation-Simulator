import { useCallback, useEffect, useState } from 'react';
import { listMyInterviews } from '@/lib/api.js';
import { useAuth } from '@/context/AuthContext.jsx';

/**
 * Normalize an Interview record from the API into the shape the pages expect:
 *   - `id` (always present)
 *   - `domainId` (= the slug, since most of the UI keys off the slug)
 *   - `feedback`, `topic`, `difficulty`, `createdAt`, etc. passed through.
 */
function normalize(row) {
  return {
    id: row.id || row._id,
    createdAt: row.createdAt,
    domainId: row.domainSlug || row.domain?.slug || 'unknown',
    domainLabel: row.domain?.label || row.domainSlug,
    questionId: row.questionRef || null,
    question: row.question,
    topic: row.topic,
    difficulty: row.difficulty,
    transcript: row.transcript,
    durationSec: row.durationSec || 0,
    wpm: row.wpm || 0,
    fillerCount: row.fillerCount || 0,
    feedback: row.feedback || {},
  };
}

/**
 * useSessions — load the authenticated user's full interview history.
 * The hook is read-only; new sessions are created server-side by
 * POST /api/interviews/analyze, so `reload()` is how callers refresh.
 *
 * For unauthenticated users we return an empty list (no client-side fallback).
 */
export default function useSessions() {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setSessions([]); setStatus('ready');
      return;
    }
    setStatus('loading'); setError(null);
    try {
      const { items } = await listMyInterviews({ limit: 200 });
      // The pages were built around oldest→newest, so reverse the
      // server's createdAt-DESC ordering to match.
      const normalized = items.map(normalize).reverse();
      setSessions(normalized);
      setStatus('ready');
    } catch (e) {
      setError(e.message || 'Failed to load sessions');
      setStatus('error');
    }
  }, [isAuthenticated]);

  useEffect(() => { reload(); }, [reload]);

  return { sessions, status, error, reload };
}
