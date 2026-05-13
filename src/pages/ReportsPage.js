import { useState, useEffect } from 'react';
import API from '@/api';
import { BarChart3, TrendingUp, Award, Calendar, ChevronDown, CreditCard, Users } from 'lucide-react';
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

/** Dark glass table container with overflow-x-auto */
function DTable({ children, testId }) {
  return (
    <GCard style={{ overflow: 'hidden' }} hover={false} data-testid={testId}>
      <div className="overflow-x-auto">{children}</div>
    </GCard>
  );
}

function TableHead({ cols }) {
  return (
    <thead>
      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
        {cols.map(({ label, cls = '' }) => (
          <th key={label} className={`text-left px-5 py-3${cls}`}
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

// ─── Main component ────────────────────────────────────────────

export default function ReportsPage() {
  // ── State (unchanged) ─────────────────────────────────────────
  const [tab,           setTab]           = useState('attendance');
  const [attReport,     setAttReport]     = useState(null);
  const [feeReport,     setFeeReport]     = useState(null);
  const [perfReport,    setPerfReport]    = useState(null);
  const [batches,       setBatches]       = useState([]);
  const [batchFilter,   setBatchFilter]   = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [startDate,     setStartDate]     = useState('');
  const [endDate,       setEndDate]       = useState('');

  // ── Effects (unchanged) ───────────────────────────────────────
  useEffect(() => { API.get('/batches').then(r => setBatches(r.data)); }, []);

  useEffect(() => {
    if (tab === 'attendance') {
      const params = {};
      if (batchFilter) params.batchId   = batchFilter;
      if (startDate)   params.startDate = startDate;
      if (endDate)     params.endDate   = endDate;
      API.get('/reports/attendance', { params }).then(r => setAttReport(r.data));
    } else if (tab === 'fees') {
      const params = {};
      if (batchFilter) params.batchId = batchFilter;
      API.get('/reports/fees', { params }).then(r => setFeeReport(r.data));
    } else if (tab === 'performance') {
      const params = {};
      if (batchFilter)   params.batchId = batchFilter;
      if (subjectFilter) params.subject  = subjectFilter;
      API.get('/reports/performance', { params }).then(r => setPerfReport(r.data));
    }
  }, [tab, batchFilter, subjectFilter, startDate, endDate]);

  const subjects = [...new Set(batches.map(b => b.subject).filter(Boolean))];

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

      <div className="mt-5 space-y-5">

        {/* ══════════════════════════════════════════════════════
            ATTENDANCE TAB
        ══════════════════════════════════════════════════════ */}
        {tab === 'attendance' && attReport && (
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
        )}

        {/* ══════════════════════════════════════════════════════
            FEES TAB
        ══════════════════════════════════════════════════════ */}
        {tab === 'fees' && feeReport && (
          <>
            {/* Summary stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard testId="fee-total-card"     icon={CreditCard}  iconColor="#a78bfa" label="Total Fee"  value={`Rs.${feeReport.totalFee?.toLocaleString()}`} />
              <StatCard testId="fee-collected-card" icon={TrendingUp}  iconColor="#34d399" label="Collected"  value={`Rs.${feeReport.totalCollected?.toLocaleString()}`} valueColor="#34d399" />
              <StatCard testId="fee-pending-card"   icon={BarChart3}   iconColor="#f87171" label="Pending"    value={`Rs.${feeReport.totalPending?.toLocaleString()}`}  valueColor="#f87171" />
            </div>

            {/* Pie + Batch bar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {feeReport.totalFee > 0 && (
                <GCard className="p-5" data-testid="fee-pie-chart">
                  <CardHead icon={CreditCard} iconBg="rgba(16,185,129,0.14)" iconColor="#34d399" title="Fee Collection Overview" />
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Collected', value: feeReport.totalCollected || 0 },
                          { name: 'Pending',   value: feeReport.totalPending   || 0 },
                        ]}
                        cx="50%" cy="50%"
                        outerRadius={80} innerRadius={50}
                        paddingAngle={3} dataKey="value"
                        strokeWidth={0}
                        style={{ filter: 'drop-shadow(0 0 10px rgba(52,211,153,0.30))' }}
                      >
                        <Cell fill="#34d399" />
                        <Cell fill="#f87171" />
                      </Pie>
                      <Tooltip formatter={val => `Rs.${val.toLocaleString()}`} contentStyle={TOOLTIP_STYLE} />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', paddingTop: 8 }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </GCard>
              )}

              {feeReport.batches?.length > 0 && (
                <GCard className="p-5" data-testid="fee-batch-chart">
                  <CardHead icon={BarChart3} iconBg="rgba(108,60,244,0.15)" iconColor="#a78bfa" title="Batch-wise Collection" />
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={feeReport.batches} barSize={18}>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                      <XAxis dataKey="batchName" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                      <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={val => `Rs.${val.toLocaleString()}`} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="collected" fill="#34d399" radius={[4, 4, 0, 0]} name="Collected"
                        style={{ filter: 'drop-shadow(0 3px 6px rgba(52,211,153,0.35))' }} />
                      <Bar dataKey="pending"   fill="#f87171" radius={[4, 4, 0, 0]} name="Pending"
                        style={{ filter: 'drop-shadow(0 3px 6px rgba(248,113,113,0.35))' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </GCard>
              )}
            </div>

            {/* Monthly trend */}
            {feeReport.collectionTrend?.length > 0 && (
              <GCard className="p-5" data-testid="fee-collection-trend">
                <CardHead icon={TrendingUp} iconBg="rgba(16,185,129,0.14)" iconColor="#34d399" title="Monthly Collection Trend" />
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={feeReport.collectionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                    <XAxis dataKey="month"     tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <Tooltip formatter={val => `Rs.${val.toLocaleString()}`} contentStyle={TOOLTIP_STYLE} />
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

            {/* Overdue table */}
            {feeReport.overdue?.length > 0 && (
              <GCard style={{ overflow: 'hidden' }} hover={false} data-testid="fee-overdue-table">
                <div className="px-5 py-4 flex items-center gap-2.5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(248,113,113,0.26)' }}>
                    <BarChart3 size={14} style={{ color: '#f87171' }} />
                  </div>
                  <h3 className="text-[13.5px] font-semibold" style={{ color: '#f87171' }}>
                    Overdue Payments ({feeReport.overdue.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <TableHead cols={[{ label: 'Student' }, { label: 'Amount' }, { label: 'Due Date' }]} />
                    <tbody>
                      {feeReport.overdue.map((o, i, arr) => (
                        <TableRow key={i} last={i === arr.length - 1}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={o.studentName} size={28} />
                              <span className="text-[12.5px] font-semibold" style={{ color: T.primary }}>{o.studentName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-[12px] font-bold" style={{ color: '#f87171' }}>
                              Rs.{o.amount?.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-[12px]" style={{ color: T.muted }}>{o.dueDate}</td>
                        </TableRow>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GCard>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════
            PERFORMANCE TAB
        ══════════════════════════════════════════════════════ */}
        {tab === 'performance' && perfReport && (
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
        )}

        {/* Loading states */}
        {tab === 'attendance'  && !attReport  && <LoadingState />}
        {tab === 'fees'        && !feeReport   && <LoadingState />}
        {tab === 'performance' && !perfReport  && <LoadingState />}
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
