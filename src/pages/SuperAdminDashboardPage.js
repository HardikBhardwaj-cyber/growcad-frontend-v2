import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '@/api';
import {
  AlertCircle,
  Building2,
  Check,
  Clock3,
  Database,
  GraduationCap,
  IndianRupee,
  Mail,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';

const CARD_STYLE = {
  background: 'linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))',
  border: '1px solid rgba(255,255,255,0.11)',
  boxShadow: '0 14px 42px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.07)',
};

function money(n = 0) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function pct(used = 0, limit = 0) {
  if (!limit) return 0;
  return Math.min(100, Math.round((Number(used || 0) / Number(limit || 1)) * 100));
}

function statusColor(status) {
  if (status === 'active') return { bg: 'rgba(16,185,129,.14)', text: '#34d399', border: 'rgba(52,211,153,.24)' };
  if (status === 'pending_approval') return { bg: 'rgba(245,158,11,.14)', text: '#fbbf24', border: 'rgba(251,191,36,.25)' };
  if (status === 'rejected') return { bg: 'rgba(239,68,68,.14)', text: '#f87171', border: 'rgba(248,113,113,.25)' };
  return { bg: 'rgba(255,255,255,.08)', text: 'rgba(255,255,255,.65)', border: 'rgba(255,255,255,.12)' };
}

function MetricCard({ icon: Icon, label, value, sub, accent = '#a78bfa' }) {
  return (
    <div className="rounded-2xl p-4" style={CARD_STYLE}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">{label}</p>
          <p className="text-2xl font-black text-white mt-2 tracking-tight">{value}</p>
          {sub && <p className="text-[11px] text-white/42 mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}22`, color: accent }}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function UsageBar({ label, used, limit, suffix = '' }) {
  const value = pct(used, limit);
  return (
    <div>
      <div className="flex justify-between gap-2 text-[10px] mb-1">
        <span className="font-bold text-white/55">{label}</span>
        <span className="text-white/40">
          {used}{suffix} / {limit || 0}{suffix}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-white/10">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: value > 85 ? '#f87171' : 'linear-gradient(90deg,#6C3CF4,#22c55e)' }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = statusColor(status);
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold capitalize"
      style={{ color: colors.text, background: colors.bg, border: `1px solid ${colors.border}` }}
    >
      {status?.replace(/_/g, ' ') || 'pending'}
    </span>
  );
}

function InstituteRow({ institute, onDecision, busy }) {
  return (
    <div
      className="grid gap-3 px-4 py-3 items-center border-t border-white/7"
      style={{ gridTemplateColumns: '1.35fr .7fr .72fr .8fr .8fr .9fr auto' }}
    >
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-white truncate">{institute.name || 'Unnamed institute'}</p>
        <p className="text-[11px] text-white/38 truncate">{institute.domain || institute.slug || institute.id}</p>
      </div>
      <StatusBadge status={institute.status} />
      <div>
        <p className="text-[12px] font-bold text-white capitalize">{institute.plan || 'starter'}</p>
        <p className="text-[10px] text-white/35">{institute.billingCycle || 'not billed'}</p>
      </div>
      <div className="text-[12px] text-white/75">{institute.students} students</div>
      <div className="space-y-1">
        <UsageBar label="Email" used={institute.usage?.emails || 0} limit={institute.limits?.emails || 0} />
        <UsageBar label="WA" used={institute.usage?.whatsapp || 0} limit={institute.limits?.whatsapp || 0} />
      </div>
      <div className="space-y-1">
        <UsageBar label="Storage" used={institute.usage?.storageGb || 0} limit={institute.limits?.storageGb || 0} suffix="GB" />
      </div>
      <div className="flex items-center justify-end gap-2">
        {institute.status === 'pending_approval' ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecision(institute.id, 'reject')}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
              style={{ color: '#f87171', background: 'rgba(239,68,68,.10)', border: '1px solid rgba(248,113,113,.18)' }}
              title="Reject"
            >
              <X size={15} />
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecision(institute.id, 'approve')}
              className="h-8 rounded-lg px-3 flex items-center gap-1.5 text-[11px] font-bold transition-all disabled:opacity-40"
              style={{ color: '#fff', background: 'linear-gradient(135deg,#10b981,#22c55e)' }}
              title="Approve"
            >
              <Check size={14} /> Approve
            </button>
          </>
        ) : (
          <span className="text-[11px] text-white/30">{money(institute.amount)}</span>
        )}
      </div>
    </div>
  );
}

