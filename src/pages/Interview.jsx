import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Mic, Square, Sparkles, RotateCcw,
  AlertCircle, Loader2, Wand2, Volume2, Type,
} from 'lucide-react';

import Card, { CardBody, CardHeader } from '@/components/ui/Card.jsx';
import Button from '@/components/ui/Button.jsx';
import Badge from '@/components/ui/Badge.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import Timer from '@/components/interview/Timer.jsx';
import Waveform from '@/components/interview/Waveform.jsx';
import TranscriptView from '@/components/interview/TranscriptView.jsx';

import useSpeechRecorder, { analyzeFillers } from '@/hooks/useSpeechRecorder.js';
import useSessions from '@/hooks/useSessions.js';
import useKeyShortcut from '@/hooks/useKeyShortcut.js';
import { useToast } from '@/components/ui/Toast.jsx';

import { getDomain, getQuestions, filterByDifficulty } from '@/lib/domains.js';
import { analyzeAndPersist } from '@/lib/api.js';
import { cn, wordCount, fmtLimit } from '@/lib/utils.js';

const STEPS = ['Question', 'Record', 'Evaluate'];

export default function Interview() {
  const { domainId } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { reload: reloadSessions } = useSessions();

  const domain = getDomain(domainId);

  const difficultyFilter = search.get('difficulty') || 'all';
  // Question bank is sourced from the static, seed-aligned bank — this is the
  // same data the backend has in Mongo (see backend/src/seed/seedData.js).
  // The interview record is created server-side when we POST the answer.
  const allQuestions = useMemo(
    () => filterByDifficulty(getQuestions(domainId), difficultyFilter),
    [domainId, difficultyFilter],
  );

  const [qIndex, setQIndex] = useState(() => {
    if (!allQuestions || allQuestions.length === 0) return 0;
    
    const state = location.state;
    if (state?.specificQuestion) {
      const idx = allQuestions.findIndex(q => q.question === state.specificQuestion);
      if (idx !== -1) return idx;
    }
    
    // Pick a random question by default so it varies per session
    let nextIdx = Math.floor(Math.random() * allQuestions.length);
    
    // If we're coming from the results page and skipped a question, ensure we don't repeat it
    if (state?.skipQuestion && allQuestions.length > 1) {
      while (allQuestions[nextIdx].question === state.skipQuestion) {
        nextIdx = Math.floor(Math.random() * allQuestions.length);
      }
    }
    return nextIdx;
  });
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [inputMode, setInputMode] = useState('voice'); // 'voice' | 'text'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const q = allQuestions[qIndex];
  const recorder = useSpeechRecorder();

  // ── Timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 1 || !recorder.isRecording) return undefined;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [step, recorder.isRecording]);

  // Auto-stop at 1.5× the suggested time limit.
  useEffect(() => {
    if (step === 1 && recorder.isRecording && q && elapsed >= q.timeLimit * 1.5) {
      handleStop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, step, recorder.isRecording]);

  // Voice-mode auto-evaluation: once we hit step 2 in voice mode and the
  // hook has committed its final transcript, fire the analysis exactly once.
  useEffect(() => {
    if (step !== 2 || inputMode !== 'voice') return;
    if (autoSubmitted || isAnalyzing || analyzeError) return;
    const final = (recorder.transcript || '').trim();
    if (final.length < 20) return;
    setAutoSubmitted(true);
    submitForEvaluation(final, elapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, inputMode, recorder.transcript, autoSubmitted, isAnalyzing, analyzeError]);

  // ── Keyboard shortcuts ────────────────────────────────────────
  useKeyShortcut('space', () => {
    if (step === 0) setStep(1);
    else if (step === 1 && !recorder.isRecording) handleStart();
    else if (step === 1 && recorder.isRecording) handleStop();
  }, { enabled: !isAnalyzing });

  useKeyShortcut('escape', () => {
    if (step === 1 && recorder.isRecording) recorder.stop();
  });

  if (!domain) {
    return (
      <EmptyState
        title="Domain not found"
        description="That domain doesn't exist. Pick one from the practice page."
        action={
          <Link to="/practice"><Button variant="brand" rightIcon={<ArrowRight className="w-4 h-4" />}>Browse domains</Button></Link>
        }
      />
    );
  }

  if (!q) {
    return (
      <EmptyState
        title="No questions match this filter"
        description="Try removing the difficulty filter or pick a different domain."
        action={
          <Link to="/practice"><Button variant="brand">Back to picker</Button></Link>
        }
      />
    );
  }

  const handleStart = async () => {
    setElapsed(0);
    setAnalyzeError(null);
    await recorder.start();
  };

  const handleStop = () => {
    recorder.stop();
    setStep(2);
  };

  const submitForEvaluation = async (answerText, durationSec) => {
    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const fillerData = analyzeFillers(answerText);
      const wpm = durationSec > 0 ? Math.round((wordCount(answerText) / durationSec) * 60) : 0;

      // Server runs the AI evaluator AND persists the Interview row in one call.
      const interview = await analyzeAndPersist({
        transcript: answerText,
        question: q.question,
        domain: domainId,          // backend resolves slug → ObjectId
        topic: q.topic,
        difficulty: q.difficulty,
        durationSec,
        wpm,
        fillerCount: fillerData.total,
      });

      toast.push({
        type: 'success',
        title: 'Evaluation ready',
        description: `Overall ${interview?.feedback?.overall ?? '—'}/100. Review the breakdown.`,
      });
      // Pull fresh history into the local sessions cache, then navigate.
      reloadSessions();
      navigate(`/interview/${domainId}/results/${interview.id}`, {
        // Pass the freshly-created interview as router state so Results renders
        // immediately, even before the sessions cache hydrates.
        state: { interview },
      });
    } catch (e) {
      setAnalyzeError(e.message || 'Could not evaluate your answer.');
      toast.push({ type: 'error', title: 'Evaluation failed', description: e.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Effective answer text — voice transcript or typed answer.
  const effectiveAnswer = inputMode === 'voice' ? recorder.transcript : typedAnswer;
  const effectiveDuration = inputMode === 'voice' ? elapsed : Math.max(30, Math.round(typedAnswer.length / 18));

  const nextQuestion = () => {
    setQIndex((i) => (i + 1) % allQuestions.length);
    setStep(0);
    setElapsed(0);
    setTypedAnswer('');
    setAutoSubmitted(false);
    setAnalyzeError(null);
    recorder.reset();
  };

  return (
    <div className="space-y-6">
      {/* ── Top context bar ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/practice">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Change domain
            </Button>
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="brand">{domain.shortLabel}</Badge>
            <span className="text-[12px] text-ink-400">Question {qIndex + 1} of {allQuestions.length}</span>
          </div>
        </div>

        <StepIndicator step={step} />
      </div>

      {/* ── Step 0: Question ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="q-step"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <Card className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${domain.accent} opacity-[0.08] pointer-events-none`} />
              <CardBody className="relative py-10 lg:py-14">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand">{q.topic}</Badge>
                  <Badge variant="outline">{q.difficulty}</Badge>
                </div>
                <p className="mt-5 text-[22px] sm:text-[26px] lg:text-[30px] font-semibold tracking-tight leading-snug text-ink-100">
                  {q.question}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[12px] text-ink-300 inline-flex items-center gap-2">
                    <span className="kbd">⏱</span>
                    <span>Aim for ~{fmtLimit(q.timeLimit)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="ghost" size="md" onClick={nextQuestion}>
                      Skip question
                    </Button>
                    <Button variant="brand" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => setStep(1)}>
                      Begin answering
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-400">
                  <span className="kbd">Space</span>
                  <span>to start</span>
                </div>
              </CardBody>
            </Card>

            {/* Tip strip */}
            <div className="rounded-xl px-4 py-3 bg-white/[0.025] border border-white/[0.05] flex items-start gap-3 text-[12.5px] text-ink-300">
              <Wand2 className="w-3.5 h-3.5 text-brand-300 mt-0.5" />
              <p>
                <span className="text-ink-100 font-medium">Tip · </span>
                Lead with the answer in one sentence, then back it up. Interviewers want the conclusion before the chain of reasoning.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Step 1: Record ─────────────────────────────────────── */}
        {step === 1 && (
          <motion.div
            key="r-step"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            {/* Main panel */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2">
                    <Badge variant="brand" dot={recorder.isRecording}>
                      {recorder.isRecording ? 'Recording' : 'Idle'}
                    </Badge>
                    <span className="text-[12.5px] text-ink-300">Answering</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ModeToggle mode={inputMode} onChange={setInputMode} />
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-[16px] text-ink-100 leading-snug">{q.question}</p>

                {inputMode === 'voice' ? (
                  <>
                    <div className="mt-6">
                      <Waveform active={recorder.isRecording} />
                    </div>

                    <div className="mt-4 rounded-xl bg-white/[0.025] border border-white/[0.05] p-4 min-h-[140px]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10.5px] uppercase tracking-wider text-ink-400 font-medium">
                          Live transcript
                        </span>
                        {recorder.transcript && (
                          <span className="text-[10.5px] text-ink-400">
                            {wordCount(recorder.transcript)} words
                          </span>
                        )}
                      </div>
                      <TranscriptView
                        text={recorder.transcript}
                        emptyHint={
                          recorder.isRecording
                            ? 'Start speaking — your words will appear here.'
                            : 'Press Record (or hit Space) to begin.'
                        }
                      />
                    </div>

                    {recorder.error && (
                      <div className="mt-3 rounded-lg bg-danger-500/10 border border-danger-500/30 px-3 py-2 text-[12.5px] text-danger-400 inline-flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5" />
                        <span>{recorder.error}. Click Allow when your browser prompts for microphone access.</span>
                      </div>
                    )}

                    {!recorder.supported && (
                      <p className="mt-2 text-[11.5px] text-ink-400">
                        Live transcription isn't supported in this browser. Audio will still record; switch to typed-answer mode for a transcript.
                      </p>
                    )}
                  </>
                ) : (
                  <textarea
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder="Type your answer here. Aim for the same depth you'd give out loud — full sentences, named concepts."
                    className="mt-6 w-full h-[260px] resize-none bg-ink-900/60 border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-ink-100 leading-relaxed placeholder:text-ink-400 outline-none focus:border-brand-500/40 transition-colors"
                  />
                )}
              </CardBody>
            </Card>

            {/* Side controls */}
            <Card className="lg:col-span-1">
              <CardBody className="space-y-5">
                {inputMode === 'voice' ? (
                  <>
                    <Timer elapsed={elapsed} limit={q.timeLimit} active={recorder.isRecording} />
                    {!recorder.isRecording ? (
                      <Button variant="brand" size="lg" className="w-full" leftIcon={<Mic className="w-4 h-4" />} onClick={handleStart}>
                        Start recording
                      </Button>
                    ) : (
                      <Button variant="danger" size="lg" className="w-full" leftIcon={<Square className="w-3.5 h-3.5" />} onClick={handleStop}>
                        Stop & analyze
                      </Button>
                    )}
                    <div className="text-[11px] text-ink-400 space-y-1.5">
                      <KbdRow label="Toggle record" keys={['Space']} />
                      <KbdRow label="Force stop"    keys={['Esc']} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[12px] text-ink-300 leading-relaxed">
                      Type out your answer as if you were speaking it. The same evaluator runs on the text — strengths, weaknesses, suggestions, and a follow-up question.
                    </div>
                    <Button
                      variant="brand"
                      size="lg"
                      className="w-full"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      disabled={typedAnswer.trim().length < 20 || isAnalyzing}
                      onClick={() => {
                        setStep(2);
                        submitForEvaluation(typedAnswer, effectiveDuration);
                      }}
                    >
                      Evaluate answer
                    </Button>
                    <div className="text-[11.5px] text-ink-400">
                      Minimum 20 characters. Currently {typedAnswer.length}.
                    </div>
                  </>
                )}

                <div className="hairline" />

                <Button variant="ghost" size="sm" className="w-full" onClick={() => setStep(0)}>
                  Back to question
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* ── Step 2: Evaluation pending → Results ──────────────── */}
        {step === 2 && (
          <motion.div
            key="e-step"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <Card>
              <CardBody className="py-12">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-5">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/40 to-cyan-500/30 rounded-full blur-2xl opacity-60 animate-pulseSoft" />
                      <div className="relative w-14 h-14 grid place-items-center rounded-2xl glass-strong">
                        <Sparkles className="w-5 h-5 text-brand-200" />
                      </div>
                    </div>
                    <div className="text-[16px] font-semibold tracking-tight text-ink-100">
                      Evaluating your answer…
                    </div>
                    <div className="mt-1.5 text-[12.5px] text-ink-300 max-w-md leading-relaxed">
                      The model is scoring content, structure, clarity, confidence, and communication. This usually takes 5–15 seconds.
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 text-[12.5px] text-ink-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating strengths, weaknesses, and a realistic follow-up.</span>
                    </div>
                  </div>
                ) : analyzeError ? (
                  <div className="text-center max-w-xl mx-auto">
                    <div className="w-14 h-14 mx-auto grid place-items-center rounded-2xl bg-danger-500/10 border border-danger-500/30 mb-4">
                      <AlertCircle className="w-5 h-5 text-danger-400" />
                    </div>
                    <h3 className="text-[16px] font-semibold tracking-tight text-ink-100">Evaluation failed</h3>
                    <p className="mt-1.5 text-[12.5px] text-ink-300 leading-relaxed">{analyzeError}</p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                      <Button variant="brand" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                        onClick={() => submitForEvaluation(effectiveAnswer, effectiveDuration)}
                      >Retry evaluation</Button>
                      <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Back to recording</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="text-[14px] text-ink-100 mb-1">Ready to evaluate.</div>
                    {(!effectiveAnswer || effectiveAnswer.trim().length < 20) ? (
                      <>
                        <p className="text-[12.5px] text-ink-400 max-w-md mt-1.5 leading-relaxed">
                          Your answer is too short to evaluate. Re-record or switch to typed mode and try again.
                        </p>
                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Back to recording</Button>
                          <Button variant="brand" size="sm" onClick={() => setInputMode('text')}>Switch to typed</Button>
                        </div>
                      </>
                    ) : (
                      <Button
                        variant="brand"
                        size="lg"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                        onClick={() => submitForEvaluation(effectiveAnswer, effectiveDuration)}
                      >
                        Evaluate this answer
                      </Button>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepIndicator({ step }) {
  return (
    <div className="flex items-center gap-3 text-[11.5px]">
      {STEPS.map((label, i) => {
        const isActive = step === i;
        const isDone = step > i;
        return (
          <div key={label} className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center gap-1.5',
                isDone ? 'text-success-400'
                : isActive ? 'text-ink-100'
                : 'text-ink-500',
              )}
            >
              <span className={cn(
                'inline-grid place-items-center w-5 h-5 rounded-full text-[10px] font-medium',
                isDone ? 'bg-success-500/20 border border-success-500/30'
                : isActive ? 'bg-brand-500/20 border border-brand-500/30 text-brand-200'
                : 'bg-white/[0.03] border border-white/[0.06] text-ink-400',
              )}>
                {isDone ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < STEPS.length - 1 && <span className="w-6 h-px bg-white/[0.08]" />}
          </div>
        );
      })}
    </div>
  );
}

function ModeToggle({ mode, onChange }) {
  return (
    <div className="inline-flex p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
      <ToggleButton active={mode === 'voice'} onClick={() => onChange('voice')} icon={Volume2} label="Voice" />
      <ToggleButton active={mode === 'text'}  onClick={() => onChange('text')}  icon={Type}    label="Type" />
    </div>
  );
}

function ToggleButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11.5px] font-medium transition-colors',
        active ? 'bg-white/[0.07] text-ink-100' : 'text-ink-400 hover:text-ink-200',
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}

function KbdRow({ label, keys }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="inline-flex items-center gap-1">{keys.map((k) => <span key={k} className="kbd">{k}</span>)}</span>
    </div>
  );
}
