import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils.js';

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}
    >
      <div className="relative mb-5 inline-grid place-items-center">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/30 to-cyan-500/20 blur-2xl opacity-50" />
        <div className="relative w-14 h-14 grid place-items-center rounded-2xl glass-subtle border-white/[0.08]">
          <Icon className="w-6 h-6 text-ink-300" />
        </div>
      </div>
      <h3 className="text-[15px] font-semibold text-ink-100 tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 text-[13px] text-ink-300 max-w-md leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
