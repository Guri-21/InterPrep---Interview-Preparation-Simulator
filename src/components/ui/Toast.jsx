import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils.js';

const ToastContext = createContext({ push: () => {}, dismiss: () => {} });

const ICONS = {
  success: CheckCircle2,
  error:   AlertTriangle,
  info:    Info,
};

const TONES = {
  success: 'border-success-500/30 text-success-400',
  error:   'border-danger-500/30 text-danger-400',
  info:    'border-brand-500/30 text-brand-300',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = Math.random().toString(36).slice(2);
      const item = { id, type: 'info', duration: 4500, ...toast };
      setToasts((t) => [...t, item]);
      if (item.duration > 0) setTimeout(() => dismiss(id), item.duration);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[360px] w-[calc(100vw-2rem)] pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || Info;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'glass-strong rounded-xl border px-3.5 py-3 flex items-start gap-2.5 pointer-events-auto',
                  TONES[t.type] || TONES.info,
                )}
              >
                <Icon className="w-[16px] h-[16px] mt-[2px] shrink-0 text-current" />
                <div className="flex-1">
                  {t.title && <div className="text-[13.5px] font-medium text-ink-100">{t.title}</div>}
                  {t.description && (
                    <div className="text-[12.5px] text-ink-300 mt-0.5 leading-relaxed">{t.description}</div>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-ink-400 hover:text-ink-100 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
