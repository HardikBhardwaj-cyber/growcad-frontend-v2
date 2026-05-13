import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Video, Plus, X, ExternalLink, Play, Clock, AlertCircle,
  RefreshCw, Trash2, Lock, Calendar, Users, ChevronDown
} from 'lucide-react';

const T = {
  primary: 'rgba(255,255,255,0.92)',
  title: 'rgba(255,255,255,0.95)',
  secondary: 'rgba(255,255,255,0.65)',
  muted: 'rgba(255,255,255,0.45)',
  label: 'rgba(255,255,255,0.38)',
};

const GLASS = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '18px',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)',
};

const MODAL = {
  background: 'linear-gradient(160deg, rgba(23,18,38,0.99), rgba(13,10,25,0.99))',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '22px',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  boxShadow: '0 28px 80px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.08)',
};

const INPUT = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '14px',
  color: T.primary,
  outline: 'none',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
};

const TOOLTIP = {
  background: 'rgba(255,255,255,0.055)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '999px',
  color: T.muted,
};

const STATUS = {
  not_available: {
    label: 'No Recording',
    icon: Lock,
    bg: 'rgba(148,163,184,0.11)',
    border: 'rgba(148,163,184,0.20)',
    color: 'rgba(203,213,225,0.78)',
  },
  pending: {
    label: 'Waiting for Recording',
    icon: Clock,
    bg: 'rgba(245,158,11,0.13)',
    border: 'rgba(251,191,36,0.26)',
    color: '#fbbf24',
  },
  processing: {
    label: 'Processing...',
    icon: RefreshCw,
    bg: 'rgba(59,130,246,0.13)',
    border: 'rgba(96,165,250,0.24)',
    color: '#93c5fd',
  },
  ready: {
    label: 'Watch Recording',
    icon: Play,
    bg: 'rgba(16,185,129,0.13)',
    border: 'rgba(52,211,153,0.26)',
    color: '#34d399',
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    bg: 'rgba(239,68,68,0.13)',
    border: 'rgba(248,113,113,0.26)',
    color: '#f87171',
  },
};

const BTN_PRIMARY = {
  background: 'linear-gradient(135deg, #6C3CF4, #8b5cf6)',
  color: '#fff',
  boxShadow: '0 12px 30px rgba(108,60,244,0.28)',
};

const BTN_SUCCESS = {
  background: 'linear-gradient(135deg, #059669, #10b981)',
  color: '#fff',
  boxShadow: '0 12px 28px rgba(16,185,129,0.24)',
};

const BTN_DANGER = {
  background: 'rgba(239,68,68,0.10)',
  border: '1px solid rgba(248,113,113,0.22)',
  color: '#f87171',
};

const PLAN_STYLE = {
  standard: {
    bg: 'rgba(16,185,129,0.14)',
    border: 'rgba(52,211,153,0.28)',
    color: '#34d399',
  },
  starter: {
    bg: 'rgba(59,130,246,0.14)',
    border: 'rgba(96,165,250,0.24)',
    color: '#93c5fd',
  },
};

function focusIn(e) {
  e.currentTarget.style.borderColor = 'rgba(167,139,250,0.68)';
  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(108,60,244,0.16), inset 0 1px 0 rgba(255,255,255,0.04)';
}

function focusOut(e) {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
  e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04)';
}

function DarkInput({ className = '', style, ...props }) {
  return (
    <input
      {...props}
      onFocus={focusIn}
      onBlur={focusOut}
      className={`w-full px-4 py-3 text-sm placeholder:text-white/30 transition-all ${className}`}
      style={{ ...INPUT, ...style }}
    />
  );
}

function DarkSelect({ children, className = '', style, ...props }) {
  return (
    <select
      {...props}
      onFocus={focusIn}
      onBlur={focusOut}
      className={`w-full px-4 py-3 text-sm transition-all ${className}`}
      style={{ ...INPUT, colorScheme: 'dark', ...style }}
    >
      {children}
    </select>
  );
}

