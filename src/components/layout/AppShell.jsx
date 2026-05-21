import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Sparkles, BarChart3, Library, Settings as SettingsIcon,
  Search, Menu, X, Command, ShieldCheck, LogOut, ChevronUp,
} from 'lucide-react';

import Logo from '@/components/ui/Logo.jsx';
import Button from '@/components/ui/Button.jsx';
import CommandPalette from '@/components/layout/CommandPalette.jsx';
import { cn } from '@/lib/utils.js';
import { useAuth } from '@/context/AuthContext.jsx';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/practice',  label: 'Practice',  icon: Sparkles },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/library',   label: 'Library',   icon: Library },
  { to: '/settings',  label: 'Settings',  icon: SettingsIcon },
];

export default function AppShell({ children }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // ⌘K / Ctrl-K → open palette.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Sidebar (desktop) ───────────────────────────────────── */}
      <aside className="hidden lg:flex w-[240px] shrink-0 sticky top-0 h-screen flex-col px-4 py-5 border-r border-white/[0.04] bg-ink-950/40 backdrop-blur-xl">
        <SidebarBody onCmd={() => setPaletteOpen(true)} isAdmin={isAdmin} />
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-white/[0.04] bg-ink-950/70 backdrop-blur-xl">
        <NavLink to="/dashboard" className="inline-flex items-center"><Logo size={22} /></NavLink>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" leftIcon={<Search className="w-4 h-4" />} onClick={() => setPaletteOpen(true)}>Search</Button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="w-9 h-9 grid place-items-center rounded-lg text-ink-200 hover:bg-white/[0.05]"
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 left-0 bottom-0 w-[260px] bg-ink-900 border-r border-white/[0.06] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarBody
                onCmd={() => { setPaletteOpen(true); setMobileOpen(false); }}
                onNavClick={() => setMobileOpen(false)}
                isAdmin={isAdmin}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main pane ───────────────────────────────────────────── */}
      <main className="flex-1 min-w-0">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {children}
        </div>
        <footer className="px-4 sm:px-6 lg:px-10 py-8 text-[11.5px] text-ink-400/80 flex flex-wrap items-center justify-between gap-3">
          <span>InterPrep · Domain-Specific Interview Simulator</span>
          <div className="flex items-center gap-2 text-ink-500">
            <span className="kbd">{navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl'}</span>
            <span className="kbd">K</span>
            <span>to search</span>
          </div>
        </footer>
      </main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

function SidebarBody({ onCmd, onNavClick, isAdmin }) {
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <NavLink to="/dashboard" onClick={onNavClick} className="inline-flex items-center">
          <Logo size={26} />
        </NavLink>
      </div>

      <button
        onClick={onCmd}
        className="mb-5 w-full inline-flex items-center justify-between gap-2 px-3 h-9 rounded-lg
                   bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]
                   text-[12.5px] text-ink-300 transition-colors group"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-ink-400" />
          Quick jump…
        </span>
        <span className="inline-flex items-center gap-1 text-ink-400 group-hover:text-ink-200">
          <span className="kbd">⌘</span>
          <span className="kbd">K</span>
        </span>
      </button>

      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => <NavItem key={item.to} {...item} onNavClick={onNavClick} />)}
        {isAdmin && (
          <NavItem to="/admin" label="Admin" icon={ShieldCheck} accent onNavClick={onNavClick} />
        )}
      </nav>

      <div className="mt-auto pt-4 space-y-3">
        <UserMenu onNavClick={onNavClick} />
        <div className="rounded-xl p-3.5 bg-gradient-to-br from-brand-500/10 to-cyan-500/5 border border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-brand-300 font-medium">
            <Command className="w-3 h-3" />
            Pro tip
          </div>
          <p className="mt-1.5 text-[12px] text-ink-200 leading-relaxed">
            Press <span className="kbd">Space</span> in an interview to start or stop recording without leaving the keyboard.
          </p>
        </div>
        <div className="text-[10.5px] text-ink-500 px-1">InterPrep · v1.0</div>
      </div>
    </>
  );
}

function NavItem({ to, label, icon: Icon, onNavClick, accent }) {
  return (
    <NavLink
      to={to}
      onClick={onNavClick}
      className={({ isActive }) =>
        cn(
          'group relative inline-flex items-center gap-3 px-3 h-9 rounded-lg',
          'text-[13px] font-medium tracking-tight transition-colors duration-200',
          isActive
            ? 'text-white bg-white/[0.06]'
            : 'text-ink-300 hover:text-ink-100 hover:bg-white/[0.03]',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-active-pill"
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-500/15 via-brand-500/8 to-transparent border border-brand-500/15 -z-10"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <Icon className={cn('w-[15px] h-[15px]', isActive ? 'text-brand-300' : accent ? 'text-brand-300/80' : 'text-ink-400 group-hover:text-ink-200')} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

/** Compact user card at the bottom of the sidebar with a logout menu. */
function UserMenu({ onNavClick }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) return null;

  const initials = (user.name || user.email || '?')
    .split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  const handleLogout = async () => {
    await logout();
    if (onNavClick) onNavClick();
    navigate('/login', { replace: true });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full inline-flex items-center justify-between gap-2 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors"
      >
        <span className="inline-flex items-center gap-2 min-w-0">
          <span className="w-8 h-8 grid place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 text-white text-[12px] font-semibold shadow-glow-sm">
            {initials}
          </span>
          <span className="flex flex-col items-start min-w-0">
            <span className="text-[12.5px] text-ink-100 truncate max-w-[140px]">{user.name}</span>
            <span className="text-[10.5px] text-ink-400 truncate max-w-[140px]">{user.email}</span>
          </span>
        </span>
        <ChevronUp className={`w-3.5 h-3.5 text-ink-400 transition-transform ${open ? '' : 'rotate-180'}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 rounded-xl bg-ink-900/95 backdrop-blur-xl border border-white/[0.08] shadow-card p-1"
          >
            <button
              onClick={() => { setOpen(false); navigate('/settings'); onNavClick?.(); }}
              className="w-full inline-flex items-center gap-2 px-2.5 h-8 rounded-lg text-[12.5px] text-ink-200 hover:bg-white/[0.05] transition-colors"
            >
              <SettingsIcon className="w-3.5 h-3.5 text-ink-400" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center gap-2 px-2.5 h-8 rounded-lg text-[12.5px] text-danger-400 hover:bg-danger-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
