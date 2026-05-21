import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, ShieldCheck, Sparkles, Lock, AlertCircle, Mail, User as UserIcon } from 'lucide-react';

import Card, { CardBody, CardHeader } from '@/components/ui/Card.jsx';
import Button from '@/components/ui/Button.jsx';
import Badge from '@/components/ui/Badge.jsx';
import { useToast } from '@/components/ui/Toast.jsx';

import { useAuth } from '@/context/AuthContext.jsx';
import { updateProfile, changePassword } from '@/lib/api.js';
import { DOMAINS } from '@/lib/domains.js';

export default function Settings() {
  const toast = useToast();
  const { user, setLocalUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [preferredDomain, setPreferredDomain] = useState(
    typeof user?.preferredDomain === 'string' ? user.preferredDomain : '',
  );
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState(null);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const updated = await updateProfile({
        name: name.trim() || undefined,
        preferredDomain: preferredDomain || null,
      });
      setLocalUser(updated);
      toast.push({ type: 'success', title: 'Saved', description: 'Profile updated.' });
    } catch (e) {
      toast.push({ type: 'error', title: 'Could not save', description: e.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwError(null);
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      await changePassword({ currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      toast.push({ type: 'success', title: 'Password changed', description: 'Use your new password next time you sign in.' });
    } catch (e) {
      setPwError(e.message);
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11.5px] uppercase tracking-wider text-brand-300 font-medium">Settings</div>
        <h1 className="mt-1 text-[28px] sm:text-[34px] font-semibold tracking-tighter text-gradient">
          Make InterPrep yours.
        </h1>
      </div>

      <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardHeader>
            <div className="text-[13px] font-semibold tracking-tight">Profile</div>
            <p className="text-[11.5px] text-ink-400 mt-0.5">
              Signed in as <span className="text-ink-100">{user?.email}</span>
              {user?.role === 'admin' && <Badge variant="brand" className="ml-2">admin</Badge>}
            </p>
          </CardHeader>
          <CardBody className="pt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Display name" icon={UserIcon}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                className="w-full h-10 px-3.5 rounded-lg bg-ink-900/60 border border-white/[0.06] text-[13px] text-ink-100 outline-none focus:border-brand-500/40 placeholder:text-ink-400"
              />
            </Field>
            <Field label="Email" icon={Mail}>
              <input
                value={user?.email || ''}
                disabled
                className="w-full h-10 px-3.5 rounded-lg bg-ink-900/40 border border-white/[0.05] text-[13px] text-ink-400 outline-none"
              />
            </Field>
            <Field label="Preferred domain">
              <select
                value={preferredDomain || ''}
                onChange={(e) => setPreferredDomain(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-ink-900/60 border border-white/[0.06] text-[13px] text-ink-100 outline-none focus:border-brand-500/40"
              >
                <option value="">No preference</option>
                {DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </Field>
          </CardBody>
          <div className="px-6 pb-5">
            <Button
              variant="brand"
              size="sm"
              leftIcon={<Save className="w-3.5 h-3.5" />}
              onClick={handleProfileSave}
              loading={savingProfile}
            >
              Save profile
            </Button>
          </div>
        </Card>
      </motion.section>

      <Card>
        <CardHeader>
          <div className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-tight">
            <Lock className="w-3.5 h-3.5 text-brand-300" /> Change password
          </div>
          <p className="text-[11.5px] text-ink-400 mt-0.5">
            Enter your current password followed by the new password (at least 8 characters).
          </p>
        </CardHeader>
        <CardBody className="pt-1 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Current password">
            <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" className="w-full h-10 px-3 rounded-lg bg-ink-900/60 border border-white/[0.06] text-[13px] text-ink-100 outline-none focus:border-brand-500/40" />
          </Field>
          <Field label="New password">
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="At least 8 characters" className="w-full h-10 px-3 rounded-lg bg-ink-900/60 border border-white/[0.06] text-[13px] text-ink-100 outline-none focus:border-brand-500/40" />
          </Field>
          <Field label="Confirm new password">
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Re-enter" className="w-full h-10 px-3 rounded-lg bg-ink-900/60 border border-white/[0.06] text-[13px] text-ink-100 outline-none focus:border-brand-500/40" />
          </Field>
        </CardBody>
        <div className="px-6 pb-5 flex items-center gap-3">
          <Button
            variant="brand" size="sm" leftIcon={<Lock className="w-3.5 h-3.5" />}
            onClick={handlePasswordChange}
            loading={savingPw}
            disabled={!currentPw || !newPw || !confirmPw}
          >
            Change password
          </Button>
          {pwError && (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-danger-400">
              <AlertCircle className="w-3 h-3" /> {pwError}
            </span>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-tight">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" /> AI provider
          </div>
          <p className="text-[11.5px] text-ink-400 mt-0.5">
            The server-side evaluator picks the provider from environment variables. Update <code className="font-mono text-ink-200 text-[11px]">AI_PROVIDER</code> in your deployment to switch.
          </p>
        </CardHeader>
        <CardBody className="pt-1">
          <div className="rounded-xl p-4 bg-white/[0.025] border border-white/[0.05] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ProviderTile name="Google Gemini"    status="active" description="Default provider — free tier. Uses GEMINI_API_KEY (get one at aistudio.google.com)." />
            <ProviderTile name="Anthropic Claude" status="ready"  description="Set AI_PROVIDER=anthropic and ANTHROPIC_API_KEY to switch." />
            <ProviderTile name="OpenAI"           status="ready"  description="Stubbed. Wire it in backend/src/services/aiService.js when needed." />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-tight">
            <ShieldCheck className="w-3.5 h-3.5 text-success-400" /> Your data
          </div>
          <p className="text-[11.5px] text-ink-400 mt-0.5">
            Your interviews, transcripts, scores, and custom questions are stored in MongoDB on the InterPrep backend. Each interview is private to your account.
          </p>
        </CardHeader>
      </Card>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-wider text-ink-400">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </span>
      {children}
    </label>
  );
}

function ProviderTile({ name, status, description }) {
  return (
    <div className="rounded-lg p-3.5 bg-white/[0.025] border border-white/[0.05]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink-100">{name}</span>
        <Badge variant={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? 'Active' : 'Ready'}
        </Badge>
      </div>
      <p className="mt-1.5 text-[11.5px] text-ink-400 leading-relaxed">{description}</p>
    </div>
  );
}
