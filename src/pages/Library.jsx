import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Filter, Pencil, Trash2, FileText, Library as LibraryIcon, ArrowRight,
  RefreshCcw, AlertCircle,
} from 'lucide-react';

import Card, { CardBody, CardHeader } from '@/components/ui/Card.jsx';
import Button from '@/components/ui/Button.jsx';
import Badge from '@/components/ui/Badge.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import Spinner from '@/components/ui/Spinner.jsx';
import Modal from '@/components/ui/Modal.jsx';
import { useToast } from '@/components/ui/Toast.jsx';

import { DOMAINS, DIFFICULTIES } from '@/lib/domains.js';
import { cn } from '@/lib/utils.js';
import { listQuestions, createQuestion, updateQuestion, deleteQuestion } from '@/lib/api.js';
import { useAuth } from '@/context/AuthContext.jsx';

/**
 * Library — server-backed question management.
 *
 * Every user sees the full bank (built-in + their own custom).
 *   - Built-in questions are read-only for `user` and editable for `admin`.
 *   - Custom questions belong to the creating user (or are global if an
 *     admin sets `isBuiltIn` true at creation time — done via the admin UI).
 */
export default function Library() {
  const toast = useToast();
  const { isAdmin } = useAuth();

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);

  const [domainFilter, setDomainFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('all'); // all | mine
  const [editing, setEditing] = useState(null); // { mode: 'new'|'edit', question }

  const reload = async () => {
    setStatus('loading'); setError(null);
    try {
      const params = { limit: 200 };
      if (domainFilter !== 'all') params.domain = domainFilter;
      if (difficultyFilter !== 'all') params.difficulty = difficultyFilter.replace(/^./, (c) => c.toUpperCase());
      if (query) params.q = query;
      if (scope === 'mine') params.mine = '1';

      const res = await listQuestions(params);
      setItems(res.items || []);
      setStatus('ready');
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [domainFilter, difficultyFilter, scope]);

  const stats = useMemo(() => ({
    total: items.length,
    custom: items.filter((q) => !q.isBuiltIn).length,
    builtIn: items.filter((q) => q.isBuiltIn).length,
  }), [items]);

  const openNew = () => setEditing({
    mode: 'new',
    question: {
      domain: DOMAINS[0].id,
      topic: 'General',
      difficulty: 'Medium',
      question: '',
      timeLimit: 120,
    },
  });

  const openEdit = (q) => setEditing({
    mode: 'edit',
    question: {
      id: q.id || q._id,
      domain: q.domain?.slug || q.domain,
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question,
      timeLimit: q.timeLimit,
      isBuiltIn: q.isBuiltIn,
    },
  });

  const onSave = async () => {
    const q = editing.question;
    if (!q.question || q.question.trim().length < 10) {
      toast.push({ type: 'error', title: 'Question too short', description: 'Please write a full question.' });
      return;
    }
    try {
      if (editing.mode === 'new') {
        await createQuestion({
          domain: q.domain,
          topic: q.topic,
          difficulty: q.difficulty,
          question: q.question.trim(),
          timeLimit: Number(q.timeLimit) || 120,
        });
        toast.push({ type: 'success', title: 'Created', description: 'New question added to your library.' });
      } else {
        await updateQuestion(q.id, {
          domain: q.domain,
          topic: q.topic,
          difficulty: q.difficulty,
          question: q.question.trim(),
          timeLimit: Number(q.timeLimit) || 120,
        });
        toast.push({ type: 'success', title: 'Saved', description: 'Edits saved.' });
      }
      setEditing(null);
      reload();
    } catch (e) {
      toast.push({ type: 'error', title: 'Save failed', description: e.message });
    }
  };

  const onDelete = async (q) => {
    if (!window.confirm('Remove this question from the library?')) return;
    try {
      await deleteQuestion(q.id || q._id);
      toast.push({ type: 'info', title: 'Removed', description: 'Question hidden from the library.' });
      reload();
    } catch (e) {
      toast.push({ type: 'error', title: 'Delete failed', description: e.message });
    }
  };

  const canEdit = (q) => isAdmin || (!q.isBuiltIn && q.createdBy);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11.5px] uppercase tracking-wider text-brand-300 font-medium">Library</div>
          <h1 className="mt-1 text-[28px] sm:text-[34px] font-semibold tracking-tighter text-gradient">
            Manage your question bank.
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-300 max-w-xl">
            Add custom questions, browse the built-in seed bank, and curate what you practice with. Custom questions are tied to your account.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={reload}>Refresh</Button>
          <Button variant="brand" size="md" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={openNew}>
            New question
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <StatChip label="Showing"  value={stats.total} />
        <StatChip label="Built-in" value={stats.builtIn} />
        <StatChip label="Custom"   value={stats.custom} tone="brand" />
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="py-4 flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3 h-9 rounded-lg bg-white/[0.03] border border-white/[0.05] flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && reload()}
              placeholder="Search questions or topics (press Enter)…"
              className="bg-transparent flex-1 outline-none text-[13px] placeholder:text-ink-400 text-ink-100"
            />
          </div>

          <Select label="Domain" value={domainFilter} onChange={setDomainFilter}
            options={[{ value: 'all', label: 'All domains' }, ...DOMAINS.map((d) => ({ value: d.id, label: d.label }))]}
          />
          <Select label="Difficulty" value={difficultyFilter} onChange={setDifficultyFilter}
            options={[{ value: 'all', label: 'All' }, ...DIFFICULTIES.map((d) => ({ value: d.id, label: d.label }))]}
          />
          <Select label="Scope" value={scope} onChange={setScope}
            options={[{ value: 'all', label: 'All questions' }, { value: 'mine', label: 'My custom only' }]}
          />
        </CardBody>
      </Card>

      {/* List */}
      {status === 'loading' ? (
        <div className="flex items-center justify-center py-14"><Spinner label="Loading…" /></div>
      ) : status === 'error' ? (
        <Card>
          <CardBody className="py-6">
            <div className="rounded-xl bg-danger-500/10 border border-danger-500/30 px-4 py-3 text-[12.5px] text-danger-400 inline-flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5" /><span>{error}</span>
            </div>
            <div className="mt-3"><Button variant="ghost" size="sm" leftIcon={<RefreshCcw className="w-3 h-3" />} onClick={reload}>Retry</Button></div>
          </CardBody>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No questions match your filters"
          description="Try clearing the search or switching to All domains."
        />
      ) : (
        <ul className="space-y-2.5">
          {items.map((q, i) => {
            const domSlug = q.domain?.slug || q.domain;
            const domLabel = DOMAINS.find((d) => d.id === domSlug)?.shortLabel || (q.domain?.shortLabel || domSlug);
            return (
              <motion.li
                key={q.id || q._id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.015, 0.4) }}
                className="glass rounded-xl p-4 flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.05] grid place-items-center text-ink-300">
                  <LibraryIcon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <Badge variant="brand">{domLabel}</Badge>
                    <Badge variant="outline">{q.difficulty}</Badge>
                    <Badge variant="default">{q.topic}</Badge>
                    {q.isBuiltIn ? <Badge variant="default">Built-in</Badge> : <Badge variant="success">Custom</Badge>}
                  </div>
                  <p className="text-[13.5px] text-ink-100 leading-snug">{q.question}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button
                    variant="ghost" size="sm"
                    leftIcon={<Pencil className="w-3 h-3" />}
                    disabled={!canEdit(q)}
                    onClick={() => openEdit(q)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    leftIcon={<Trash2 className="w-3 h-3" />}
                    disabled={!canEdit(q)}
                    onClick={() => onDelete(q)}
                  >
                    Remove
                  </Button>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}

      <EditorModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        editing={editing}
        onChange={(patch) => setEditing((e) => ({ ...e, question: { ...e.question, ...patch } }))}
        onSave={onSave}
      />
    </div>
  );
}

function EditorModal({ open, onClose, editing, onChange, onSave }) {
  if (!editing) return null;
  const q = editing.question;
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing.mode === 'new' ? 'New question' : 'Edit question'}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="brand" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />} onClick={onSave}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Domain">
            <select
              value={q.domain}
              onChange={(e) => onChange({ domain: e.target.value })}
              className="w-full h-9 px-3 rounded-lg bg-ink-900/60 border border-white/[0.06] text-[13px] text-ink-100 outline-none focus:border-brand-500/40"
            >
              {DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </Field>
          <Field label="Difficulty">
            <select
              value={q.difficulty}
              onChange={(e) => onChange({ difficulty: e.target.value })}
              className="w-full h-9 px-3 rounded-lg bg-ink-900/60 border border-white/[0.06] text-[13px] text-ink-100 outline-none focus:border-brand-500/40"
            >
              {['Easy', 'Medium', 'Hard'].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Topic">
            <input
              value={q.topic}
              onChange={(e) => onChange({ topic: e.target.value })}
              className="w-full h-9 px-3 rounded-lg bg-ink-900/60 border border-white/[0.06] text-[13px] text-ink-100 outline-none focus:border-brand-500/40"
            />
          </Field>
          <Field label="Suggested time (seconds)">
            <input
              type="number"
              value={q.timeLimit}
              onChange={(e) => onChange({ timeLimit: Math.max(15, Math.min(600, parseInt(e.target.value || 0, 10))) })}
              className="w-full h-9 px-3 rounded-lg bg-ink-900/60 border border-white/[0.06] text-[13px] text-ink-100 outline-none focus:border-brand-500/40"
            />
          </Field>
        </div>
        <Field label="Question">
          <textarea
            value={q.question}
            onChange={(e) => onChange({ question: e.target.value })}
            rows={5}
            className="w-full px-3 py-2 rounded-lg bg-ink-900/60 border border-white/[0.06] text-[13.5px] text-ink-100 outline-none focus:border-brand-500/40 leading-relaxed resize-none"
          />
        </Field>
      </div>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11.5px] uppercase tracking-wider text-ink-400">{label}</span>
      {children}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="inline-flex items-center gap-2 h-9">
      <Filter className="w-3.5 h-3.5 text-ink-400" />
      <span className="text-[11.5px] text-ink-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 pl-2.5 pr-7 rounded-lg bg-ink-900/60 border border-white/[0.06] text-[12.5px] text-ink-100 outline-none focus:border-brand-500/40"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function StatChip({ label, value, tone = 'default' }) {
  const toneClass = {
    default: 'text-ink-100',
    brand:   'text-brand-300',
  }[tone];

  return (
    <div className="rounded-xl p-3.5 bg-white/[0.025] border border-white/[0.05]">
      <div className="text-[10.5px] uppercase tracking-wider text-ink-400">{label}</div>
      <div className={cn('mt-1 text-[22px] font-semibold tabular-nums tracking-tight', toneClass)}>{value}</div>
    </div>
  );
}