function DarkCheckbox({ checked, onChange }) {
  return (
    <span
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all"
      style={{
        background: checked ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(255,255,255,0.10)',
        border: `1px solid ${checked ? 'rgba(52,211,153,0.42)' : 'rgba(255,255,255,0.12)'}`,
        boxShadow: checked ? '0 0 18px rgba(16,185,129,0.25)' : 'none',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      <span
        className="h-4 w-4 rounded-full bg-[#f8fafc] transition-transform"
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(4px)' }}
      />
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.label }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Overlay({ children }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-4"
      style={{
        background: 'rgba(0,0,0,0.70)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      {children}
    </div>,
    document.body
  );
}

function PlanBadge({ plan }) {
  const key = plan === 'standard' ? 'standard' : 'starter';
  const style = PLAN_STYLE[key];

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-[0_0_22px_rgba(108,60,244,0.14)]"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: style.color,
          boxShadow: `0 0 12px ${style.color}`,
        }}
      />
      {plan === 'standard' ? 'Standard Plan' : 'Starter Plan'}
    </span>
  );
}

function SectionHeader({ icon: Icon, title, count, tone = 'violet' }) {
  const isViolet = tone === 'violet';
  return (
    <div className="mb-3 flex items-center gap-3">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{
          background: isViolet ? 'rgba(108,60,244,0.14)' : 'rgba(148,163,184,0.10)',
          border: `1px solid ${isViolet ? 'rgba(167,139,250,0.24)' : 'rgba(148,163,184,0.17)'}`,
          color: isViolet ? '#c4b5fd' : 'rgba(203,213,225,0.76)',
        }}
      >
        <Icon size={16} />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h2 className="text-sm font-bold" style={{ color: T.title }}>{title}</h2>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold"
          style={{
            background: 'rgba(255,255,255,0.055)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: T.secondary,
          }}
        >
          {count}
        </span>
        <div className="h-px min-w-8 flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center" style={GLASS}>
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: 'rgba(108,60,244,0.12)',
          border: '1px solid rgba(108,60,244,0.24)',
          color: '#c4b5fd',
          boxShadow: '0 0 38px rgba(108,60,244,0.18)',
        }}
      >
        <Video size={28} />
      </div>
      <p className="text-base font-bold" style={{ color: T.title }}>No upcoming classes</p>
      <p className="mt-1 max-w-sm text-sm" style={{ color: T.secondary }}>
        Schedule your first live session using the button above.
      </p>
    </div>
  );
}

function StatusPill({ statusKey, children }) {
  const status = STATUS[statusKey] || STATUS.not_available;
  const StatusIcon = status.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold"
      style={{
        background: status.bg,
        border: `1px solid ${status.border}`,
        color: status.color,
      }}
    >
      <StatusIcon size={11} className={statusKey === 'processing' ? 'animate-spin' : ''} />
      {children || status.label}
    </span>
  );
}

function MicroChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold" style={TOOLTIP}>
      {children}
    </span>
  );
}

function UpgradeScreen() {
  const features = ['Google Meet integration', 'Cloud recordings', 'Playback history', 'Class analytics'];

  return (
    <div
      data-testid="live-classes-upgrade"
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-10 animate-fade-in"
    >
      <div
        className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: 'rgba(108,60,244,0.18)' }}
      />
      <div className="relative w-full max-w-[520px] p-7 text-center" style={GLASS}>
        <div
          className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[24px]"
          style={{
            background: 'linear-gradient(145deg, rgba(108,60,244,0.20), rgba(16,185,129,0.08))',
            border: '1px solid rgba(167,139,250,0.26)',
            boxShadow: '0 0 50px rgba(108,60,244,0.24)',
            color: '#c4b5fd',
          }}
        >
          <Lock size={30} />
        </div>
        <h2
          className="text-2xl font-bold"
          style={{
            background: 'linear-gradient(135deg, #fff, #c4b5fd)',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Unlock Live Classes
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6" style={{ color: T.secondary }}>
          Live classes with Google Meet integration are available on Starter and Standard plans.
          Upgrade your plan to schedule sessions and keep class activity in one place.
        </p>
        <div className="mt-6 grid gap-2 text-left sm:grid-cols-2">
          {features.map(feature => (
            <div
              key={feature}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold"
              style={{
                background: 'rgba(255,255,255,0.045)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: T.secondary,
              }}
            >
              <span style={{ color: '#34d399' }}>✓</span>
              {feature}
            </div>
          ))}
        </div>
        <button
          data-testid="upgrade-plan-btn"
          onClick={() => window.location.href = '/settings'}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 sm:w-auto"
          style={BTN_PRIMARY}
        >
          Upgrade Plan
          <ExternalLink size={15} />
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div data-testid="live-classes-page" className="relative animate-fade-in">
      <div className="flex h-48 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 rounded-full animate-spin"
            style={{ border: '2px solid rgba(108,60,244,0.22)', borderTopColor: '#7c4ff5' }}
          />
          <p className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Loading live classes...
          </p>
        </div>
      </div>
    </div>
  );
}


