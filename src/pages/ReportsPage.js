import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import API from '@/api';
import {
  BarChart3, TrendingUp, Award, Calendar, ChevronDown, CreditCard,
  AlertTriangle, Bell, RefreshCw, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

// ─── Chart palette ────────────────────────────────────────────
const COLORS = ['#8b5cf6', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb7185', '#2dd4bf'];

// ─── Design tokens ────────────────────────────────────────────

const GLASS = {
  background:           'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))',
  border:               '1px solid rgba(255,255,255,0.09)',
  borderRadius:         '18px',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow:            '0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)',
};

const T = {
  primary:   'rgba(255,255,255,0.92)',
  secondary: 'rgba(255,255,255,0.65)',
  muted:     'rgba(255,255,255,0.45)',
  label:     'rgba(255,255,255,0.38)',
};

const INPUT = {
  background:   'rgba(255,255,255,0.06)',
  border:       '1px solid rgba(255,255,255,0.10)',
  color:        'rgba(255,255,255,0.88)',
  borderRadius: '10px',
  outline:      'none',
  padding:      '7px 11px',
  fontSize:     '12px',
  transition:   'border-color 0.15s ease, box-shadow 0.15s ease',
};

// ─── Focus/blur handlers ──────────────────────────────────────
const onFocus = e => {
  e.currentTarget.style.borderColor = 'rgba(108,60,244,0.65)';
  e.currentTarget.style.boxShadow  = '0 0 0 3px rgba(108,60,244,0.14)';
};
const onBlur = e => {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
  e.currentTarget.style.boxShadow  = 'none';
};

// ─── Dark tooltip for Recharts ────────────────────────────────
const TOOLTIP_STYLE = {
  background:           'rgba(15,12,28,0.96)',
  border:               '1px solid rgba(255,255,255,0.10)',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius:         '10px',
  fontSize:             '12px',
  color:                'rgba(255,255,255,0.88)',
};

// ─── Shared chart axis props ──────────────────────────────────
const AXIS_TICK = { fill: 'rgba(255,255,255,0.42)', fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif' };
const GRID_COLOR = 'rgba(255,255,255,0.06)';

// ─── Helpers ──────────────────────────────────────────────────

/** Format an amount as INR currency (Rs.) with thousands separators. */
export function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 'Rs.0';
  return `Rs.${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

/**
 * Fee bucket helpers — operate on a fee report payload.
 * Prefer the new backend fields (paid / pendingTillCurrentMonth / upcoming),
 * but fall back to legacy fields so existing reports still render.
 */
export function getPaidAmount(report) {
  if (!report) return 0;
  if (typeof report.paid === 'number') return report.paid;
  if (typeof report.totalCollected === 'number') return report.totalCollected;
  return 0;
}

export function getPendingTillCurrentMonth(report) {
  if (!report) return 0;
  if (typeof report.pendingTillCurrentMonth === 'number') return report.pendingTillCurrentMonth;
  // Legacy: if backend hasn't been updated, assume all pending is current
  if (typeof report.totalPending === 'number') return report.totalPending;
  return 0;
}

export function getUpcomingAmount(report) {
  if (!report) return 0;
  if (typeof report.upcoming === 'number') return report.upcoming;
  return 0;
}

// ─── Reusable components ──────────────────────────────────────

function DarkSelect({ children, style = {}, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        style={{ ...INPUT, appearance: 'none', cursor: 'pointer', paddingRight: 28, ...style }}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {children}
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: T.muted }}
      />
    </div>
  );
}

function DarkDateInput(props) {
  return (
    <input
      type="date"
      {...props}
      style={{ ...INPUT, colorScheme: 'dark', width: 'auto' }}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

function Avatar({ name, size = 28 }) {
  const letter  = name?.charAt(0)?.toUpperCase() || '?';
  const palette = ['#6C3CF4', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#0ea5e9'];
  const color   = palette[(name?.charCodeAt(0) || 0) % palette.length];
  return (
    <div className="flex items-center justify-center shrink-0 rounded-full font-bold"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `${color}22`, border: `1px solid ${color}40`, color }}>
      {letter}
    </div>
  );
}

function ScoreBadge({ pct }) {
  const [bg, color, border] =
    pct >= 80 ? ['rgba(16,185,129,0.15)',  '#34d399',  'rgba(52,211,153,0.28)']
  : pct >= 60 ? ['rgba(245,158,11,0.14)',  '#fbbf24',  'rgba(251,191,36,0.26)']
  :             ['rgba(239,68,68,0.13)',   '#f87171',  'rgba(248,113,113,0.24)'];
  return (
    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold"
      style={{ background: bg, color, border: `1px solid ${border}` }}>
      {pct}%
    </span>
  );
}

function RankBubble({ rank }) {
  const cfg =
    rank === 1 ? { bg: 'rgba(245,158,11,0.20)',  color: '#fbbf24', label: '🥇' }
  : rank === 2 ? { bg: 'rgba(203,213,225,0.14)',  color: '#cbd5e1', label: '🥈' }
  : rank === 3 ? { bg: 'rgba(249,115,22,0.18)',  color: '#fb923c', label: '🥉' }
  :              { bg: 'rgba(255,255,255,0.05)',  color: T.label,   label: rank };
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </div>
  );
}

/** Glass card with optional hover lift */
function GCard({ children, style = {}, hover = true, ...props }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      {...props}
      style={{
        ...GLASS,
        transition: hover ? 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease' : undefined,
        transform:  hover && hovered ? 'translateY(-2px)' : undefined,
        borderColor:hover && hovered ? 'rgba(108,60,244,0.24)' : undefined,
        boxShadow:  hover && hovered
          ? '0 10px 36px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 40px rgba(108,60,244,0.07)'
          : GLASS.boxShadow,
        ...style,
      }}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
    >
      {children}
    </div>
  );
}

/** Stat card (fee summary) */
function StatCard({ testId, icon: Icon, iconColor, label, value, valueColor }) {
  return (
    <GCard className="p-5" data-testid={testId}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9.5px] font-bold uppercase tracking-widest" style={{ color: T.label, letterSpacing: '0.16em' }}>
          {label}
        </p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${iconColor}1e`, border: `1px solid ${iconColor}30` }}>
          <Icon size={16} style={{ color: iconColor }} />
        </div>
      </div>
      <p className="text-[1.65rem] font-bold leading-none tracking-tight" style={{ color: valueColor ?? T.primary }}>
        {value}
      </p>
      <div className="mt-2.5 h-[2px] rounded-full"
        style={{ background: `linear-gradient(90deg,${iconColor}55,transparent)`, width: '38%' }} />
    </GCard>
  );
}

