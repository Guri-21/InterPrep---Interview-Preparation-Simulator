import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, UserPlus, AlertCircle, ArrowRight } from 'lucide-react';

import Logo from '@/components/ui/Logo.jsx';
import Button from '@/components/ui/Button.jsx';
import { useAuth } from '@/context/AuthContext.jsx';

export default function Signup() {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const canSubmit =
    name.trim().length >= 2 &&
    /^\S+@\S+\.\S+$/.test(email) &&
    password.length >= 8 &&
    password === confirm;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await signup({ name: name.trim(), email: email.trim(), password });
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10 relative">
      <div className="absolute inset-0 aurora-bg pointer-events-none opacity-60" />
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute top-5 left-5 text-[11.5px] text-ink-400">
        <Link to="/" className="hover:text-ink-200">← Back to home</Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[440px] glass-strong rounded-2xl p-7"
      >
        <div className="flex items-center justify-between mb-6">
          <Logo size={26} />
          <span className="text-[11.5px] text-ink-400">Create account</span>
        </div>

        <h1 className="text-[26px] font-semibold tracking-tight text-ink-100">Start training</h1>
        <p className="mt-1 text-[13.5px] text-ink-300">
          Build a history of interviews, track scores, and unlock analytics.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <Field label="Name" icon={UserIcon} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" required />
          <Field label="Email" icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
          <Field label="Password" icon={Lock} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" required />
          <Field label="Confirm password" icon={Lock} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" autoComplete="new-password" required />

          {password && confirm && password !== confirm && (
            <p className="text-[12px] text-danger-400">Passwords don't match.</p>
          )}

          {error && (
            <div className="rounded-lg bg-danger-500/10 border border-danger-500/30 px-3 py-2 text-[12.5px] text-danger-400 inline-flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5" /><span>{error}</span>
            </div>
          )}

          <Button type="submit" variant="brand" size="lg" className="w-full" leftIcon={<UserPlus className="w-4 h-4" />}
            loading={submitting} disabled={!canSubmit || submitting}
          >
            Create account
          </Button>
        </form>

        <div className="mt-6 text-[12.5px] text-ink-300 inline-flex items-center gap-1.5">
          Already have an account?
          <Link to="/login" className="text-brand-300 hover:text-brand-200 inline-flex items-center gap-1">
            Sign in <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, icon: Icon, type = 'text', ...rest }) {
  return (
    <label className="block">
      <span className="text-[11.5px] uppercase tracking-wider text-ink-400 font-medium">{label}</span>
      <div className="mt-1.5 relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />}
        <input
          type={type}
          {...rest}
          className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[13.5px] text-ink-100 placeholder:text-ink-500 outline-none focus:border-brand-500/40 transition-colors"
        />
      </div>
    </label>
  );
}
