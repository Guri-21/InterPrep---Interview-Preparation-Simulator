import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Lightbulb, MessageCircleQuestion,
  RotateCcw, Mic, Activity, Sparkles, Volume2, Gauge,
} from 'lucide-react';

import Card, { CardBody, CardHeader } from '@/components/ui/Card.jsx';
import Button from '@/components/ui/Button.jsx';
import Badge from '@/components/ui/Badge.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import Spinner from '@/components/ui/Spinner.jsx';
import ScoreRadar from '@/components/charts/ScoreRadar.jsx';

import useSessions from '@/hooks/useSessions.js';
import { getDomain } from '@/lib/domains.js';
import { analyzeFillers, wpmInfo } from '@/hooks/useSpeechRecorder.js';
import { cn, fmtTime, wordCount } from '@/lib/utils.js';
import { getInterview as fetchInterview } from '@/lib/api.js';

/**
 * Results page — resolves the requested session from (in order):
 *   1. Router state (passed from Interview.jsx right after analyze),
 *   2. The cached `useSessions()` list,
 *   3. A direct GET /api/interviews/:id fetch (fallback for deep links).
 */
function normalizeInterview(row) {
  if (!row) return null;
  return {
    id: row.id || row._id,
    createdAt: row.createdAt,
    domainId: row.domainSlug || row.domain?.slug,
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

export default function Results() {
  const { domainId, sessionId } = useParams();
  const location = useLocation();
  const { sessions } = useSessions();
  const domain = getDomain(domainId);

  // Resolve session: router state first (instant), then cached list, then API.
  const cached = sessions.find((s) => s.id === sessionId);
  const fromState = location.state?.interview ? normalizeInterview(location.state.interview) : null;

  const [fetched, setFetched] = useState(null);
  const [fetchStatus, setFetchStatus] = useState(cached || fromState ? 'ready' : 'loading');

  useEffect(() => {
    if (cached || fromState) { setFetchStatus('ready'); return; }
    let alive = true;
    (async () => {
      try {
        const iv = await fetchInterview(sessionId);
        if (!alive) return;
        setFetched(normalizeInterview(iv));
        setFetchStatus('ready');
      } catch {
        if (!alive) return;
        setFetchStatus('not-found');
      }
    })();
    return () => { alive = false; };
  }, [sessionId, cached, fromState]);

  const session = cached || fromState || fetched;

  // ── Animated score reveal ──────────────────────────────────────
  const overall = session?.feedback?.overall ?? 0;
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    if (!session) return;
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const elapsed = Math.min((t - start) / 900, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setDisplayScore(Math.round(eased * overall));
      if (elapsed < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [overall, session]);

  const radarData = useMemo(() => {
    const scores = session?.feedback?.scores || {};
    return Object.entries(scores).map(([axis, value]) => ({ axis, value }));
  }, [session]);

  if (fetchStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Spinner label="Loading session…" />
      </div>
    );
  }

  if (!session) {
    return (
      <EmptyState
        title="Session not found"
        description="This session doesn't exist on the server, or you don't have access to it."
        action={
          <Link to="/practice"><Button variant="brand" rightIcon={<ArrowRight className="w-4 h-4" />}>Back to practice</Button></Link>
        }
      />
    );
  }

  const fillerData = analyzeFillers(session.transcript || '');
  const wpm = session.wpm || 0;
  const pace = wpmInfo(wpm);
  const scoreTone = scoreColor(overall);
  const feedback = session.feedback || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/dashboard"><Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>Dashboard</Button></Link>
          <Badge variant="brand">{domain?.shortLabel}</Badge>
          <span className="text-[12px] text-ink-400">{session.topic} · {session.difficulty}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/interview/${domainId}`} state={{ specificQuestion: session.question }}>
            <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>Retry question</Button>
          </Link>
          <Link to={`/interview/${domainId}`} state={{ skipQuestion: session.question }}>
            <Button variant="brand" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>Next question</Button>
          </Link>
        </div>
      </div>

      {/* ── Score + Radar ───────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 relative overflow-hidden">
          <div className={cn('absolute inset-0 pointer-events-none opacity-[0.18]', `bg-gradient-to-br ${scoreTone.bg}`)} />
          <CardBody className="relative py-8 lg:py-10 flex flex-col lg:flex-row items-start gap-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center lg:text-left"
            >
              <div className="text-[10.5px] uppercase tracking-wider text-ink-300 font-medium">Overall</div>
              <div className={cn(
                'mt-1 font-display tabular-nums leading-none tracking-tighter',
                'text-[88px] sm:text-[112px]',
                scoreTone.text,
              )}>
                {displayScore}
                <span className="text-[26px] text-ink-400 font-normal align-top ml-1">/100</span>
              </div>
              <div className="mt-2 text-[13px] text-ink-200">{scoreTone.label}</div>
              <p className="mt-4 max-w-md text-[12.5px] text-ink-300 leading-relaxed">
                {feedback.summary || 'Your answer has been evaluated below. Read the strengths first — those are leverage. Then the weaknesses, then the suggestions.'}
              </p>
            </motion.div>

            <div className="flex-1 w-full min-w-0">
              {radarData.length > 0 ? <ScoreRadar data={radarData} height={260} /> : <div className="text-[12px] text-ink-400">No breakdown available.</div>}
            </div>
          </CardBody>
        </Card>

        {/* ── Delivery metrics ────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="text-[13px] font-semibold tracking-tight">Delivery</div>
            <p className="text-[11.5px] text-ink-400 mt-0.5">Beyond the model — your own measurable speaking signals.</p>
          </CardHeader>
          <CardBody className="pt-1 space-y-4">
            <Metric icon={Gauge} label="Speaking pace" value={`${wpm} wpm`} tone={pace.tone} hint={pace.label} />
            <Metric
              icon={Volume2}
              label="Filler words"
              value={fillerData.total}
              tone={fillerData.total === 0 ? 'success' : fillerData.total <= 4 ? 'neutral' : 'warning'}
              hint={fillerData.total === 0 ? 'Clean delivery' : `${Math.round((fillerData.total / Math.max(wordCount(session.transcript), 1)) * 100)}% of words`}
            />
            <Metric
              icon={Activity}
              label="Duration"
              value={fmtTime(session.durationSec || 0)}
              tone="neutral"
              hint={`${wordCount(session.transcript || '')} words`}
            />
          </CardBody>
        </Card>
      </section>

      {/* ── Strengths / Weaknesses / Suggestions ────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeedbackList
          title="Strengths"
          tone="success"
          icon={CheckCircle2}
          items={feedback.strengths}
          empty="No specific strengths returned."
        />
        <FeedbackList
          title="Weaknesses"
          tone="danger"
          icon={AlertTriangle}
          items={feedback.weaknesses}
          empty="No specific weaknesses returned."
        />
        <FeedbackList
          title="Suggestions"
          tone="brand"
          icon={Lightbulb}
          items={feedback.suggestions}
          empty="No suggestions returned."
        />
      </section>

      {/* ── Follow-up + Transcript ───────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-tight">
              <MessageCircleQuestion className="w-3.5 h-3.5 text-brand-300" />
              Realistic follow-up
            </div>
            <p className="text-[11.5px] text-ink-400 mt-0.5">What the interviewer would ask next.</p>
          </CardHeader>
          <CardBody className="pt-1">
            <p className="text-[14.5px] text-ink-100 leading-snug">
              {feedback.followUp || 'No follow-up generated.'}
            </p>
            {feedback.followUp && (
              <div className="mt-4 flex items-center gap-2">
                <Link to={`/interview/${domainId}`}>
                  <Button variant="glass" size="sm" leftIcon={<Mic className="w-3.5 h-3.5" />}>Practice this next</Button>
                </Link>
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold tracking-tight">Your transcript</div>
                <p className="text-[11.5px] text-ink-400 mt-0.5">Filler words highlighted in orange.</p>
              </div>
              {feedback.communication && (
                <Badge variant="outline">{feedback.communication.tone} · {feedback.communication.pacing}</Badge>
              )}
            </div>
          </CardHeader>
          <CardBody className="pt-1">
            <div className="max-h-[280px] overflow-y-auto rounded-lg bg-white/[0.025] border border-white/[0.05] p-4">
              <Transcript text={session.transcript} fillerIndices={fillerData.fillerIndices} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-ink-400">
              <span>{wordCount(session.transcript || '')} words · {fmtTime(session.durationSec || 0)}</span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-brand-300" />
                Saved to your interview history
              </span>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* ── Question reference ──────────────────────────────────── */}
      <Card>
        <CardBody className="py-5">
          <div className="text-[10.5px] uppercase tracking-wider text-ink-400 font-medium">Question</div>
          <p className="mt-1.5 text-[14.5px] text-ink-100 leading-snug">{session.question}</p>
        </CardBody>
      </Card>
    </div>
  );
}

function Transcript({ text, fillerIndices }) {
  if (!text) return <p className="text-[12.5px] text-ink-400 italic">No transcript available for this session.</p>;
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <p className="text-[13.5px] leading-relaxed text-ink-100">
      {words.map((w, i) => (
        <span key={i} className={fillerIndices?.has?.(i) ? 'text-warning-400' : 'text-ink-100'}>
          {w}{' '}
        </span>
      ))}
    </p>
  );
}

function FeedbackList({ title, items, icon: Icon, tone, empty }) {
  const toneClass = {
    success: 'text-success-400',
    danger:  'text-danger-400',
    brand:   'text-brand-300',
  }[tone];

  return (
    <Card>
      <CardHeader>
        <div className={cn('inline-flex items-center gap-2 text-[13px] font-semibold tracking-tight', toneClass)}>
          <Icon className="w-3.5 h-3.5" />
          {title}
        </div>
      </CardHeader>
      <CardBody className="pt-1">
        {Array.isArray(items) && items.length > 0 ? (
          <ul className="space-y-2.5">
            {items.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                className="text-[13px] text-ink-200 leading-relaxed flex items-start gap-2.5"
              >
                <span className={cn('mt-1.5 inline-block w-1.5 h-1.5 rounded-full shrink-0', tone === 'success' ? 'bg-success-400' : tone === 'danger' ? 'bg-danger-400' : 'bg-brand-300')} />
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-[12.5px] text-ink-400">{empty}</p>
        )}
      </CardBody>
    </Card>
  );
}

function Metric({ icon: Icon, label, value, hint, tone }) {
  const toneClass = {
    success: 'text-success-400',
    warning: 'text-warning-400',
    danger:  'text-danger-400',
    neutral: 'text-ink-200',
  }[tone || 'neutral'];

  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.05] grid place-items-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-ink-300" />
      </div>
      <div className="flex-1">
        <div className="text-[11.5px] uppercase tracking-wider text-ink-400">{label}</div>
        <div className={cn('text-[20px] font-semibold tracking-tight tabular-nums', toneClass)}>{value}</div>
        {hint && <div className="text-[11px] text-ink-400 mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}

function scoreColor(score) {
  if (score >= 85) return { label: 'Excellent',   text: 'text-success-400', bg: 'from-success-500/30 to-cyan-500/10' };
  if (score >= 70) return { label: 'Strong',      text: 'text-cyan-400',    bg: 'from-cyan-500/30 to-brand-500/10' };
  if (score >= 55) return { label: 'Developing',  text: 'text-brand-300',   bg: 'from-brand-500/30 to-fuchsia-500/10' };
  if (score >= 40) return { label: 'Needs work',  text: 'text-warning-400', bg: 'from-warning-500/30 to-rose-500/10' };
  return                 { label: 'Rework this',  text: 'text-danger-400',  bg: 'from-danger-500/30 to-rose-500/10' };
}
