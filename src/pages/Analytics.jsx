import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Flame, Layers, ArrowRight } from 'lucide-react';

import Card, { CardBody, CardHeader } from '@/components/ui/Card.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import Button from '@/components/ui/Button.jsx';
import Badge from '@/components/ui/Badge.jsx';
import TrendChart from '@/components/charts/TrendChart.jsx';
import ScoreRadar from '@/components/charts/ScoreRadar.jsx';
import DomainComparison from '@/components/charts/DomainComparison.jsx';

import useSessions from '@/hooks/useSessions.js';
import {
  aggregateKPIs, byDomain, radar, trend, topicHeatmap, weakSpots,
} from '@/lib/analytics.js';
import { DOMAINS, getDomain } from '@/lib/domains.js';
import { cn, fmtRelativeDate } from '@/lib/utils.js';

const RANGES = [
  { id: 'all', label: 'All time' },
  { id: '30',  label: 'Last 30 days' },
  { id: '7',   label: 'Last 7 days' },
];

export default function Analytics() {
  const { sessions } = useSessions();
  const [range, setRange] = useState('all');

  const filtered = useMemo(() => {
    if (range === 'all') return sessions;
    const days = parseInt(range, 10);
    const cutoff = Date.now() - days * 86400_000;
    return sessions.filter((s) => new Date(s.createdAt).getTime() >= cutoff);
  }, [sessions, range]);

  const kpis = useMemo(() => aggregateKPIs(filtered), [filtered]);
  const trendData = useMemo(() => trend(filtered, 30), [filtered]);
  const domainSummary = useMemo(() => byDomain(filtered), [filtered]);
  const heatmap = useMemo(() => topicHeatmap(filtered), [filtered]);
  const weak = useMemo(() => weakSpots(filtered, 6), [filtered]);
  const radarData = useMemo(() => radar(filtered), [filtered]);

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Analytics will appear after your first session"
        description="Once you complete a domain interview, this page populates with trends, weak spots, and per-domain breakdowns."
        action={
          <Link to="/practice"><Button variant="brand" rightIcon={<ArrowRight className="w-4 h-4" />}>Start practicing</Button></Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11.5px] uppercase tracking-wider text-brand-300 font-medium">Analytics</div>
          <h1 className="mt-1 text-[28px] sm:text-[34px] font-semibold tracking-tighter text-gradient">
            How you're trending.
          </h1>
        </div>
        <div className="inline-flex p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                'h-7 px-3 rounded-md text-[11.5px] font-medium transition-colors',
                range === r.id ? 'bg-white/[0.07] text-ink-100' : 'text-ink-400 hover:text-ink-200',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard icon={TrendingUp} label="Avg score"     value={kpis.avgScore} suffix="/100" />
        <KpiCard icon={Layers}     label="Sessions"      value={kpis.total} />
        <KpiCard icon={Flame}      label="Day streak"    value={kpis.streak} />
        <KpiCard icon={BarChart3}  label="Minutes practiced" value={kpis.minutesPracticed} />
      </div>

      {/* Trend + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="text-[13px] font-semibold tracking-tight">Overall trend</div>
            <p className="text-[11.5px] text-ink-400 mt-0.5">Per-session overall score in the selected range.</p>
          </CardHeader>
          <CardBody className="pt-1">
            {trendData.length === 0 ? (
              <p className="text-[12.5px] text-ink-400 py-4">No sessions in this range.</p>
            ) : <TrendChart data={trendData} height={280} />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-[13px] font-semibold tracking-tight">Strengths radar</div>
            <p className="text-[11.5px] text-ink-400 mt-0.5">Averaged across all selected sessions.</p>
          </CardHeader>
          <CardBody className="pt-1">
            <ScoreRadar data={radarData} height={280} />
          </CardBody>
        </Card>
      </div>

      {/* Domain comparison */}
      <Card>
        <CardHeader>
          <div className="text-[13px] font-semibold tracking-tight">By domain</div>
          <p className="text-[11.5px] text-ink-400 mt-0.5">Average score per domain. Click a bar's domain to see your weak topics there.</p>
        </CardHeader>
        <CardBody className="pt-1">
          {domainSummary.length === 0
            ? <p className="text-[12.5px] text-ink-400 py-4">No data.</p>
            : <DomainComparison data={domainSummary} height={280} />
          }
          {domainSummary.length > 0 && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {domainSummary.map((row) => (
                <DomainSummaryRow key={row.domainId} row={row} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Weak topic heatmap */}
      <Card>
        <CardHeader>
          <div className="text-[13px] font-semibold tracking-tight">Topic heatmap</div>
          <p className="text-[11.5px] text-ink-400 mt-0.5">Every topic you've attempted, colored by average score. Darker = stronger.</p>
        </CardHeader>
        <CardBody className="pt-1">
          {heatmap.length === 0 ? (
            <p className="text-[12.5px] text-ink-400 py-4">No data.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {heatmap.map((row) => {
                const intensity = Math.min(Math.max(row.avg / 100, 0.15), 1);
                return (
                  <div
                    key={`${row.domainId}-${row.topic}`}
                    className="rounded-lg p-3 border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                    style={{ background: `linear-gradient(135deg, rgba(91,84,255,${0.05 + intensity * 0.4}) 0%, rgba(34,211,238,${intensity * 0.25}) 100%)` }}
                  >
                    <div className="text-[10.5px] uppercase tracking-wider text-ink-300/80">{getDomain(row.domainId)?.shortLabel || row.domainId}</div>
                    <div className="mt-1 text-[12.5px] font-medium text-ink-100 truncate">{row.topic}</div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-ink-200">
                      <span className="tabular-nums font-semibold">{row.avg}</span>
                      <span className="text-ink-400">{row.count}×</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Weak spots */}
      {weak.length > 0 && (
        <Card>
          <CardHeader>
            <div className="text-[13px] font-semibold tracking-tight">Weak spots</div>
            <p className="text-[11.5px] text-ink-400 mt-0.5">Topics averaging under 65. Best targets for a focused session.</p>
          </CardHeader>
          <CardBody className="pt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {weak.map((row) => {
              const d = getDomain(row.domainId);
              return (
                <Link
                  key={`${row.domainId}-${row.topic}`}
                  to={`/interview/${row.domainId}`}
                  className="rounded-xl p-3.5 bg-white/[0.025] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.05] transition-colors"
                >
                  <div className="text-[10.5px] uppercase tracking-wider text-ink-400">{d?.shortLabel || row.domainId}</div>
                  <div className="mt-1 text-[14px] font-medium text-ink-100">{row.topic}</div>
                  <div className="mt-2 text-[11.5px] flex items-center justify-between">
                    <span className="text-warning-400 font-medium tabular-nums">{row.avg}/100 avg</span>
                    <span className="text-ink-400">{row.count} attempt{row.count > 1 ? 's' : ''}</span>
                  </div>
                </Link>
              );
            })}
          </CardBody>
        </Card>
      )}

      {/* Session timeline */}
      <Card>
        <CardHeader>
          <div className="text-[13px] font-semibold tracking-tight">Session timeline</div>
        </CardHeader>
        <CardBody className="pt-1">
          <ul className="divide-y divide-white/[0.04]">
            {filtered.slice().reverse().slice(0, 20).map((s) => {
              const d = getDomain(s.domainId);
              return (
                <li key={s.id} className="flex items-center gap-3 py-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.04] grid place-items-center text-[11px] tabular-nums font-medium">
                    {s.feedback?.overall ?? '—'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] text-ink-100 truncate">{d?.label || s.domainId} · {s.topic}</div>
                    <div className="text-[11px] text-ink-400">{fmtRelativeDate(s.createdAt)} · {s.difficulty}</div>
                  </div>
                  <Link to={`/interview/${s.domainId}/results/${s.id}`}>
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>Open</Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, suffix }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="px-5 py-4">
        <div className="flex items-center justify-between">
          <Icon className="w-4 h-4 text-ink-200" />
          <span className="text-[10.5px] uppercase tracking-wider text-ink-400">{label}</span>
        </div>
        <div className="mt-3 font-display tabular-nums tracking-tight text-[32px] leading-none text-gradient">
          {value}
          {suffix && <span className="ml-1 text-[13px] text-ink-400 font-normal">{suffix}</span>}
        </div>
      </Card>
    </motion.div>
  );
}

function DomainSummaryRow({ row }) {
  const d = getDomain(row.domainId);
  return (
    <Link
      to={`/interview/${row.domainId}`}
      className="rounded-xl p-3.5 bg-white/[0.025] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.05] transition-colors flex items-center gap-3"
    >
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${d?.accent || 'from-brand-500 to-cyan-500'} grid place-items-center text-[10px] font-semibold uppercase text-ink-950`}>
        {d?.shortLabel?.slice(0, 2) || '·'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-medium text-ink-100 truncate">{d?.label || row.domainId}</div>
        <div className="text-[10.5px] text-ink-400">{row.count} session{row.count > 1 ? 's' : ''}</div>
      </div>
      <div>
        <Badge variant={row.avgOverall >= 80 ? 'success' : row.avgOverall >= 60 ? 'brand' : 'warning'}>
          {row.avgOverall}
        </Badge>
      </div>
    </Link>
  );
}