/** Section heading inside a card */
function CardHead({ icon: Icon, iconBg, iconColor, title, right }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: iconBg ?? 'rgba(108,60,244,0.15)', border: `1px solid ${iconColor ?? '#a78bfa'}30` }}>
            <Icon size={14} style={{ color: iconColor ?? '#a78bfa' }} />
          </div>
        )}
        <h3 className="text-[13.5px] font-semibold" style={{ color: T.primary }}>{title}</h3>
      </div>
      {right}
    </div>
  );
}

function TableHead({ cols }) {
  return (
    <thead>
      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
        {cols.map(({ label, cls = '', key }) => (
          <th key={key || label || Math.random()} className={`text-left px-5 py-3${cls}`}
            style={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em', color: T.label, whiteSpace: 'nowrap' }}>
            {label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function TableRow({ children, last }) {
  return (
    <tr
      style={{ borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)', transition: 'background 0.12s ease' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,60,244,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </tr>
  );
}

function EmptyRow({ cols, text }) {
  return (
    <tr>
      <td colSpan={cols} style={{ padding: '44px 20px', textAlign: 'center', border: 'none' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(108,60,244,0.12)', border: '1px solid rgba(108,60,244,0.22)' }}>
            <BarChart3 size={18} style={{ color: '#a78bfa' }} />
          </div>
          <p className="text-[12px] font-medium" style={{ color: T.muted }}>{text}</p>
        </div>
      </td>
    </tr>
  );
}

// ─── Tab subtitle map ─────────────────────────────────────────
const TAB_SUBTITLE = {
  attendance:  'Attendance analytics and trends',
  fees:        'Fee collection analytics',
  performance: 'Test performance insights',
};

// ─── Error card (dark glass, with retry) ──────────────────────
function ErrorCard({ message, onRetry, testId }) {
  return (
    <GCard className="p-6" data-testid={testId} hover={false}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(248,113,113,0.28)' }}>
          <AlertTriangle size={18} style={{ color: '#f87171' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold" style={{ color: '#f87171' }}>
            Could not load this report
          </p>
          <p className="text-[11.5px] mt-1" style={{ color: T.muted }}>
            {message || 'The request took too long or the server returned an error.'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold"
              style={{
                background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',
                color: '#fff',
                boxShadow: '0 2px 12px rgba(108,60,244,0.40)',
              }}
            >
              <RefreshCw size={12} /> Retry
            </button>
          )}
        </div>
      </div>
    </GCard>
  );
}

// ─── Main component ────────────────────────────────────────────

export default function ReportsPage() {
  // ── State ─────────────────────────────────────────────────────
  const [tab,           setTab]           = useState('attendance');
  const [attReport,     setAttReport]     = useState(null);
  const [feeReport,     setFeeReport]     = useState(null);
  const [perfReport,    setPerfReport]    = useState(null);
  const [batches,       setBatches]       = useState([]);
  const [batchFilter,   setBatchFilter]   = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [startDate,     setStartDate]     = useState('');
  const [endDate,       setEndDate]       = useState('');

  // Per-tab loading + error
  const [loading, setLoading] = useState({ attendance: false, fees: false, performance: false });
  const [error,   setError]   = useState({ attendance: null, fees: null, performance: null });

  // Fees "details" (overdue + trend) loads after the summary so first paint stays fast
  const [feeDetailsLoading, setFeeDetailsLoading] = useState(false);

  // Overdue selection & send-reminder state
  const [overdueSelected,  setOverdueSelected]  = useState({}); // { [studentId]: true }
  const [sendingReminder,  setSendingReminder]  = useState({}); // { [studentId|'__bulk__']: true }
  const [reminderToast,    setReminderToast]    = useState(null);

  // Refs for cancellation / debounce
  const abortRefs    = useRef({ attendance: null, fees: null, feesDetails: null, performance: null });
  const debounceRef  = useRef(null);
  const requestKey   = useRef({ attendance: '', fees: '', feesDetails: '', performance: '' });

  // ── Load batches once (with .catch) ───────────────────────────
  useEffect(() => {
    let cancelled = false;
    API.get('/batches')
      .then(r => { if (!cancelled) setBatches(Array.isArray(r.data) ? r.data : []); })
      .catch(() => { if (!cancelled) setBatches([]); });
    return () => { cancelled = true; };
  }, []);

  // ── Safe fetch with AbortController + dedupe + keep-old-data ──
  const fetchReport = useCallback((which, params) => {
    const url = which === 'attendance' ? '/reports/attendance'
              : which === 'fees'       ? '/reports/fees'
              :                          '/reports/performance';

    // Build a request key so we can dedupe identical in-flight requests
    const key = JSON.stringify(params || {});
    if (requestKey.current[which] === key && (
      (which === 'attendance' && attReport)  ||
      (which === 'fees'       && feeReport)  ||
      (which === 'performance'&& perfReport)
    ) && !error[which]) {
      // Same params, data already loaded, no error → skip
      return;
    }

    // Cancel any in-flight request for this tab
    if (abortRefs.current[which]) {
      try { abortRefs.current[which].abort(); } catch {/* noop */}
    }
    const controller = new AbortController();
    abortRefs.current[which] = controller;
    requestKey.current[which] = key;

    setLoading(prev => ({ ...prev, [which]: true }));
    setError(prev   => ({ ...prev, [which]: null }));

    API.get(url, { params, signal: controller.signal })
      .then(r => {
        // Only commit if this is still the latest request
        if (abortRefs.current[which] !== controller) return;
        if (which === 'attendance')  setAttReport(r.data);
        if (which === 'fees')        setFeeReport(r.data);
        if (which === 'performance') setPerfReport(r.data);
        setLoading(prev => ({ ...prev, [which]: false }));
      })
      .catch(err => {
        // Ignore aborts — they are intentional
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || err?.message === 'canceled') {
          return;
        }
        if (abortRefs.current[which] !== controller) return;

        const isTimeout = err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '');
        const status    = err?.response?.status;
        const friendly  =
          isTimeout
            ? 'The server took too long to respond. Try a narrower filter or retry.'
            : status
              ? `Server returned ${status}. Please try again.`
              : 'Network error. Please check your connection and retry.';

        setError(prev => ({ ...prev, [which]: friendly }));
        setLoading(prev => ({ ...prev, [which]: false }));
        // Important: do NOT wipe old data — keep last successful report visible
      });
  }, [attReport, feeReport, perfReport, error]);

  // ── Progressive fees loader: summary first, then details ──────
  const fetchFeesProgressive = useCallback((params) => {
    const key = JSON.stringify(params || {});
    // Cancel any in-flight fees requests
    if (abortRefs.current.fees)        { try { abortRefs.current.fees.abort(); } catch { /* noop */ } }
    if (abortRefs.current.feesDetails) { try { abortRefs.current.feesDetails.abort(); } catch { /* noop */ } }

    const summaryCtrl = new AbortController();
    const detailsCtrl = new AbortController();
    abortRefs.current.fees        = summaryCtrl;
    abortRefs.current.feesDetails = detailsCtrl;
    requestKey.current.fees        = key;
    requestKey.current.feesDetails = key;

    setLoading(prev => ({ ...prev, fees: true }));
    setError(prev   => ({ ...prev, fees: null }));
    setFeeDetailsLoading(true);

    // Fire summary + full in parallel; render summary immediately, merge details when ready
    Promise.allSettled([
      API.get('/reports/fees', { params: { ...params, summary: true }, signal: summaryCtrl.signal }),
      API.get('/reports/fees', { params, signal: detailsCtrl.signal }),
    ]).then(([sumRes, fullRes]) => {
      // Summary (cards + bars + pie) — render ASAP
      if (sumRes.status === 'fulfilled' && abortRefs.current.fees === summaryCtrl) {
        setFeeReport(prev => ({ ...(prev || {}), ...sumRes.value.data }));
        setLoading(prev => ({ ...prev, fees: false }));
      } else if (sumRes.status === 'rejected') {
        const err = sumRes.reason;
        if (!(err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || err?.message === 'canceled')) {
          const isTimeout = err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '');
          const status    = err?.response?.status;
          setError(prev => ({
            ...prev,
            fees: isTimeout
              ? 'The server took too long to respond. Try a narrower filter or retry.'
              : status ? `Server returned ${status}. Please try again.`
                       : 'Network error. Please check your connection and retry.',
          }));
          setLoading(prev => ({ ...prev, fees: false }));
        }
      }

      // Full payload (with overdue + trend) — patch in once ready
      if (fullRes.status === 'fulfilled' && abortRefs.current.feesDetails === detailsCtrl) {
        setFeeReport(prev => ({ ...(prev || {}), ...fullRes.value.data }));
        setFeeDetailsLoading(false);
      } else if (fullRes.status === 'rejected') {
        const err = fullRes.reason;
        if (!(err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || err?.message === 'canceled')) {
          // Don't promote details failure into a page-level error if summary already painted.
          setFeeDetailsLoading(false);
        }
      }
    });
  }, []);

  // ── Trigger fetch on tab/filter change (debounced 300ms) ──────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (tab === 'attendance') {
        const params = {};
        if (batchFilter) params.batchId   = batchFilter;
        if (startDate)   params.startDate = startDate;
        if (endDate)     params.endDate   = endDate;
        fetchReport('attendance', params);
      } else if (tab === 'fees') {
        const params = {};
        if (batchFilter) params.batchId = batchFilter;
        fetchFeesProgressive(params);
      } else if (tab === 'performance') {
        const params = {};
        if (batchFilter)   params.batchId = batchFilter;
        if (subjectFilter) params.subject = subjectFilter;
        fetchReport('performance', params);
      }
    }, 300); // gentle debounce on rapid filter changes

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [tab, batchFilter, subjectFilter, startDate, endDate, fetchReport, fetchFeesProgressive]);

  // Abort any pending request when tab changes (so old slow tabs don't crash new tab)
  useEffect(() => {
    const controllers = abortRefs.current;
    return () => {
      Object.values(controllers).forEach(c => { try { c?.abort(); } catch {/* noop */} });
    };
  }, []);

  const subjects = useMemo(
    () => [...new Set(batches.map(b => b.subject).filter(Boolean))],
    [batches],
  );

  // ── Memoized chart-ready fee data (numeric coercion, stable refs) ───
  const feeTotals = useMemo(() => ({
    total:                    Number(feeReport?.totalFee || feeReport?.totals?.total || 0),
    paid:                     Number(getPaidAmount(feeReport) || 0),
    pendingTillCurrentMonth:  Number(getPendingTillCurrentMonth(feeReport) || 0),
    upcoming:                 Number(getUpcomingAmount(feeReport) || 0),
  }), [feeReport]);

  const feePieData = useMemo(() => ([
    { name: 'Paid',                     value: feeTotals.paid },
    { name: 'Pending (till this month)', value: feeTotals.pendingTillCurrentMonth },
    { name: 'Upcoming',                 value: feeTotals.upcoming },
  ]), [feeTotals]);

  const feeBatchData = useMemo(() => {
    const rows = feeReport?.batchWise || feeReport?.batches || [];
    // Coerce every numeric field so Recharts gets clean numbers
    return rows.map(b => ({
      batchId:                 b.batchId,
      batchName:               b.batchName || '—',
      paid:                    Number(b.paid                    || b.collected || 0),
      pendingTillCurrentMonth: Number(b.pendingTillCurrentMonth || 0),
      upcoming:                Number(b.upcoming                || 0),
      total:                   Number(b.total                   || 0),
    }));
  }, [feeReport]);

  const feeTrendData = useMemo(
    () => (feeReport?.collectionTrend || []).map(t => ({
      month: t.month,
      collected: Number(t.collected || 0),
    })),
    [feeReport],
  );

  // ── Manual retry handlers ─────────────────────────────────────
  const retry = which => {
    // Clear dedupe key so the request actually fires
    requestKey.current[which] = '';
    setError(prev => ({ ...prev, [which]: null }));
    if (which === 'attendance') {
      const params = {};
      if (batchFilter) params.batchId   = batchFilter;
      if (startDate)   params.startDate = startDate;
      if (endDate)     params.endDate   = endDate;
      fetchReport('attendance', params);
    } else if (which === 'fees') {
      const params = {};
      if (batchFilter) params.batchId = batchFilter;
      fetchFeesProgressive(params);
    } else if (which === 'performance') {
      const params = {};
      if (batchFilter)   params.batchId = batchFilter;
      if (subjectFilter) params.subject = subjectFilter;
      fetchReport('performance', params);
    }
  };

  // ── Overdue helpers ───────────────────────────────────────────
  const overdueList = feeReport?.overdue || [];
  const allOverdueSelected =
    overdueList.length > 0 && overdueList.every(o => overdueSelected[o.studentId]);
  const someOverdueSelected =
    overdueList.some(o => overdueSelected[o.studentId]);

  const toggleSelectAll = () => {
    if (allOverdueSelected) {
      setOverdueSelected({});
    } else {
      const next = {};
      overdueList.forEach(o => { next[o.studentId] = true; });
      setOverdueSelected(next);
    }
  };

  const toggleSelectOne = sid => {
    setOverdueSelected(prev => ({ ...prev, [sid]: !prev[sid] }));
  };

  const sendOneReminder = async (overdue) => {
    if (!overdue?.studentId) return;
    setSendingReminder(prev => ({ ...prev, [overdue.studentId]: true }));
    try {
      await API.post('/reminders/send-now', {
        studentId: overdue.studentId,
        amount:    overdue.amount,
        dueDate:   overdue.dueDate,
        type:      'overdue',
      });
      setReminderToast({ kind: 'ok', text: `Reminder sent to ${overdue.studentName || 'student'}.` });
    } catch (err) {
      setReminderToast({ kind: 'err', text: `Failed to send reminder${err?.response?.status ? ` (${err.response.status})` : ''}.` });
    } finally {
      setSendingReminder(prev => {
        const next = { ...prev };
        delete next[overdue.studentId];
        return next;
      });
      setTimeout(() => setReminderToast(null), 3500);
    }
  };

  const sendSelectedReminders = async () => {
    const targets = overdueList.filter(o => overdueSelected[o.studentId]);
    if (!targets.length) return;
    setSendingReminder(prev => ({ ...prev, __bulk__: true }));
    let ok = 0;
    let fail = 0;
    for (const t of targets) {
      try {
        await API.post('/reminders/send-now', {
          studentId: t.studentId,
          amount:    t.amount,
          dueDate:   t.dueDate,
          type:      'overdue',
        });
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    setSendingReminder(prev => {
      const next = { ...prev };
      delete next.__bulk__;
      return next;
    });
    setReminderToast({
      kind: fail === 0 ? 'ok' : (ok === 0 ? 'err' : 'mixed'),
      text: `Reminders sent: ${ok}${fail ? ` · failed: ${fail}` : ''}.`,
    });
    setTimeout(() => setReminderToast(null), 4000);
  };

  // Whether ANYTHING is currently refreshing (used for the floating badge)
  const anyRefreshing =
    (tab === 'attendance'  && loading.attendance && !!attReport)  ||
    (tab === 'fees'        && (loading.fees || feeDetailsLoading) && !!feeReport) ||
    (tab === 'performance' && loading.performance && !!perfReport);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div data-testid="reports-page" className="relative animate-fade-in">

      {/* ══════════════════════════════════════════════════════
          STICKY TOOLBAR
      ══════════════════════════════════════════════════════ */}
      <div
        className="sticky top-0 z-20 -mx-4 lg:-mx-7 px-4 lg:px-7 pb-4 pt-4"
        style={{
          background:           'rgba(14,12,23,0.88)',
          backdropFilter:       'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom:         '1px solid rgba(255,255,255,0.08)',
          boxShadow:            '0 4px 20px rgba(0,0,0,0.28)',
        }}
      >
        {/* Row 1 — title */}
        <div className="mb-3">
          <h1 className="text-[1.2rem] font-bold tracking-tight leading-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
            Reports
          </h1>
          <p className="text-[11.5px] mt-0.5" style={{ color: T.muted }}>
            {TAB_SUBTITLE[tab]}
          </p>
        </div>

        {/* Row 2 — tabs + filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab switcher */}
          <div
            className="flex gap-1 p-1 rounded-xl shrink-0"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {['attendance', 'fees', 'performance'].map(t => (
              <button
                key={t}
                data-testid={`report-tab-${t}`}
                onClick={() => setTab(t)}
                className="px-3.5 py-1.5 rounded-[9px] text-[11.5px] font-bold capitalize"
                style={
                  tab === t
                    ? { background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)', color: '#fff', boxShadow: '0 2px 12px rgba(108,60,244,0.40)', transition: 'none' }
                    : { color: 'rgba(255,255,255,0.50)', transition: 'color 0.12s ease' }
                }
                onMouseEnter={e => { if (tab !== t) e.currentTarget.style.color = 'rgba(255,255,255,0.82)'; }}
                onMouseLeave={e => { if (tab !== t) e.currentTarget.style.color = 'rgba(255,255,255,0.50)'; }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Batch filter */}
          <DarkSelect
            data-testid="report-batch-filter"
            value={batchFilter}
            onChange={e => setBatchFilter(e.target.value)}
          >
            <option value="" style={{ background: '#1a1625' }}>All Batches</option>
            {batches.map(b => <option key={b.id} value={b.id} style={{ background: '#1a1625' }}>{b.batchName}</option>)}
          </DarkSelect>

          {/* Subject filter (performance only) */}
          {tab === 'performance' && (
            <DarkSelect
              data-testid="report-subject-filter"
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
            >
              <option value="" style={{ background: '#1a1625' }}>All Subjects</option>
              {subjects.map(s => <option key={s} value={s} style={{ background: '#1a1625' }}>{s}</option>)}
            </DarkSelect>
          )}

          {/* Date range (attendance only) */}
          {tab === 'attendance' && (
            <div className="flex items-center gap-1.5">
              <Calendar size={13} style={{ color: T.muted }} />
              <DarkDateInput value={startDate} onChange={e => setStartDate(e.target.value)} data-testid="report-start-date" />
              <span className="text-[11px]" style={{ color: T.muted }}>to</span>
              <DarkDateInput value={endDate} onChange={e => setEndDate(e.target.value)} data-testid="report-end-date" />
            </div>
          )}
        </div>
      </div>
      {/* ── end sticky toolbar ── */}

      {/* Reminder toast */}
      {reminderToast && (
        <div
          className="fixed bottom-6 right-6 z-30 px-4 py-2.5 rounded-xl text-[12px] font-semibold"
          style={{
            ...GLASS,
            background: reminderToast.kind === 'err'
              ? 'linear-gradient(145deg, rgba(239,68,68,0.18), rgba(239,68,68,0.06))'
              : reminderToast.kind === 'mixed'
                ? 'linear-gradient(145deg, rgba(251,191,36,0.18), rgba(251,191,36,0.06))'
                : 'linear-gradient(145deg, rgba(52,211,153,0.18), rgba(52,211,153,0.06))',
            color: reminderToast.kind === 'err' ? '#fca5a5'
                 : reminderToast.kind === 'mixed' ? '#fbbf24'
                 : '#6ee7b7',
          }}
        >
          {reminderToast.text}
        </div>
      )}

      <div className="mt-5 space-y-5">

        {/* ══════════════════════════════════════════════════════
            ATTENDANCE TAB
        ══════════════════════════════════════════════════════ */}
        {tab === 'attendance' && (
          <>
            {error.attendance && (
              <ErrorCard message={error.attendance} onRetry={() => retry('attendance')} testId="attendance-error" />
            )}

            {attReport ? (
              <>
                {/* Batch bar chart */}
                {attReport.batches?.length > 0 && (
                  <GCard className="p-5" data-testid="attendance-batch-chart">
                    <CardHead
                      icon={BarChart3}
                      iconBg="rgba(108,60,244,0.15)"
                      iconColor="#a78bfa"
                      title="Batch-wise Attendance Rate"
                    />
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={attReport.batches} barSize={36}>
                        <defs>
                          <linearGradient id="barGradAtt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#6C3CF4" stopOpacity="0.8" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                        <XAxis dataKey="batchName" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                        <Tooltip formatter={val => [`${val}%`, 'Rate']} contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(108,60,244,0.06)', radius: 6 }} />
                        <Bar dataKey="rate" fill="url(#barGradAtt)" radius={[8, 8, 0, 0]}
                          style={{ filter: 'drop-shadow(0 4px 8px rgba(108,60,244,0.35))' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </GCard>
                )}

                {/* Monthly trend */}
                {attReport.monthlyTrend?.length > 0 && (
                  <GCard className="p-5" data-testid="attendance-monthly-trend">
                    <CardHead
                      icon={TrendingUp}
                      iconBg="rgba(108,60,244,0.15)"
                      iconColor="#a78bfa"
                      title="Monthly Attendance Trend"
                    />
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={attReport.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                        <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                        <Tooltip formatter={val => [`${val}%`, 'Attendance Rate']} contentStyle={TOOLTIP_STYLE} />
                        <Line
                          type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2.5}
                          dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }}
                          activeDot={{ r: 6, fill: '#c4b5fd', strokeWidth: 0 }}
                          style={{ filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.6))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </GCard>
                )}

                {/* Student details table */}
                <GCard style={{ overflow: 'hidden' }} hover={false}>
                  <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="text-[13.5px] font-semibold" style={{ color: T.primary }}>Student Attendance Details</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full" data-testid="attendance-report-table">
                      <TableHead cols={[
                        { label: 'Student' }, { label: 'Present' }, { label: 'Absent' }, { label: 'Total' }, { label: 'Rate' }
                      ]} />
                      <tbody>
                        {attReport.students?.map((s, i, arr) => (
                          <TableRow key={s.studentId} last={i === arr.length - 1}>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <Avatar name={s.studentName} size={28} />
                                <span className="text-[12.5px] font-semibold" style={{ color: T.primary }}>{s.studentName}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-[12px] font-semibold" style={{ color: '#34d399' }}>{s.present}</td>
                            <td className="px-5 py-3 text-[12px] font-semibold" style={{ color: '#f87171' }}>{s.absent}</td>
                            <td className="px-5 py-3 text-[12px]" style={{ color: T.secondary }}>{s.total}</td>
                            <td className="px-5 py-3"><ScoreBadge pct={s.rate} /></td>
                          </TableRow>
                        ))}
                        {!attReport.students?.length && <EmptyRow cols={5} text="No attendance data found" />}
                      </tbody>
                    </table>
                  </div>
                </GCard>
              </>
            ) : (
              !error.attendance && <LoadingState />
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════
            FEES TAB
        ══════════════════════════════════════════════════════ */}
        {tab === 'fees' && (
          <>
            {error.fees && (
              <ErrorCard message={error.fees} onRetry={() => retry('fees')} testId="fees-error" />
            )}

            {feeReport ? (
              <>
                {/* Summary stat cards — instant paint from summary endpoint */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard testId="fee-total-card"     icon={CreditCard}  iconColor="#a78bfa" label="Total Fee"  value={formatCurrency(feeTotals.total)} />
                  <StatCard testId="fee-collected-card" icon={TrendingUp}  iconColor="#34d399" label="Collected"  value={formatCurrency(feeTotals.paid)} valueColor="#34d399" />
                  <StatCard testId="fee-pending-card"   icon={BarChart3}   iconColor="#f87171" label="Pending"    value={formatCurrency(feeTotals.pendingTillCurrentMonth)} valueColor="#f87171" />
                  <StatCard testId="fee-upcoming-card"  icon={Clock}       iconColor="#fbbf24" label="Upcoming"   value={formatCurrency(feeTotals.upcoming)} valueColor="#fbbf24" />
                </div>

                {/* Pie + Batch bar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {feeTotals.total > 0 ? (
                    <GCard className="p-5" data-testid="fee-pie-chart">
                      <CardHead icon={CreditCard} iconBg="rgba(16,185,129,0.14)" iconColor="#34d399" title="Fee Collection Overview" />
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={feePieData}
                            cx="50%" cy="50%"
                            outerRadius={80} innerRadius={50}
                            paddingAngle={3} dataKey="value"
                            strokeWidth={0}
                            isAnimationActive={false}
                            style={{ filter: 'drop-shadow(0 0 10px rgba(52,211,153,0.30))' }}
                          >
                            <Cell fill="#34d399" />
                            <Cell fill="#f87171" />
                            <Cell fill="#fbbf24" />
                          </Pie>
                          <Tooltip formatter={val => formatCurrency(val)} contentStyle={TOOLTIP_STYLE} />
                          <Legend
                            wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', paddingTop: 8 }}
                            iconType="circle"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </GCard>
                  ) : (
                    <GCard className="p-5" data-testid="fee-pie-chart">
                      <CardHead icon={CreditCard} iconBg="rgba(16,185,129,0.14)" iconColor="#34d399" title="Fee Collection Overview" />
                      <ChartSkeleton height={220} label="Preparing collection breakdown…" />
                    </GCard>
                  )}

                  {feeBatchData.length > 0 ? (
                    <GCard className="p-5" data-testid="fee-batch-chart">
                      <CardHead icon={BarChart3} iconBg="rgba(108,60,244,0.15)" iconColor="#a78bfa" title="Batch-wise Collection" />
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={feeBatchData} barSize={16} barGap={4} barCategoryGap="20%">
                          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                          <XAxis dataKey="batchName" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[0, 'auto']} allowDecimals={false} />
                          <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            formatter={val => formatCurrency(val)}
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', paddingTop: 8 }}
                            iconType="circle"
                          />
                          <Bar dataKey="paid"
                               fill="#34d399" radius={[4, 4, 0, 0]} name="Paid"
                               minPointSize={4} isAnimationActive={false}
                               style={{ filter: 'drop-shadow(0 3px 6px rgba(52,211,153,0.35))' }} />
                          <Bar dataKey="pendingTillCurrentMonth"
                               fill="#f87171" radius={[4, 4, 0, 0]} name="Pending (till this month)"
                               minPointSize={4} isAnimationActive={false}
                               style={{ filter: 'drop-shadow(0 3px 6px rgba(248,113,113,0.35))' }} />
                          <Bar dataKey="upcoming"
                               fill="#fbbf24" radius={[4, 4, 0, 0]} name="Upcoming"
                               minPointSize={4} isAnimationActive={false}
                               style={{ filter: 'drop-shadow(0 3px 6px rgba(251,191,36,0.35))' }} />
                        </BarChart>
                      </ResponsiveContainer>
                    </GCard>
                  ) : (
                    <GCard className="p-5" data-testid="fee-batch-chart">
                      <CardHead icon={BarChart3} iconBg="rgba(108,60,244,0.15)" iconColor="#a78bfa" title="Batch-wise Collection" />
                      <ChartSkeleton height={220} label="Preparing batch breakdown…" />
                    </GCard>
                  )}
                </div>

                {/* Monthly trend */}
                {feeTrendData.length > 0 && (
                  <GCard className="p-5" data-testid="fee-collection-trend">
                    <CardHead icon={TrendingUp} iconBg="rgba(16,185,129,0.14)" iconColor="#34d399" title="Monthly Collection Trend" />
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={feeTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                        <XAxis dataKey="month"     tick={AXIS_TICK} axisLine={false} tickLine={false} />
                        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                        <Tooltip formatter={val => formatCurrency(val)} contentStyle={TOOLTIP_STYLE} />
                        <Line
                          type="monotone" dataKey="collected" stroke="#34d399" strokeWidth={2.5}
                          dot={{ fill: '#34d399', r: 4, strokeWidth: 0 }}
                          activeDot={{ r: 6, fill: '#6ee7b7', strokeWidth: 0 }}
                          style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.55))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </GCard>
                )}

                {/* Overdue table — lazy-loaded with details payload */}
                {feeDetailsLoading && !(feeReport.overdue?.length) && (
                  <GCard style={{ overflow: 'hidden' }} hover={false}>
                    <div className="px-5 py-4 flex items-center gap-2.5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(248,113,113,0.26)' }}>
                        <BarChart3 size={14} style={{ color: '#f87171' }} />
                      </div>
                      <h3 className="text-[13.5px] font-semibold" style={{ color: '#f87171' }}>
                        Overdue Payments
                      </h3>
                    </div>
                    <TableSkeleton rows={4} />
                  </GCard>
                )}
                {feeReport.overdue?.length > 0 && (
                  <GCard style={{ overflow: 'hidden' }} hover={false} data-testid="fee-overdue-table">
                    <div className="px-5 py-4 flex items-center justify-between gap-2.5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(248,113,113,0.26)' }}>
                          <BarChart3 size={14} style={{ color: '#f87171' }} />
                        </div>
                        <h3 className="text-[13.5px] font-semibold" style={{ color: '#f87171' }}>
                          Overdue Payments ({feeReport.overdue.length})
                        </h3>
                      </div>
                      <button
                        data-testid="overdue-remind-selected"
                        onClick={sendSelectedReminders}
                        disabled={!someOverdueSelected || !!sendingReminder.__bulk__}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold"
                        style={{
                          background: (!someOverdueSelected || sendingReminder.__bulk__)
                            ? 'rgba(255,255,255,0.06)'
                            : 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',
                          color: (!someOverdueSelected || sendingReminder.__bulk__) ? T.muted : '#fff',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: (!someOverdueSelected || sendingReminder.__bulk__)
                            ? 'none' : '0 2px 12px rgba(108,60,244,0.40)',
                          cursor: (!someOverdueSelected || sendingReminder.__bulk__) ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Bell size={12} />
                        {sendingReminder.__bulk__ ? 'Sending…' : 'Send Selected Reminders'}
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <TableHead cols={[
                          {
                            key: 'select',
                            label: (
                              <input
                                type="checkbox"
                                data-testid="overdue-select-all"
                                checked={allOverdueSelected}
                                ref={el => { if (el) el.indeterminate = !allOverdueSelected && someOverdueSelected; }}
                                onChange={toggleSelectAll}
                                style={{ accentColor: '#6C3CF4', cursor: 'pointer' }}
                              />
                            ),
                          },
                          { label: 'Student' },
                          { label: 'Amount' },
                          { label: 'Due Date' },
                          { label: 'Action' },
                        ]} />
                        <tbody>
                          {feeReport.overdue.map((o, i, arr) => {
                            const sid = o.studentId;
                            const checked = !!overdueSelected[sid];
                            const sending = !!sendingReminder[sid];
                            return (
                              <TableRow key={sid || i} last={i === arr.length - 1}>
                                <td className="px-5 py-3">
                                  <input
                                    type="checkbox"
                                    data-testid={`overdue-select-${sid}`}
                                    checked={checked}
                                    onChange={() => toggleSelectOne(sid)}
                                    style={{ accentColor: '#6C3CF4', cursor: 'pointer' }}
                                  />
                                </td>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-2.5">
                                    <Avatar name={o.studentName} size={28} />
                                    <span className="text-[12.5px] font-semibold" style={{ color: T.primary }}>{o.studentName}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-3">
                                  <span className="text-[12px] font-bold" style={{ color: '#f87171' }}>
                                    {formatCurrency(o.amount)}
                                  </span>
                                </td>
                                <td className="px-5 py-3 text-[12px]" style={{ color: T.muted }}>{o.dueDate}</td>
                                <td className="px-5 py-3">
                                  <button
                                    data-testid={`overdue-remind-${sid}`}
                                    onClick={() => sendOneReminder(o)}
                                    disabled={sending}
                                    title="Send reminder"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                                    style={{
                                      background: 'rgba(108,60,244,0.14)',
                                      border:     '1px solid rgba(108,60,244,0.30)',
                                      color:      '#c4b5fd',
                                      cursor:     sending ? 'not-allowed' : 'pointer',
                                      opacity:    sending ? 0.6 : 1,
                                    }}
                                  >
                                    <Bell size={11} />
                                    {sending ? 'Sending…' : 'Send'}
                                  </button>
                                </td>
                              </TableRow>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </GCard>
                )}
              </>
            ) : (
              !error.fees && <FeesInitialSkeleton />
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════
            PERFORMANCE TAB
        ══════════════════════════════════════════════════════ */}
        {tab === 'performance' && (
          <>
            {error.performance && (
              <ErrorCard message={error.performance} onRetry={() => retry('performance')} testId="performance-error" />
            )}

            {perfReport ? (
              perfReport.tests?.length > 0 ? (
                <>
                  {/* Test performance bar chart */}
                  <GCard className="p-5" data-testid="performance-chart">
                    <CardHead icon={BarChart3} iconBg="rgba(108,60,244,0.15)" iconColor="#a78bfa" title="Test Performance Overview" />
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={perfReport.tests} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                        <XAxis dataKey="testName" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar dataKey="average" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Average"
                          style={{ filter: 'drop-shadow(0 3px 7px rgba(139,92,246,0.40))' }} />
                        <Bar dataKey="highest" fill="#34d399" radius={[4, 4, 0, 0]} name="Highest"
                          style={{ filter: 'drop-shadow(0 3px 7px rgba(52,211,153,0.38))' }} />
                        <Bar dataKey="lowest"  fill="#fbbf24" radius={[4, 4, 0, 0]} name="Lowest"
                          style={{ filter: 'drop-shadow(0 3px 7px rgba(251,191,36,0.38))' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </GCard>

                  {/* Test details table */}
                  <GCard style={{ overflow: 'hidden' }} hover={false}>
                    <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <h3 className="text-[13.5px] font-semibold" style={{ color: T.primary }}>Test Details</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full" data-testid="performance-report-table">
                        <TableHead cols={[
                          { label: 'Test' }, { label: 'Subject' }, { label: 'Batch' },
                          { label: 'Average' }, { label: 'Highest' }, { label: 'Lowest' }, { label: 'Students' }
                        ]} />
                        <tbody>
                          {perfReport.tests.map((p, i, arr) => (
                            <TableRow key={i} last={i === arr.length - 1}>
                              <td className="px-5 py-3 text-[12.5px] font-semibold" style={{ color: T.primary }}>{p.testName}</td>
                              <td className="px-5 py-3">
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
                                  style={{ background: 'rgba(59,130,246,0.14)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.22)' }}>
                                  {p.subject || '—'}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
                                  style={{ background: 'rgba(108,60,244,0.13)', color: '#c4b5fd', border: '1px solid rgba(108,60,244,0.22)' }}>
                                  {p.batchName || '—'}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-[12px] font-bold" style={{ color: '#c4b5fd' }}>
                                {p.average}/{p.maximumMarks}
                              </td>
                              <td className="px-5 py-3 text-[12px] font-semibold" style={{ color: '#34d399' }}>{p.highest}</td>
                              <td className="px-5 py-3 text-[12px] font-semibold" style={{ color: '#f87171' }}>{p.lowest}</td>
                              <td className="px-5 py-3 text-[12px]" style={{ color: T.muted }}>{p.totalStudents}</td>
                            </TableRow>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </GCard>

                  {/* Top students */}
                  {perfReport.topStudents?.length > 0 && (
                    <GCard style={{ overflow: 'hidden' }} hover={false} data-testid="top-students-table">
                      <div className="px-5 py-4 flex items-center gap-2.5"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(245,158,11,0.16)', border: '1px solid rgba(251,191,36,0.28)' }}>
                          <Award size={14} style={{ color: '#fbbf24' }} />
                        </div>
                        <h3 className="text-[13.5px] font-semibold" style={{ color: T.primary }}>Top Performing Students</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <TableHead cols={[
                            { label: 'Rank' }, { label: 'Student' }, { label: 'Batch' },
                            { label: 'Total Marks' }, { label: 'Percentage' }, { label: 'Tests' }
                          ]} />
                          <tbody>
                            {perfReport.topStudents.map((s, i, arr) => {
                              const pct = s.percentage;
                              const [barColor] = pct >= 80 ? ['#34d399'] : pct >= 60 ? ['#fbbf24'] : ['#f87171'];
                              return (
                                <TableRow key={s.studentId} last={i === arr.length - 1}>
                                  {/* Rank */}
                                  <td className="px-5 py-3">
                                    <RankBubble rank={i + 1} />
                                  </td>

                                  {/* Student */}
                                  <td className="px-5 py-3">
                                    <div className="flex items-center gap-2.5">
                                      <Avatar name={s.studentName} size={28} />
                                      <span className="text-[12.5px] font-semibold" style={{ color: T.primary }}>{s.studentName}</span>
                                    </div>
                                  </td>

                                  {/* Batch */}
                                  <td className="px-5 py-3">
                                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
                                      style={{ background: 'rgba(108,60,244,0.13)', color: '#c4b5fd', border: '1px solid rgba(108,60,244,0.22)' }}>
                                      {s.batchName}
                                    </span>
                                  </td>

                                  {/* Marks */}
                                  <td className="px-5 py-3 text-[12px]" style={{ color: T.secondary }}>
                                    {s.totalMarks}/{s.totalMax}
                                  </td>

                                  {/* Percentage with progress bar */}
                                  <td className="px-5 py-3">
                                    <div className="flex items-center gap-2.5 min-w-[120px]">
                                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                        <div
                                          className="h-full rounded-full"
                                          style={{
                                            width:       `${Math.min(pct, 100)}%`,
                                            background:  `linear-gradient(90deg,${barColor},${barColor}aa)`,
                                            boxShadow:   `0 0 6px ${barColor}55`,
                                            transition:  'width 0.6s ease',
                                          }}
                                        />
                                      </div>
                                      <ScoreBadge pct={pct} />
                                    </div>
                                  </td>

                                  {/* Test count */}
                                  <td className="px-5 py-3 text-[12px]" style={{ color: T.muted }}>{s.testCount}</td>
                                </TableRow>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </GCard>
                  )}
                </>
              ) : (
                /* Performance empty state */
                <div className="flex flex-col items-center justify-center py-20 gap-4" style={GLASS}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(108,60,244,0.12)', border: '1px solid rgba(108,60,244,0.24)' }}>
                    <BarChart3 size={24} style={{ color: '#a78bfa' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-[13.5px] font-semibold" style={{ color: T.secondary }}>No performance data available</p>
                    <p className="text-[11px] mt-1" style={{ color: T.muted }}>Select a batch or adjust your filters</p>
                  </div>
                </div>
              )
            ) : (
              !error.performance && <LoadingState />
            )}
          </>
        )}

        {/* Loading shimmer while refetching with existing data */}
        {anyRefreshing && (
          <div
            className="fixed top-20 right-4 z-30 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px]"
            style={{
              background: 'rgba(108,60,244,0.14)',
              border:     '1px solid rgba(108,60,244,0.28)',
              color:      '#c4b5fd',
              backdropFilter:       'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              boxShadow:  '0 4px 18px rgba(0,0,0,0.32)',
            }}
            data-testid="reports-refreshing-badge"
          >
            <span className="w-3 h-3 rounded-full animate-spin"
              style={{ border: '2px solid rgba(108,60,244,0.30)', borderTopColor: '#a78bfa' }} />
            Refreshing…
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Loading state ────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4" style={GLASS}>
      <div className="w-10 h-10 rounded-full animate-spin"
        style={{ border: '3px solid rgba(108,60,244,0.20)', borderTopColor: '#7c4ff5' }} />
      <p className="text-[12px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>
        Loading report data…
      </p>
    </div>
  );
}

/** Small inline "refreshing" pill — keeps old data visible while new loads. */
function RefetchHint({ floating = false }) {
  const inner = (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px]"
      style={{
        background: 'rgba(108,60,244,0.10)',
        border:     '1px solid rgba(108,60,244,0.22)',
        color:      '#c4b5fd',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <span className="w-3 h-3 rounded-full animate-spin"
        style={{ border: '2px solid rgba(108,60,244,0.30)', borderTopColor: '#a78bfa' }} />
      Refreshing…
    </div>
  );
  if (floating) {
    return (
      <div className="absolute top-3 right-4 z-10 pointer-events-none">{inner}</div>
    );
  }
  return <div className="flex justify-center">{inner}</div>;
}

/** Lightweight skeleton that mimics the chart area without blocking. */
function ChartSkeleton({ height = 220, label = 'Loading chart…' }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{
        height,
        background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
        border:     '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(108,60,244,0.10) 50%, transparent 100%)',
          animation: 'fadeIn 1.4s ease-in-out infinite',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
          <Clock size={12} />
          {label}
        </div>
      </div>
    </div>
  );
}

/** Skeleton for the overdue table — appears while overdue data is lazy-loading. */
function TableSkeleton({ rows = 4 }) {
  return (
    <div className="px-5 py-3 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="h-3 flex-1 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="h-3 w-20 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
      ))}
    </div>
  );
}

/** Initial-paint skeleton for the fees tab (cards + chart placeholders).
 *  Used only before the very first summary response — keeps the page interactive. */
function FeesInitialSkeleton() {
  const CardSkel = () => (
    <div className="p-5" style={GLASS}>
      <div className="flex items-center justify-between mb-3">
        <div className="h-2.5 w-16 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <div className="w-9 h-9 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
      <div className="h-6 w-32 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="mt-2.5 h-[2px] rounded-full w-1/3" style={{ background: 'rgba(108,60,244,0.25)' }} />
    </div>
  );
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardSkel /><CardSkel /><CardSkel /><CardSkel />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5" style={GLASS}>
          <ChartSkeleton height={220} label="Preparing collection breakdown…" />
        </div>
        <div className="p-5" style={GLASS}>
          <ChartSkeleton height={220} label="Preparing batch breakdown…" />
        </div>
      </div>
    </div>
  );
}
