import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Binary, Brain, LayoutTemplate, Network, Server, Users, Filter } from 'lucide-react';

import { DOMAINS, DIFFICULTIES, getQuestions } from '@/lib/domains.js';
import Button from '@/components/ui/Button.jsx';
import Card from '@/components/ui/Card.jsx';
import Badge from '@/components/ui/Badge.jsx';
import { cn } from '@/lib/utils.js';

const ICONS = { Binary, Brain, LayoutTemplate, Network, Server, Users };

export default function Domains() {
  const [difficulty, setDifficulty] = useState('all');

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="text-[11.5px] uppercase tracking-wider text-brand-300 font-medium">Practice</div>
        <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-tighter text-gradient">
          Pick a domain to interview in.
        </h1>
        <p className="text-[13.5px] text-ink-300 max-w-2xl">
          Each domain has its own question bank and evaluation rubric. Pick warm-up to ease in, or
          senior for trade-off heavy questions.
        </p>
      </header>

      {/* Difficulty filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-400">
          <Filter className="w-3.5 h-3.5" /> Difficulty filter
        </span>
        <DiffPill active={difficulty === 'all'} onClick={() => setDifficulty('all')}>All</DiffPill>
        {DIFFICULTIES.map((d) => (
          <DiffPill key={d.id} active={difficulty === d.id} onClick={() => setDifficulty(d.id)}>
            {d.label}
          </DiffPill>
        ))}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DOMAINS.map((d, i) => {
          const Icon = ICONS[d.iconKey] || Binary;
          const questions = getQuestions(d.id);
          const filteredCount = difficulty === 'all'
            ? questions.length
            : questions.filter((q) => q.difficulty.toLowerCase() === difficulty).length;

          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <Card className="group relative overflow-hidden hover:bg-white/[0.04] transition-colors h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${d.accent} opacity-[0.07] group-hover:opacity-[0.13] transition-opacity pointer-events-none`} />
                <div className="relative p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${d.accent} grid place-items-center text-ink-950`}>
                      <Icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
                    </div>
                    <Badge variant="outline">{filteredCount} questions</Badge>
                  </div>

                  <h3 className="mt-5 text-[18px] font-semibold tracking-tight text-ink-100">{d.label}</h3>
                  <p className="mt-1.5 text-[13px] text-ink-300 leading-relaxed">{d.blurb}</p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {d.skills.map((s) => (
                      <span key={s} className="chip">{s}</span>
                    ))}
                  </div>

                  <div className="flex-1" />

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[11.5px] text-ink-400">{d.tagline}</span>
                    <Link to={`/interview/${d.id}${difficulty !== 'all' ? `?difficulty=${difficulty}` : ''}`}>
                      <Button variant="brand" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Start
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}

function DiffPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-7 px-3 rounded-full border text-[11.5px] font-medium transition-colors',
        active
          ? 'bg-brand-500/15 border-brand-500/30 text-brand-200'
          : 'bg-white/[0.03] border-white/[0.06] text-ink-300 hover:border-white/[0.12] hover:text-ink-100',
      )}
    >
      {children}
    </button>
  );
}
