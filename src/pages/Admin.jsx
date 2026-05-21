import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Users as UsersIcon, BarChart3, Activity,
  RefreshCcw, Trash2, ChevronDown, AlertCircle, Crown, UserCog,
} from 'lucide-react';

import Card, { CardBody, CardHeader } from '@/components/ui/Card.jsx';
import Button from '@/components/ui/Button.jsx';
import Badge from '@/components/ui/Badge.jsx';
import Spinner from '@/components/ui/Spinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';

import { useAuth } from '@/context/AuthContext.jsx';
import {
  adminStats, adminListUsers, adminListInterviews,
  adminUpdateUserRole, adminDeleteUser,
} from '@/lib/api.js';
import { useToast } from '@/components/ui/Toast.jsx';
import { fmtRelativeDate } from '@/lib/utils.js';

const TABS = [
  { id: 'overview',   label: 'Overview',   icon: Activity },
  { id: 'users',      label: 'Users',      icon: UsersIcon },
  { id: 'interviews', label: 'Interviews', icon: BarChart3 },
];

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-[11.5px] text-brand-300 uppercase tracking-wider font-medium">
            <ShieldCheck className="w-3 h-3" /> Admin
          </div>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-ink-100">Platform control</h1>
          <p className="mt-1 text-[13.5px] text-ink-300">
            Signed in as <span className="text-ink-100">{user?.name}</span> ({user?.email}) · role <Badge variant="brand">admin</Badge>
          </p>
        </div>

        <div className="inline-flex p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-medium transition-colors
                ${tab === id ? 'bg-white/[0.08] text-ink-100' : 'text-ink-400 hover:text-ink-200'}`}
            >
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
      </header>

      {tab === 'overview'   && <OverviewPanel   />}
      {tab === 'users'      && <UsersPanel      />}
      {tab === 'interviews' && <InterviewsPanel />}
    </div>
  );
}

/* ─── Overview ──────────────────────────────────────────────────── */

function OverviewPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = async () => {
    setLoading(true); setError(null);
    try { setData(await adminStats()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  if (loading) return <PanelLoading />;
  if (error)   return <PanelError error={error} onRetry={reload} />;
  if (!data)   return null;

  const { counts, byDomain, recentInterviews } = data;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Users"            value={counts.userCount}        accent="from-brand-400 to-cyan-400" />
        <KpiCard label="Admins"           value={counts.adminCount}       accent="from-violet-400 to-fuchsia-400" />
        <KpiCard label="Interviews"       value={counts.interviewCount}   accent="from-cyan-400 to-emerald-400" />
        <KpiCard label="Last 7 days"      value={counts.last7Interviews}  accent="from-amber-400 to-rose-400" />
        <KpiCard label="Questions"        value={counts.questionCount}    accent="from-emerald-400 to-cyan-400" />
        <KpiCard label="Domains"          value={counts.domainCount}      accent="from-fuchsia-400 to-brand-400" />
      </div>

      <Card>
        <CardHeader title="Performance by domain" subtitle="Average overall score across all users." />
        <CardBody>
          {byDomain.length === 0
            ? <EmptyState compact title="No data yet" description="Once users start interviewing, this table fills up." />
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                  <thead className="text-ink-400">
                    <tr className="text-left">
                      <th className="py-2 pr-4 font-medium">Domain</th>
                      <th className="py-2 pr-4 font-medium">Interviews</th>
                      <th className="py-2 pr-4 font-medium">Avg overall</th>
                    </tr>
                  </thead>
                  <tbody className="text-ink-100">
                    {byDomain.map((row) => (
                      <tr key={row.domainSlug} className="border-t border-white/[0.04]">
                        <td className="py-2.5 pr-4">{row.domainSlug}</td>
                        <td className="py-2.5 pr-4 text-ink-300">{row.count}</td>
                        <td className="py-2.5 pr-4"><Badge variant="brand">{row.avgOverall}/100</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Recent interviews" subtitle="Last 10 sessions across the platform." />
        <CardBody>
          {recentInterviews.length === 0
            ? <EmptyState compact title="No interviews yet" description="Encourage users to record their first session." />
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                  <thead className="text-ink-400">
                    <tr className="text-left">
                      <th className="py-2 pr-4 font-medium">When</th>
                      <th className="py-2 pr-4 font-medium">User</th>
                      <th className="py-2 pr-4 font-medium">Domain</th>
                      <th className="py-2 pr-4 font-medium">Overall</th>
                    </tr>
                  </thead>
                  <tbody className="text-ink-100">
                    {recentInterviews.map((iv) => (
                      <tr key={iv.id || iv._id} className="border-t border-white/[0.04]">
                        <td className="py-2.5 pr-4 text-ink-300">{fmtRelativeDate(iv.createdAt)}</td>
                        <td className="py-2.5 pr-4">
                          <div className="flex flex-col">
                            <span className="text-ink-100">{iv.user?.name || '—'}</span>
                            <span className="text-[11px] text-ink-400">{iv.user?.email}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4">{iv.domain?.shortLabel || iv.domainSlug}</td>
                        <td className="py-2.5 pr-4"><Badge variant="brand">{iv.feedback?.overall ?? '—'}/100</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </CardBody>
      </Card>
    </motion.div>
  );
}

/* ─── Users ─────────────────────────────────────────────────────── */

function UsersPanel() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const reload = async () => {
    setLoading(true); setError(null);
    try {
      const { items, total: t } = await adminListUsers({ q: query || undefined, limit: 100 });
      setUsers(items); setTotal(t);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, []);

  const onPromote = async (u) => {
    try {
      const next = u.role === 'admin' ? 'user' : 'admin';
      await adminUpdateUserRole(u.id || u._id, next);
      toast.push({ type: 'success', title: 'Role updated', description: `${u.email} is now ${next}` });
      reload();
    } catch (e) {
      toast.push({ type: 'error', title: 'Could not update role', description: e.message });
    }
  };
  const onDelete = async (u) => {
    if (!window.confirm(`Delete user ${u.email}? This can't be undone.`)) return;
    try {
      await adminDeleteUser(u.id || u._id);
      toast.push({ type: 'success', title: 'User deleted', description: u.email });
      reload();
    } catch (e) {
      toast.push({ type: 'error', title: 'Could not delete', description: e.message });
    }
  };

  return (
    <Card>
      <CardHeader
        title="Users"
        subtitle={`${total} total`}
        action={
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && reload()}
              placeholder="Search by name or email…"
              className="h-8 px-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[12px] text-ink-100 placeholder:text-ink-500 outline-none focus:border-brand-500/40 w-64"
            />
            <Button variant="ghost" size="sm" leftIcon={<RefreshCcw className="w-3 h-3" />} onClick={reload}>Refresh</Button>
          </div>
        }
      />
      <CardBody>
        {loading ? <PanelLoading inline />
        : error  ? <PanelError error={error} onRetry={reload} />
        : users.length === 0 ? <EmptyState compact title="No users yet" description="When users sign up they'll appear here." />
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="text-ink-400">
                <tr className="text-left">
                  <th className="py-2 pr-4 font-medium">User</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">Joined</th>
                  <th className="py-2 pr-4 font-medium">Last login</th>
                  <th className="py-2 pr-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-ink-100">
                {users.map((u) => (
                  <tr key={u.id || u._id} className="border-t border-white/[0.04]">
                    <td className="py-2.5 pr-4">
                      <div className="flex flex-col">
                        <span className="text-ink-100">{u.name}</span>
                        <span className="text-[11px] text-ink-400">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4">
                      {u.role === 'admin'
                        ? <Badge variant="brand"><span className="inline-flex items-center gap-1"><Crown className="w-3 h-3" /> admin</span></Badge>
                        : <Badge variant="outline">user</Badge>}
                    </td>
                    <td className="py-2.5 pr-4 text-ink-300">{fmtRelativeDate(u.createdAt)}</td>
                    <td className="py-2.5 pr-4 text-ink-300">{u.lastLoginAt ? fmtRelativeDate(u.lastLoginAt) : '—'}</td>
                    <td className="py-2.5 pr-2 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button variant="ghost" size="sm" leftIcon={<UserCog className="w-3 h-3" />} onClick={() => onPromote(u)}>
                          {u.role === 'admin' ? 'Demote' : 'Promote'}
                        </Button>
                        <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-3 h-3" />} onClick={() => onDelete(u)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/* ─── Interviews ────────────────────────────────────────────────── */

function InterviewsPanel() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const reload = async () => {
    setLoading(true); setError(null);
    try {
      const { items: data, total: t } = await adminListInterviews({ limit: 50 });
      setItems(data); setTotal(t);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  return (
    <Card>
      <CardHeader
        title="All interviews"
        subtitle={`${total} total · showing latest ${items.length}`}
        action={<Button variant="ghost" size="sm" leftIcon={<RefreshCcw className="w-3 h-3" />} onClick={reload}>Refresh</Button>}
      />
      <CardBody>
        {loading ? <PanelLoading inline />
        : error  ? <PanelError error={error} onRetry={reload} />
        : items.length === 0 ? <EmptyState compact title="No interviews yet" description="Once users record sessions they'll appear here." />
        : (
          <div className="divide-y divide-white/[0.04]">
            {items.map((iv) => (
              <div key={iv.id || iv._id} className="py-3">
                <button
                  onClick={() => setExpanded((id) => id === (iv.id || iv._id) ? null : (iv.id || iv._id))}
                  className="w-full flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="brand">{iv.feedback?.overall ?? '—'}/100</Badge>
                    <div className="min-w-0">
                      <div className="text-[13px] text-ink-100 truncate">{iv.question}</div>
                      <div className="text-[11.5px] text-ink-400 mt-0.5">
                        {iv.user?.email} · {iv.domain?.shortLabel || iv.domainSlug} · {iv.difficulty} · {fmtRelativeDate(iv.createdAt)}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-ink-400 transition-transform ${expanded === (iv.id || iv._id) ? 'rotate-180' : ''}`} />
                </button>
                {expanded === (iv.id || iv._id) && (
                  <div className="mt-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5 text-[12.5px] text-ink-200 space-y-2">
                    <div className="text-ink-400 text-[10.5px] uppercase tracking-wider">Transcript</div>
                    <p className="text-ink-100 whitespace-pre-wrap leading-relaxed">{iv.transcript}</p>
                    {iv.feedback?.summary && (
                      <>
                        <div className="text-ink-400 text-[10.5px] uppercase tracking-wider mt-2">AI summary</div>
                        <p className="text-ink-200 leading-relaxed">{iv.feedback.summary}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/* ─── Shared sub-components ─────────────────────────────────────── */

function KpiCard({ label, value, accent }) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-[0.06] pointer-events-none`} />
      <CardBody className="relative py-4">
        <div className="text-[10.5px] uppercase tracking-wider text-ink-400 font-medium">{label}</div>
        <div className="mt-1 text-[24px] font-semibold tracking-tight text-ink-100 tabular-nums">{value ?? 0}</div>
      </CardBody>
    </Card>
  );
}

function PanelLoading({ inline }) {
  return (
    <div className={`flex items-center justify-center ${inline ? 'py-10' : 'min-h-[40vh]'}`}>
      <Spinner label="Loading…" />
    </div>
  );
}

function PanelError({ error, onRetry }) {
  return (
    <div className="rounded-xl bg-danger-500/10 border border-danger-500/30 px-4 py-4 text-[12.5px] text-danger-400">
      <div className="inline-flex items-start gap-2"><AlertCircle className="w-3.5 h-3.5 mt-0.5" /><span>{error}</span></div>
      <div className="mt-3"><Button variant="ghost" size="sm" leftIcon={<RefreshCcw className="w-3 h-3" />} onClick={onRetry}>Retry</Button></div>
    </div>
  );
}