export default function SuperAdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const { data: res } = await API.get('/admin/dashboard');
      setData(res);
    } catch (err) {
      setError(err.message || 'Could not load super-admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const summary = data?.summary || {};
  const pending = useMemo(
    () => data?.pendingApprovals || [],
    [data]
  );

  const institutes = useMemo(
    () => data?.institutes || [],
    [data]
  );

  const topUsage = useMemo(() => (
    [...institutes]
      .sort((a, b) => (b.usage?.storageGb || 0) - (a.usage?.storageGb || 0))
      .slice(0, 4)
  ), [institutes]);

  const decide = async (instituteId, action) => {
    const note = action === 'reject'
      ? window.prompt('Reason for rejection?') || ''
      : 'Approved by super-admin';

    setBusyId(instituteId);
    try {
      await API.post('/admin/approve-institute', {
        institute_id: instituteId,
        action,
        note,
      });
      await load();
    } catch (err) {
      setError(err.message || 'Approval action failed.');
    } finally {
      setBusyId('');
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/55 text-sm">
          <RefreshCw size={17} className="animate-spin" /> Loading platform dashboard
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-300/70">Platform Control</p>
          <h1 className="text-2xl lg:text-3xl font-black text-white mt-1 tracking-tight">Super Admin Dashboard</h1>
          <p className="text-sm text-white/42 mt-1">Approve institutes and monitor email, WhatsApp, and storage usage.</p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="h-10 px-4 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition-all disabled:opacity-50"
          style={{ color: '#fff', background: 'rgba(108,60,244,.20)', border: '1px solid rgba(167,139,250,.28)' }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl px-4 py-3 text-sm flex items-center gap-2" style={{ color: '#fca5a5', background: 'rgba(239,68,68,.12)', border: '1px solid rgba(248,113,113,.24)' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <MetricCard icon={Building2} label="Institutes" value={summary.totalInstitutes || 0} sub={`${summary.activeInstitutes || 0} active`} />
        <MetricCard icon={Clock3} label="Pending Approval" value={summary.pendingApprovals || 0} sub="cash / bank requests" accent="#f59e0b" />
        <MetricCard icon={IndianRupee} label="Tracked Revenue" value={money(summary.totalRevenue || 0)} sub="active + pending" accent="#22c55e" />
        <MetricCard icon={Users} label="People Managed" value={summary.totalStudents || 0} sub={`${summary.totalTeachers || 0} teachers`} accent="#38bdf8" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_.75fr] gap-4">
        <section className="rounded-2xl overflow-hidden" style={CARD_STYLE}>
          <div className="px-4 py-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-white">Pending Approvals</h2>
              <p className="text-[11px] text-white/38">Approve cash or bank payment institutes here.</p>
            </div>
            <ShieldCheck className="text-violet-300" size={20} />
          </div>

          {pending.length === 0 ? (
            <div className="px-4 py-10 text-center border-t border-white/7">
              <Check className="mx-auto mb-2 text-emerald-400" size={24} />
              <p className="text-sm font-bold text-white">No institutes waiting right now</p>
              <p className="text-xs text-white/35 mt-1">New cash / bank plans will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {pending.map((inst) => (
                  <InstituteRow key={inst.id} institute={inst} onDecision={decide} busy={busyId === inst.id} />
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl p-4" style={CARD_STYLE}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-white">Total Usage</h2>
              <p className="text-[11px] text-white/38">Across all institutes</p>
            </div>
            <Database className="text-violet-300" size={20} />
          </div>
          <div className="space-y-4">
            <MetricCard icon={Mail} label="Emails Sent" value={summary.usage?.emails || 0} sub="logged email events" accent="#a78bfa" />
            <MetricCard icon={MessageCircle} label="WhatsApp Sent" value={summary.usage?.whatsapp || 0} sub={`${summary.usage?.sms || 0} SMS logged`} accent="#22c55e" />
            <MetricCard icon={Database} label="Storage Used" value={`${summary.usage?.storageGb || 0}GB`} sub="recording storage estimate" accent="#38bdf8" />
          </div>
        </section>
      </div>

      <section className="rounded-2xl overflow-hidden" style={CARD_STYLE}>
        <div className="px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-white">Institute Limits</h2>
            <p className="text-[11px] text-white/38">Email, WhatsApp, and storage limits per institute.</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-white/42">
            <span className="inline-flex items-center gap-1"><GraduationCap size={13} /> Students</span>
            <span className="inline-flex items-center gap-1"><Database size={13} /> Usage</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            <div
              className="grid gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/32 border-t border-white/7"
              style={{ gridTemplateColumns: '1.35fr .7fr .72fr .8fr .8fr .9fr auto' }}
            >
              <span>Institute</span>
              <span>Status</span>
              <span>Plan</span>
              <span>Students</span>
              <span>Email / WA</span>
              <span>Storage</span>
              <span className="text-right">Action</span>
            </div>
            {institutes.map((inst) => (
              <InstituteRow key={inst.id} institute={inst} onDecision={decide} busy={busyId === inst.id} />
            ))}
          </div>
        </div>
      </section>

      {topUsage.length > 0 && (
        <section className="rounded-2xl p-4" style={CARD_STYLE}>
          <h2 className="text-base font-black text-white mb-3">Highest Storage Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {topUsage.map((inst) => (
              <div key={inst.id} className="rounded-xl p-3 bg-white/[0.045] border border-white/10">
                <p className="text-sm font-bold text-white truncate">{inst.name}</p>
                <p className="text-[11px] text-white/35 truncate">{inst.domain}</p>
                <div className="mt-3">
                  <UsageBar label="Storage" used={inst.usage?.storageGb || 0} limit={inst.limits?.storageGb || 0} suffix="GB" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
