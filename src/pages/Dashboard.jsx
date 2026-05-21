import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, Trophy, Flame, Clock, BarChart3, TrendingUp,
} from 'lucide-react';

import Card, { CardBody, CardHeader } from '@/components/ui/Card.jsx';
import Button from '@/components/ui/Button.jsx';
import Badge from '@/components/ui/Badge.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import TrendChart from '@/components/charts/TrendChart.jsx';
import ScoreRadar from '@/components/charts/ScoreRadar.jsx';

import useSessions from '@/hooks/useSessions.js';
import { useAuth } from '@/context/AuthContext.jsx';
import { aggregateKPIs, byDomain, radar, trend, weakSpots } from '@/lib/analytics.js';
import { DOMAINS, getDomain } from '@/lib/domains.js';
import { fmtRelativeDate, timeOfDayGreeting } from '@/lib/utils.js';

export default function Dashboard() {
  const { sessions } = useSessions();
  const { user } = useAuth();

  const firstName = (user?.name || '').split(/\s+/)[0] || '';
  // Backend stores preferredDomain as an ObjectId; when it's hydrated it
  // could be a string id OR a populated object — try both shapes.
  const preferredDomainSlug =
    typeof user?.preferredDomain === 'string' ? user.preferredDomain : user?.preferredDomain?.slug;

  const kpis = useMemo(() => aggregateKPIs(sessions), [sessions]);
  const trendData = useMemo(() => trend(sessions, 14), [sessions]);
  const radarData = useMemo(() => radar(sessions), [sessions]);
  const domainSummary = useMemo(() => byDomain(sessions), [sessions]);
  const weak = useMemo(() => weakSpots(sessions, 4), [sessions]);

  const recommended = useMemo(() => {
    // The domain with the lowest average score gets recommended next.
    if (domainSummary.length === 0) return preferredDomainSlug || 'dsa';
    const sorted = [...domainSummary].sort((a, b) => a.avgOverall - b.avgOverall);
    return sorted[0].domainId;
  }, [domainSummary, preferredDomainSlug]);

  const recommendedDomain = getDomain(recommended);
  const greeting = timeOfDayGreeting();

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* ── Greeting ────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      >
        <div className="text-[11.5px] uppercase tracking-wider text-brand-300 font-medium">
          {greeting}{firstName ? `, ${firstName}` : ''}
        </div>
        <h1 className="mt-1 text-[28px] sm:text-[34px] font-semibold tracking-tighter text-gradient">
          Let's get sharper.
        </h1>
        <p className="text-[13.5px] text-ink-300 mt-1">
          Pick up where you left off, or recover the weakest topic with one targeted answer.
        </p>
      </motion.section>

      {/* ── KPI cards ───────────────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard
          icon={Trophy}
          label="Avg score"
          value={kpis.avgScore}
          suffix="/100"
          tone="from-brand-500/20 to-cyan-500/10"
        />
        <KpiCard
          icon={Sparkles}
          label="Sessions"
          value={kpis.total}
          tone="from-fuchsia-500/20 to-brand-500/10"
        />
        <KpiCard
          icon={Flame}
          label="Day streak"
          value={kpis.streak}
          tone="from-amber-500/20 to-rose-500/10"
        />
        <KpiCard
          icon={Clock}
          label="Practice minutes"
          value={kpis.minutesPracticed}
          tone="from-emerald-500/20 to-cyan-500/10"
        />
      </section>

      {/* ── Recommended next + Recent activity ──────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/15 via-transparent to-cyan-500/10 opacity-60 pointer-events-none" />
            <CardHeader className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="brand" dot>Recommended</Badge>
                  <h2 className="mt-2 text-[20px] font-semibold tracking-tight text-ink-100">
                    {recommendedDomain?.label}
                  </h2>
                  <p className="mt-1 text-[13px] text-ink-300 max-w-md leading-relaxed">
                    {recommendedDomain?.tagline} {sessions.length > 0 && domainSummary.length > 0 ? 'This is the domain you scored lowest on — one focused run could move the needle.' : 'Start here for your first run.'}
                  </p>
                </div>
                <Link to={`/interview/${recommendedDomain?.id || 'dsa'}`}>
                  <Button variant="brand" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Start
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody className="relative">
              <div className="flex flex-wrap items-center gap-1.5">
                {recommendedDomain?.skills.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
            </CardBody>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold tracking-tight">Recent sessions</div>
              <Link to="/analytics" className="text-[11.5px] text-brand-300 hover:text-brand-200">View all →</Link>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            {sessions.length === 0 ? (
              <EmptyState
                title="No sessions yet"
                description="Your first answer will appear here with a quick score and timestamp."
                className="py-8"
              />
            ) : (
              <ul className="divide-y divide-white/[0.04]">
                {sessions.slice().reverse().slice(0, 5).map((s) => {
                  const d = getDomain(s.domainId);
                  return (
                    <li key={s.id} className="flex items-center gap-3 py-2.5">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.04] grid place-items-center text-[10.5px] tabular-nums font-medium text-ink-100">
                        {s.feedback?.overall ?? '—'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] text-ink-100 truncate">{d?.label || s.domainId}</div>
                        <div className="text-[11px] text-ink-400">{fmtRelativeDate(s.createdAt)} · {s.topic || 'General'}</div>
                      </div>
                      <Link to={`/interview/${s.domainId}/results/${s.id}`}>
                        <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>Open</Button>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>

      {/* ── Trend + Radar ───────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-tight">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-300" />
                  Overall score trend
                </div>
                <p className="text-[11.5px] text-ink-400 mt-0.5">Last {Math.min(trendData.length, 14)} sessions</p>
              </div>
              <Link to="/analytics"><Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>Analytics</Button></Link>
            </div>
          </CardHeader>
          <CardBody className="pt-2">
            {trendData.length === 0 ? (
              <EmptyState icon={BarChart3} title="No trend yet" description="Do a session to start building your performance history." className="py-6" />
            ) : <TrendChart data={trendData} />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-[13px] font-semibold tracking-tight">Strengths radar</div>
            <p className="text-[11.5px] text-ink-400 mt-0.5">Average across all axes</p>
          </CardHeader>
          <CardBody className="pt-1">
            {sessions.length === 0 ? (
              <EmptyState title="No data yet" description="Your radar will fill in as soon as you complete a session." className="py-6" />
            ) : <ScoreRadar data={radarData} />}
          </CardBody>
        </Card>
      </section>

      {/* ── Weak topics ─────────────────────────────────────────── */}
      {weak.length > 0 && (
        <Card>
          <CardHeader>
            <div className="text-[13px] font-semibold tracking-tight">Weak topics worth revisiting</div>
            <p className="text-[11.5px] text-ink-400 mt-0.5">Topics scoring below 65 on average — bring these up first next session.</p>
          </CardHeader>
          <CardBody className="pt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {weak.map((row) => {
              const d = getDomain(row.domainId);
              return (
                <Link
                  key={`${row.domainId}-${row.topic}`}
                  to={`/interview/${row.domainId}`}
                  className="rounded-xl p-3.5 bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.10] hover:bg-white/[0.05] transition-colors"
                >
                  <div className="text-[10.5px] uppercase tracking-wider text-ink-400">{d?.shortLabel || row.domainId}</div>
                  <div className="mt-1 text-[14px] font-medium text-ink-100">{row.topic}</div>
                  <div className="mt-2 flex items-center justify-between text-[11.5px]">
                    <span className="text-warning-400 font-medium tabular-nums">{row.avg}/100 avg</span>
                    <span className="text-ink-400">{row.count} attempt{row.count > 1 ? 's' : ''}</span>
                  </div>
                </Link>
              );
            })}
          </CardBody>
        </Card>
      )}

      {/* ── Domains rail ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold tracking-tight">All domains</div>
              <p className="text-[11.5px] text-ink-400 mt-0.5">Jump straight into any track.</p>
            </div>
            <Link to="/practice"><Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>Full picker</Button></Link>
          </div>
        </CardHeader>
        <CardBody className="pt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {DOMAINS.map((d) => (
            <Link
              key={d.id}
              to={`/interview/${d.id}`}
              className="group flex items-center gap-3 rounded-xl p-3.5 bg-white/[0.025] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.05] transition-colors"
            >
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${d.accent} opacity-90 grid place-items-center text-[10px] font-semibold uppercase text-ink-950 tracking-wider`}>
                {d.shortLabel.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium text-ink-100 truncate">{d.label}</div>
                <div className="text-[11.5px] text-ink-400 truncate">{d.tagline}</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-ink-400 group-hover:text-brand-300 transition-colors" />
            </Link>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, suffix, tone }) {
  return (
    <Card className="overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${tone} opacity-60 pointer-events-none`} />
      <div className="relative px-5 py-4">
        <div className="flex items-center justify-between">
          <Icon className="w-4 h-4 text-ink-200" />
          <span className="text-[10.5px] uppercase tracking-wider text-ink-400">{label}</span>
        </div>
        <div className="mt-3 font-display tabular-nums tracking-tight text-[34px] leading-none text-gradient">
          {value}
          {suffix && <span className="ml-1 text-[13px] text-ink-400 font-normal">{suffix}</span>}
        </div>
      </div>
    </Card>
  );
}
