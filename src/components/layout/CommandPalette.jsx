import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Sparkles, BarChart3, Library, Settings as SettingsIcon, ArrowRight } from 'lucide-react';
import { DOMAINS } from '@/lib/domains.js';
import { cn } from '@/lib/utils.js';

const STATIC_ITEMS = [
  { id: 'go-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, kind: 'route',    to: '/dashboard' },
  { id: 'go-practice',  label: 'Start a Practice Interview', icon: Sparkles, kind: 'route', to: '/practice' },
  { id: 'go-analytics', label: 'Open Analytics', icon: BarChart3, kind: 'route',           to: '/analytics' },
  { id: 'go-library',   label: 'Open Question Library', icon: Library, kind: 'route',      to: '/library' },
  { id: 'go-settings',  label: 'Open Settings', icon: SettingsIcon, kind: 'route',         to: '/settings' },
];

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const items = useMemo(() => {
    const domainItems = DOMAINS.map((d) => ({
      id: `dom-${d.id}`,
      label: `Practice: ${d.label}`,
      hint: d.shortLabel,
      icon: Sparkles,
      kind: 'route',
      to: `/interview/${d.id}`,
    }));
    return [...STATIC_ITEMS, ...domainItems];
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((it) => it.label.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  const run = (item) => {
    if (!item) return;
    if (item.kind === 'route') navigate(item.to);
    onClose?.();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(filtered[active]);
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[150] flex items-start justify-center p-4 pt-[12vh]"
        >
          <div className="absolute inset-0 bg-black/65 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl glass-strong rounded-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3 px-4 h-[52px] border-b border-white/[0.06]">
              <Search className="w-4 h-4 text-ink-300" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Jump to a page, start a domain practice…"
                className="bg-transparent flex-1 outline-none text-[14px] placeholder:text-ink-400 text-ink-100"
              />
              <span className="kbd text-[10px]">ESC</span>
            </div>
            <div className="max-h-[58vh] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-4 py-8 text-center text-[12.5px] text-ink-400">No matches.</p>
              ) : (
                filtered.map((item, idx) => {
                  const Icon = item.icon || ArrowRight;
                  const isActive = idx === active;
                  return (
                    <button
                      key={item.id}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => run(item)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 h-11 text-left',
                        'text-[13px] transition-colors',
                        isActive ? 'bg-white/[0.06] text-ink-100' : 'text-ink-200 hover:bg-white/[0.04]',
                      )}
                    >
                      <Icon className={cn('w-[15px] h-[15px]', isActive ? 'text-brand-300' : 'text-ink-400')} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.hint && <span className="text-[11px] text-ink-400">{item.hint}</span>}
                      <ArrowRight className={cn('w-[14px] h-[14px]', isActive ? 'text-brand-300' : 'text-ink-500')} />
                    </button>
                  );
                })
              )}
            </div>
            <div className="px-4 h-9 border-t border-white/[0.06] flex items-center gap-3 text-[11px] text-ink-400">
              <span className="inline-flex items-center gap-1.5"><span className="kbd">↑</span><span className="kbd">↓</span> navigate</span>
              <span className="inline-flex items-center gap-1.5"><span className="kbd">↵</span> select</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
