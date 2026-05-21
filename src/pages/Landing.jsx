import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Mic,
  BarChart3,
  Brain,
  ShieldCheck,
  Activity,
  Github,
  CheckCircle2,
} from 'lucide-react';

import Logo from '@/components/ui/Logo.jsx';
import Button from '@/components/ui/Button.jsx';
import { DOMAINS } from '@/lib/domains.js';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
};

const FEATURES = [
  {
    icon: Mic,
    title: 'Speak naturally, get evaluated',
    description:
      'Live transcription, audio replay, filler-word detection, and pace analysis — all without you typing a thing.',
  },
  {
    icon: Brain,
    title: 'Structured, contextual AI feedback',
    description:
      'Strengths, weaknesses, and concrete suggestions calibrated to the domain, topic, and difficulty of the question.',
  },
  {
    icon: BarChart3,
    title: 'Longitudinal analytics that actually help',
    description:
      'See how you trend across content, structure, clarity, confidence, and communication — and where the weak topics live.',
  },
  {
    icon: ShieldCheck,
    title: 'Practice that respects your privacy',
    description:
      'No accounts, no telemetry, no servers between you and your data. Sessions live on your device and export with one click.',
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ── Aurora backdrop ─────────────────────────────────────── */}
      <div className="absolute inset-0 -z-10 grid-bg opacity-[0.18]" />
      <div className="aurora-bg -z-10" />

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-ink-950/40 border-b border-white/[0.04]">
        <nav className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
          <Logo size={26} />
          <div className="hidden sm:flex items-center gap-6 text-[13px] text-ink-300">
            <a href="#features" className="hover:text-ink-100 transition-colors">Features</a>
            <a href="#domains"  className="hover:text-ink-100 transition-colors">Domains</a>
            <a href="#how"      className="hover:text-ink-100 transition-colors">How it works</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Open app</Button>
            </Link>
            <Link to="/practice">
              <Button variant="brand" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Start practicing
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative pt-20 lg:pt-32 pb-20 lg:pb-28">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 text-center"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 h-7 rounded-full chip text-ink-200"
          >
            <Sparkles className="w-3 h-3 text-brand-300" />
            Domain-specific AI interview simulator
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-[42px] sm:text-[58px] lg:text-[72px] font-semibold tracking-tighter leading-[1.02]"
          >
            <span className="text-gradient">Interview practice</span>
            <br />
            <span className="text-gradient-brand">that gets you better.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-2xl mx-auto text-[15px] sm:text-[17px] leading-relaxed text-ink-300"
          >
            InterPrep runs realistic, domain-aware mock interviews — from DSA and system design to ML
            and behavioral — with structured AI feedback that names specifically what to fix.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/practice">
              <Button variant="brand" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start a free mock interview
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="glass" size="lg">See the dashboard</Button>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-ink-400"
          >
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success-400" />No sign-up</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success-400" />Live transcription</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success-400" />Bring-your-own AI key</span>
          </motion.div>
        </motion.div>

        {/* Floating hero card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="relative max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 mt-16"
        >
          <div className="relative glass-strong rounded-3xl p-1.5">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500/30 via-transparent to-cyan-500/20 opacity-50 pointer-events-none -z-10 blur-2xl" />
            <div className="rounded-[20px] bg-ink-950 overflow-hidden border border-white/[0.04]">
              <div className="flex items-center gap-1.5 px-4 h-8 border-b border-white/[0.04]">
                <span className="w-2.5 h-2.5 rounded-full bg-ink-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-ink-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-ink-500" />
                <span className="ml-2 text-[11px] text-ink-400">interprep.app / interview / system-design</span>
              </div>
              <HeroPreview />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section id="features" className="relative py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl">
            <Badge label="Why InterPrep" />
            <h2 className="mt-3 text-[34px] sm:text-[44px] font-semibold tracking-tighter text-gradient">
              Built like a real interview, not a quiz.
            </h2>
            <p className="mt-3 text-[15px] text-ink-300 leading-relaxed">
              Every feature is in service of one thing: making the next interview you take feel easier than the last one.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="glass rounded-2xl p-6 hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/30 to-cyan-500/10 grid place-items-center mb-4">
                  <f.icon className="w-[18px] h-[18px] text-brand-200" />
                </div>
                <h3 className="text-[16px] font-semibold tracking-tight text-ink-100">{f.title}</h3>
                <p className="mt-1.5 text-[13.5px] text-ink-300 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Domains ─────────────────────────────────────────────── */}
      <section id="domains" className="relative py-24 bg-gradient-to-b from-transparent via-ink-900/30 to-transparent">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl">
            <Badge label="Domains" />
            <h2 className="mt-3 text-[34px] sm:text-[44px] font-semibold tracking-tighter text-gradient">
              Six tracks. Hundreds of follow-ups.
            </h2>
            <p className="mt-3 text-[15px] text-ink-300 leading-relaxed">
              Each domain has its own question bank, evaluation rubric, and difficulty progression — calibrated to
              the kind of feedback that actually exists in those interviews.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {DOMAINS.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="glass rounded-2xl p-5 group"
              >
                <div className={`text-[10.5px] uppercase tracking-wider font-medium bg-gradient-to-r ${d.accent} bg-clip-text text-transparent`}>
                  {d.shortLabel}
                </div>
                <div className="mt-2 text-[16.5px] font-semibold text-ink-100 tracking-tight">{d.label}</div>
                <p className="mt-1.5 text-[13px] text-ink-300 leading-relaxed line-clamp-3">{d.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {d.skills.slice(0, 4).map((s) => (
                    <span key={s} className="chip">{s}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section id="how" className="relative py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl">
            <Badge label="How it works" />
            <h2 className="mt-3 text-[34px] sm:text-[44px] font-semibold tracking-tighter text-gradient">
              Pick a domain. Talk. Get better.
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: '01',
                title: 'Choose a domain',
                desc:  'Pick the kind of interview you\'re prepping for and the difficulty band you want.',
              },
              {
                step: '02',
                title: 'Answer out loud',
                desc:  'A timer, a live transcript, and a clean distraction-free interface. Press Space to start.',
              },
              {
                step: '03',
                title: 'Read structured feedback',
                desc:  'Scores, strengths, weaknesses, and a realistic follow-up the interviewer would have asked.',
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="glass rounded-2xl p-6"
              >
                <div className="text-[10.5px] tracking-wider text-brand-300 font-medium">STEP {s.step}</div>
                <div className="mt-2 text-[18px] font-semibold tracking-tight">{s.title}</div>
                <p className="mt-2 text-[13.5px] text-ink-300 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────── */}
      <section className="relative py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                quote: 'It catches the things my friends are too polite to mention. Filler words, hand-wavy reasoning, the works.',
                name:  'Anika R.',
                role:  'New Grad SWE',
              },
              {
                quote: 'I used InterPrep on the bus to onsites. The follow-up questions it generates are uncomfortably realistic.',
                name:  'Devin P.',
                role:  'Backend Engineer',
              },
              {
                quote: 'Best part isn\'t the AI score — it\'s seeing my own transcript while listening back. Brutal in a good way.',
                name:  'Mira S.',
                role:  'MLE Candidate',
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="glass rounded-2xl p-6"
              >
                <Activity className="w-4 h-4 text-brand-300 mb-3" />
                <p className="text-[14px] text-ink-100 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 text-[12px] text-ink-300">
                  <span className="text-ink-100 font-medium">{t.name}</span> · {t.role}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="glass-strong rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 -z-10 opacity-30 bg-aurora animate-aurora" />
            <h2 className="text-[34px] sm:text-[42px] font-semibold tracking-tighter text-gradient">
              Ready when you are.
            </h2>
            <p className="mt-3 text-[15px] text-ink-300 max-w-xl mx-auto leading-relaxed">
              Start with one warm-up question. You can always quit. Nothing to install. Nothing to log into.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link to="/practice">
                <Button variant="brand" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start practicing
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="glass" size="lg">Open dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] py-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size={22} />
            <span className="text-[11.5px] text-ink-400">© {new Date().getFullYear()} InterPrep</span>
          </div>
          <div className="flex items-center gap-4 text-[12.5px] text-ink-400">
            <a href="#features" className="hover:text-ink-100 transition-colors">Features</a>
            <a href="#domains" className="hover:text-ink-100 transition-colors">Domains</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-ink-100 transition-colors">
              <Github className="w-3.5 h-3.5" /> Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Badge({ label }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full chip">
      <span className="w-1 h-1 rounded-full bg-brand-300" />
      {label}
    </span>
  );
}

/** A static "what the product looks like" preview slot in the hero. */
function HeroPreview() {
  return (
    <div className="grid md:grid-cols-2 gap-0">
      <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/[0.04]">
        <div className="text-[10.5px] uppercase tracking-wider text-brand-300 font-medium">System Design · Standard</div>
        <h3 className="mt-2 text-[18px] font-semibold tracking-tight text-ink-100">
          Design a typeahead / autocomplete service. What data structures back it, and how do you keep results fresh?
        </h3>
        <div className="mt-4 text-[12.5px] text-ink-400 inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-danger-400 animate-pulseSoft" />
          Recording · 01:24
        </div>
        <div className="mt-5 text-[13px] text-ink-200 leading-relaxed">
          <span className="text-ink-300">A typeahead service has to be optimized for read latency, so I&rsquo;d start with </span>
          <span className="text-brand-200">a prefix trie</span>
          <span className="text-ink-300"> in memory, fronted by an LRU of </span>
          <span className="text-brand-200">hot prefixes</span>
          <span className="text-ink-300">, with background re-indexing from the query log...</span>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="text-[10.5px] uppercase tracking-wider text-cyan-400 font-medium">Live Evaluation</div>
        <div className="mt-3 grid grid-cols-2 gap-2.5 text-[12px]">
          {[
            ['Content',     86],
            ['Structure',   78],
            ['Clarity',     82],
            ['Confidence',  74],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg p-3 bg-white/[0.03] border border-white/[0.05]">
              <div className="text-ink-300">{k}</div>
              <div className="mt-1 text-[24px] font-semibold tracking-tight text-gradient-brand tabular-nums">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <div className="text-[11.5px] uppercase tracking-wider text-ink-400 font-medium mb-2">Suggestion</div>
          <p className="text-[13px] text-ink-100 leading-relaxed">
            Lead with the read/write ratio before diving into data structures — interviewers want the trade-off framing first.
          </p>
        </div>
      </div>
    </div>
  );
}
