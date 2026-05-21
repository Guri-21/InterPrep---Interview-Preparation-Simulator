/**
 * Pure functions that derive analytics views from the session history.
 * All functions are side-effect free so they're easy to memoize/unit-test.
 */

import { DOMAINS } from './domains.js';
import { avg, clamp } from './utils.js';

/** Aggregate KPIs for the dashboard hero. */
export function aggregateKPIs(sessions) {
  const total = sessions.length;
  const overallScores = sessions.map((s) => s.feedback?.overall).filter((n) => typeof n === 'number');
  const lastSeven = sessions.filter((s) => Date.now() - new Date(s.createdAt).getTime() < 7 * 86400_000);
  const avgScore = Math.round(avg(overallScores) || 0);
  const minutesPracticed = Math.round(sessions.reduce((acc, s) => acc + (s.durationSec || 0), 0) / 60);

  // Streak — count consecutive days back from today with at least one session.
  const days = new Set(sessions.map((s) => new Date(s.createdAt).toDateString()));
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (days.has(d.toDateString())) streak += 1;
    else if (i > 0) break;
  }

  return { total, avgScore, lastSeven: lastSeven.length, minutesPracticed, streak };
}

/** Per-domain summary { domainId, count, avgOverall, breakdown }. */
export function byDomain(sessions) {
  const map = {};
  for (const s of sessions) {
    const id = s.domainId || 'unknown';
    if (!map[id]) map[id] = { domainId: id, count: 0, overalls: [], breakdownSums: {}, breakdownN: {} };
    map[id].count += 1;
    if (typeof s.feedback?.overall === 'number') map[id].overalls.push(s.feedback.overall);
    const scores = s.feedback?.scores || {};
    for (const [k, v] of Object.entries(scores)) {
      if (typeof v === 'number') {
        map[id].breakdownSums[k] = (map[id].breakdownSums[k] || 0) + v;
        map[id].breakdownN[k] = (map[id].breakdownN[k] || 0) + 1;
      }
    }
  }
  return Object.values(map).map((row) => ({
    domainId: row.domainId,
    domainLabel: DOMAINS.find((d) => d.id === row.domainId)?.label || row.domainId,
    count: row.count,
    avgOverall: Math.round(avg(row.overalls) || 0),
    breakdown: Object.fromEntries(
      Object.keys(row.breakdownSums).map((k) => [
        k,
        Math.round(row.breakdownSums[k] / Math.max(row.breakdownN[k], 1)),
      ]),
    ),
  })).sort((a, b) => b.count - a.count);
}

/** Recharts-ready trend series (last 14 sessions). */
export function trend(sessions, limit = 14) {
  return [...sessions]
    .slice(-limit)
    .map((s, i) => ({
      idx: i + 1,
      label: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      overall: clamp(Math.round(s.feedback?.overall || 0), 0, 100),
      domain: s.domainId,
    }));
}

/**
 * Build the radar shape for the latest session's per-axis scores
 * — or the running averages across all sessions if no id is provided.
 */
export function radar(sessions, axes = ['Content', 'Structure', 'Clarity', 'Confidence', 'Communication'], sessionId) {
  const pool = sessionId
    ? sessions.filter((s) => s.id === sessionId)
    : sessions;
  return axes.map((axis) => {
    const values = pool.map((s) => s.feedback?.scores?.[axis]).filter((n) => typeof n === 'number');
    return { axis, value: Math.round(avg(values) || 0) };
  });
}

/** Topic heatmap: rows = domains, columns = topics, value = avg score. */
export function topicHeatmap(sessions) {
  const matrix = {};
  for (const s of sessions) {
    const d = s.domainId || 'unknown';
    const t = s.topic || 'General';
    if (!matrix[d]) matrix[d] = {};
    if (!matrix[d][t]) matrix[d][t] = { scores: [], count: 0 };
    matrix[d][t].count += 1;
    if (typeof s.feedback?.overall === 'number') matrix[d][t].scores.push(s.feedback.overall);
  }
  const out = [];
  for (const [d, topics] of Object.entries(matrix)) {
    for (const [t, { scores, count }] of Object.entries(topics)) {
      out.push({
        domainId: d,
        topic: t,
        avg: Math.round(avg(scores) || 0),
        count,
      });
    }
  }
  return out.sort((a, b) => a.avg - b.avg);
}

/** Identify weak topics (avg < 65 with at least 1 attempt). */
export function weakSpots(sessions, limit = 5) {
  return topicHeatmap(sessions)
    .filter((row) => row.count > 0 && row.avg < 65)
    .slice(0, limit);
}