export default function LiveClassesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const canCreate = isAdmin || isTeacher;
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [plan, setPlan] = useState('standard');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', batchId: '', startTime: '', endTime: '', recordingEnabled: false });
  const [creating, setCreating] = useState(false);

  const fetchClasses = () => {
    API.get('/live-classes').then(r => setClasses(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClasses();
    API.get('/batches').then(r => setBatches(r.data));
    API.get('/institute/plan').then(r => setPlan(r.data.plan));
  }, []);

  const now = new Date().toISOString();
  const upcoming = classes.filter(c => c.startTime >= now).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const past = classes.filter(c => c.startTime < now).sort((a, b) => b.startTime.localeCompare(a.startTime));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.batchId || !form.startTime || !form.endTime) return;
    setCreating(true);
    try {
      await API.post('/live-classes/create', {
        title: form.title, batchId: form.batchId,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        recordingEnabled: form.recordingEnabled,
      });
      setShowForm(false);
      setForm({ title: '', batchId: '', startTime: '', endTime: '', recordingEnabled: false });
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create class');
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class?')) return;
    await API.delete(`/live-classes/${id}`);
    fetchClasses();
  };

  const handleRetry = async (id) => {
    await API.post(`/live-classes/${id}/retry-recording`);
    fetchClasses();
  };

  if (plan === 'base') return <UpgradeScreen />;
  if (loading) return <LoadingState />;

  return (
    <div data-testid="live-classes-page" className="relative animate-fade-in">
      <div
        className="sticky top-0 z-20 -mx-4 mb-6 px-4 pb-4 pt-4 shadow-[0_4px_20px_rgba(0,0,0,0.28)] lg:-mx-7 lg:px-7"
        style={{
          background: 'rgba(14,12,23,0.88)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-[1.2rem] font-bold" style={{ color: T.title }}>Live Classes</h1>
              <p className="mt-1 text-sm" style={{ color: T.secondary }}>Schedule and manage live sessions</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold" style={{ color: T.secondary }}>
              <MicroChip>Upcoming: {upcoming.length}</MicroChip>
              <MicroChip>Past: {past.length}</MicroChip>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <PlanBadge plan={plan} />
            {canCreate && (
              <button
                data-testid="schedule-class-btn"
                onClick={() => setShowForm(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 sm:w-auto"
                style={BTN_PRIMARY}
              >
                <Plus size={16} /> Schedule Class
              </button>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <Overlay>
          <div
            className="relative z-[10000] flex w-full max-w-lg flex-col overflow-hidden animate-scale-in sm:max-h-[88vh]"
            style={{ ...MODAL, maxHeight: 'calc(100vh - 24px)' }}
            data-testid="schedule-class-form"
          >
            <div
              className="flex items-start justify-between gap-4 px-5 py-5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    background: 'rgba(108,60,244,0.14)',
                    border: '1px solid rgba(167,139,250,0.22)',
                    color: '#c4b5fd',
                  }}
                >
                  <Video size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: T.title }}>Schedule Live Class</h3>
                  <p className="mt-1 text-xs" style={{ color: T.secondary }}>Create a Google Meet session for a batch.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl p-2 transition-colors hover:bg-white/10"
                style={{ color: T.muted }}
                aria-label="Close schedule class modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 overflow-y-auto px-5 py-5">
              <Field label="Class Title">
                <DarkInput
                  data-testid="class-title-input"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Physics - Mechanics"
                />
              </Field>

              <Field label="Batch">
                <div className="relative">
                  <select
                    data-testid="class-batch-select"
                    value={form.batchId}
                    onChange={e => setForm({ ...form, batchId: e.target.value })}
                    onFocus={focusIn}
                    onBlur={focusOut}
                    style={{
                      ...INPUT,
                      width: '100%',
                      display: 'block',
                      borderRadius: '10px',
                      padding: '9px 32px 9px 12px',
                      fontSize: '13px',
                      appearance: 'none',
                      cursor: 'pointer',
                      colorScheme: 'dark',
                    }}
                  >
                    <option value="" style={{ background: '#1a1625', color: 'rgba(255,255,255,0.70)' }}>
                      Select batch...
                    </option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id} style={{ background: '#1a1625', color: 'rgba(255,255,255,0.88)' }}>
                        {b.batchName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  />
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Start Time">
                  <DarkInput
                    data-testid="class-start-input"
                    type="datetime-local"
                    value={form.startTime}
                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                    style={{ colorScheme: 'dark' }}
                  />
                </Field>
                <Field label="End Time">
                  <DarkInput
                    data-testid="class-end-input"
                    type="datetime-local"
                    value={form.endTime}
                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                    style={{ colorScheme: 'dark' }}
                  />
                </Field>
              </div>

              {plan === 'standard' ? (
                <label
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl p-4 transition-all hover:border-emerald-300/30"
                  style={{
                    background: form.recordingEnabled
                      ? 'linear-gradient(145deg, rgba(16,185,129,0.13), rgba(16,185,129,0.04))'
                      : 'rgba(255,255,255,0.045)',
                    border: `1px solid ${form.recordingEnabled ? 'rgba(52,211,153,0.28)' : 'rgba(255,255,255,0.09)'}`,
                    boxShadow: form.recordingEnabled ? '0 0 28px rgba(16,185,129,0.10)' : 'none',
                  }}
                  data-testid="recording-toggle"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        background: 'rgba(16,185,129,0.12)',
                        border: '1px solid rgba(52,211,153,0.22)',
                        color: '#34d399',
                      }}
                    >
                      <Play size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: T.primary }}>Enable Recording</p>
                      <p className="mt-0.5 text-xs" style={{ color: T.secondary }}>
                        Class will be recorded and saved to cloud storage.
                      </p>
                    </div>
                  </div>
                  <DarkCheckbox
                    checked={form.recordingEnabled}
                    onChange={e => setForm({ ...form, recordingEnabled: e.target.checked })}
                  />
                </label>
              ) : (
                <div
                  className="flex items-start gap-3 rounded-2xl p-4"
                  style={{
                    background: 'rgba(245,158,11,0.09)',
                    border: '1px solid rgba(251,191,36,0.20)',
                    color: '#fbbf24',
                  }}
                  data-testid="recording-upgrade-hint"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/20">
                    <Lock size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Recording requires Standard</p>
                    <p className="mt-0.5 text-xs" style={{ color: T.secondary }}>
                      Upgrade to Standard plan for class recordings.
                    </p>
                  </div>
                </div>
              )}

              <button
                data-testid="create-class-submit"
                type="submit"
                disabled={creating || !form.title || !form.batchId || !form.startTime || !form.endTime}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                style={BTN_PRIMARY}
              >
                {creating && <RefreshCw size={15} className="animate-spin" />}
                {creating ? 'Scheduling...' : 'Schedule Class'}
              </button>
            </form>
          </div>
        </Overlay>
      )}

      <div className="mb-7">
        <SectionHeader icon={Calendar} title="Upcoming Classes" count={upcoming.length} />
        {upcoming.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.map(c => <ClassCard key={c.id} cls={c} plan={plan} canDelete={canCreate} onDelete={handleDelete} onRetry={handleRetry} />)}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {past.length > 0 && (
        <div>
          <SectionHeader icon={Clock} title="Past Classes" count={past.length} tone="slate" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {past.map(c => <ClassCard key={c.id} cls={c} plan={plan} isPast canDelete={canCreate} onDelete={handleDelete} onRetry={handleRetry} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function ClassCard({ cls, plan, isPast, canDelete, onDelete, onRetry }) {
  const c = cls;
  const start = new Date(c.startTime);
  const end = new Date(c.endTime);
  const now = new Date();
  const isLive = now >= start && now <= end;
  const status = STATUS[c.recordingStatus] || STATUS.not_available;

  const formatTime = (d) => d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const duration = Math.round((end - start) / 60000);

  return (
    <div
      className="group flex min-h-[236px] flex-col justify-between p-4 transition-all hover:-translate-y-1"
      style={{
        ...GLASS,
        borderColor: isLive ? 'rgba(52,211,153,0.36)' : 'rgba(255,255,255,0.09)',
        boxShadow: isLive
          ? '0 18px 44px rgba(16,185,129,0.10), 0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)'
          : GLASS.boxShadow,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = isLive ? 'rgba(52,211,153,0.50)' : 'rgba(167,139,250,0.28)';
        e.currentTarget.style.boxShadow = isLive
          ? '0 22px 52px rgba(16,185,129,0.14), 0 8px 32px rgba(0,0,0,0.30)'
          : '0 18px 46px rgba(108,60,244,0.12), 0 8px 30px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.07)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isLive ? 'rgba(52,211,153,0.36)' : 'rgba(255,255,255,0.09)';
        e.currentTarget.style.boxShadow = isLive
          ? '0 18px 44px rgba(16,185,129,0.10), 0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)'
          : GLASS.boxShadow;
      }}
      data-testid={`class-card-${c.id}`}
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isLive && (
              <span
                className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{
                  background: 'rgba(16,185,129,0.14)',
                  border: '1px solid rgba(52,211,153,0.26)',
                  color: '#34d399',
                  boxShadow: '0 0 22px rgba(16,185,129,0.16)',
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.75)] animate-pulse" />
                LIVE
              </span>
            )}
            <h4 className="truncate text-[15px] font-bold leading-6 tracking-tight" style={{ color: T.primary }}>
              {c.title}
            </h4>
          </div>
          {canDelete && (
            <button
              onClick={() => onDelete(c.id)}
              className="rounded-xl p-2 transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.18)]"
              style={{ color: T.muted }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, BTN_DANGER)}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.border = '1px solid transparent';
                e.currentTarget.style.color = T.muted;
                e.currentTarget.style.boxShadow = 'none';
              }}
              data-testid={`delete-class-${c.id}`}
              aria-label="Delete class"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold"
            style={{
              background: 'rgba(108,60,244,0.13)',
              border: '1px solid rgba(167,139,250,0.22)',
              color: '#c4b5fd',
            }}
          >
            <Users size={11} />
            {c.batchName || 'Batch'}
          </span>
          <span className="text-xs font-medium" style={{ color: T.secondary }}>{c.teacherName || 'Teacher'}</span>
        </div>

        <div
          className="mb-4 rounded-2xl p-3"
          style={{
            background: 'rgba(0,0,0,0.18)',
            border: '1px solid rgba(255,255,255,0.065)',
          }}
        >
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold" style={{ color: T.secondary }}>
            <Clock size={12} style={{ color: '#a78bfa' }} />
            <span>{formatTime(start)} - {formatTime(end)}</span>
            <span className="hidden h-3 w-px bg-white/10 sm:inline-block" />
            <MicroChip>{duration} min</MicroChip>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          {!isPast ? (
            <a
              href={c.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`join-class-${c.id}`}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all hover:-translate-y-0.5"
              style={isLive ? BTN_SUCCESS : BTN_PRIMARY}
            >
              <ExternalLink size={13} />
              {isLive ? 'Join Now' : 'Join Class'}
            </a>
          ) : c.meetLink && (
            <a
              href={c.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all hover:bg-white/10"
              style={{
                background: 'rgba(255,255,255,0.055)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: T.secondary,
              }}
            >
              <ExternalLink size={13} /> Meet Link
            </a>
          )}

          {c.recordingStatus === 'ready' ? (
            <a
              href={c.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(16,185,129,0.20)]"
              style={{
                background: STATUS.ready.bg,
                border: `1px solid ${STATUS.ready.border}`,
                color: STATUS.ready.color,
              }}
              data-testid={`watch-recording-${c.id}`}
            >
              <Play size={13} /> Watch Recording
            </a>
          ) : plan === 'starter' && c.recordingStatus === 'not_available' ? (
            <StatusPill statusKey="not_available">Upgrade for Recording</StatusPill>
          ) : (
            <StatusPill statusKey={c.recordingStatus || 'not_available'} />
          )}

          {c.recordingStatus === 'failed' && canDelete && (
            <button
              onClick={() => onRetry(c.id)}
              data-testid={`retry-recording-${c.id}`}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all hover:-translate-y-0.5"
              style={{
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(251,191,36,0.25)',
                color: '#fbbf24',
              }}
            >
              <RefreshCw size={12} /> Retry
            </button>
          )}
        </div>

        {c.recordingStatus === 'ready' && (c.recordingDuration > 0 || c.recordingSize > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {c.recordingDuration > 0 && <MicroChip>{c.recordingDuration} min</MicroChip>}
            {c.recordingSize > 0 && <MicroChip>{c.recordingSize} MB</MicroChip>}
          </div>
        )}
      </div>
    </div>
  );
}
