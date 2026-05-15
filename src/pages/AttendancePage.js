import { useState, useEffect } from 'react';
import API from '@/api';
import {
  ClipboardCheck, Check, X as XIcon, Clock, Save,
  Users, Calendar, ChevronDown, GraduationCap,
  PauseCircle,
} from 'lucide-react';

// ─── Design tokens ─────────────────────────────────────────────

const GLASS = {
  background:           'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))',
  border:               '1px solid rgba(255,255,255,0.09)',
  borderRadius:         '18px',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow:            '0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)',
};

const INPUT_STYLE = {
  background:   'rgba(255,255,255,0.06)',
  border:       '1px solid rgba(255,255,255,0.10)',
  color:        'rgba(255,255,255,0.88)',
  borderRadius: '10px',
  outline:      'none',
  padding:      '9px 12px',
  fontSize:     '13px',
  width:        '100%',
  transition:   'border-color 0.15s ease, box-shadow 0.15s ease',
};

const T = {
  primary:   'rgba(255,255,255,0.92)',
  secondary: 'rgba(255,255,255,0.65)',
  muted:     'rgba(255,255,255,0.45)',
  label:     'rgba(255,255,255,0.38)',
};

// ─── Avatar ─────────────────────────────────────────────────────

function Avatar({ name, size = 30 }) {
  const letter = name?.charAt(0)?.toUpperCase() || '?';
  const palette = ['#6C3CF4', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#0ea5e9'];
  const color   = palette[(name?.charCodeAt(0) || 0) % palette.length];
  return (
    <div
      className="flex items-center justify-center shrink-0 rounded-full font-bold"
      style={{
        width:      size,
        height:     size,
        fontSize:   size * 0.38,
        background: `${color}22`,
        border:     `1px solid ${color}40`,
        color,
      }}
    >
      {letter}
    </div>
  );
}

// ─── Dark select (matches StudentsPage) ─────────────────────────

function DarkSelect({ children, style = {}, ...props }) {
  return (
    <select
      {...props}
      style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer', ...style }}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'rgba(108,60,244,0.65)';
        e.currentTarget.style.boxShadow  = '0 0 0 3px rgba(108,60,244,0.14)';
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
        e.currentTarget.style.boxShadow  = 'none';
      }}
    >
      {children}
    </select>
  );
}

// ─── Dark date input ────────────────────────────────────────────

function DarkDateInput(props) {
  return (
    <input
      type="date"
      {...props}
      style={{ ...INPUT_STYLE, colorScheme: 'dark', width: 'auto' }}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'rgba(108,60,244,0.65)';
        e.currentTarget.style.boxShadow  = '0 0 0 3px rgba(108,60,244,0.14)';
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
        e.currentTarget.style.boxShadow  = 'none';
      }}
    />
  );
}

// ─── Stat card ──────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, animClass }) {
  return (
    <div
      className={`p-4 ${animClass || ''}`}
      style={GLASS}
    >
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-[9.5px] font-bold uppercase"
          style={{ color: T.label, letterSpacing: '0.16em' }}
        >
          {label}
        </p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `${color}1e`,
            border:     `1px solid ${color}30`,
          }}
        >
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p
        className="text-[1.65rem] font-bold leading-none tracking-tight"
        style={{ color: T.primary }}
      >
        {value}
      </p>
      <div
        className="mt-2.5 h-[2px] rounded-full"
        style={{ background: `linear-gradient(90deg,${color}55,transparent)`, width: '38%' }}
      />
    </div>
  );
}

// ─── Attendance status toggle button ────────────────────────────
// Segmented-pill style with dark glass tints.

function StatusPill({ status, onClick, testId, disabled = false }) {
  const cfg = {
    present: {
      bg:     'rgba(16,185,129,0.16)',
      border: 'rgba(52,211,153,0.35)',
      color:  '#34d399',
      icon:   <Check size={12} strokeWidth={2.5} />,
      label:  'Present',
      hover:  'rgba(16,185,129,0.26)',
    },
    late: {
      bg:     'rgba(245,158,11,0.14)',
      border: 'rgba(251,191,36,0.32)',
      color:  '#fbbf24',
      icon:   <Clock size={12} strokeWidth={2.5} />,
      label:  'Late',
      hover:  'rgba(245,158,11,0.24)',
    },
    absent: {
      bg:     'rgba(239,68,68,0.13)',
      border: 'rgba(248,113,113,0.32)',
      color:  '#f87171',
      icon:   <XIcon size={12} strokeWidth={2.5} />,
      label:  'Absent',
      hover:  'rgba(239,68,68,0.22)',
    },
    suspended: {
      bg:     'rgba(148,163,184,0.14)',
      border: 'rgba(203,213,225,0.24)',
      color:  '#cbd5e1',
      icon:   <PauseCircle size={12} strokeWidth={2.5} />,
      label:  'Suspended',
      hover:  'rgba(148,163,184,0.14)',
    },
  };

  const s = cfg[status] ?? cfg.present;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      data-testid={testId}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
      style={{
        background:  s.bg,
        border:      `1px solid ${s.border}`,
        color:       s.color,
        transition:  'background 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease',
        cursor:      disabled ? 'not-allowed' : 'pointer',
        opacity:     disabled ? 0.75 : 1,
        userSelect:  'none',
      }}
      onMouseEnter={e => {
        if (disabled) return;
        e.currentTarget.style.background = s.hover;
        e.currentTarget.style.transform  = 'scale(1.04)';
        e.currentTarget.style.boxShadow  = `0 2px 10px ${s.border}`;
      }}
      onMouseLeave={e => {
        if (disabled) return;
        e.currentTarget.style.background = s.bg;
        e.currentTarget.style.transform  = 'none';
        e.currentTarget.style.boxShadow  = 'none';
      }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.96)'; }}
      onMouseUp={e   => { if (!disabled) e.currentTarget.style.transform = 'scale(1.04)'; }}
    >
      {s.icon}
      {s.label}
    </button>
  );
}

// ─── Quick-action "mark all" chip ───────────────────────────────

function MarkAllChip({ onClick, testId, icon: Icon, label, color, active = false }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[11.5px] font-bold"
      style={{
        background:  active ? `${color}22` : `${color}10`,
        border:      `1px solid ${active ? `${color}52` : `${color}28`}`,
        color,
        transition:  'background 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease',
        boxShadow:   active ? `0 3px 14px ${color}26` : 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${color}1e`;
        e.currentTarget.style.boxShadow  = `0 3px 12px ${color}28`;
        e.currentTarget.style.transform  = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = active ? `${color}22` : `${color}10`;
        e.currentTarget.style.boxShadow  = active ? `0 3px 14px ${color}26` : 'none';
        e.currentTarget.style.transform  = 'none';
      }}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

// ─── Empty state ─────────────────────────────────────────────────

function EmptyState({ text }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 gap-4"
      style={GLASS}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(108,60,244,0.12)', border: '1px solid rgba(108,60,244,0.24)' }}
      >
        <ClipboardCheck size={24} style={{ color: '#a78bfa' }} />
      </div>
      <div className="text-center">
        <p className="text-[13px] font-semibold" style={{ color: T.secondary }}>
          {text}
        </p>
        <p className="text-[11px] mt-1" style={{ color: T.muted }}>
          Attendance will appear here once a batch is selected
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────

export default function AttendancePage() {
  // ── State (unchanged) ──────────────────────────────────────────
  const [batches,       setBatches]       = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [date,          setDate]          = useState(new Date().toISOString().split('T')[0]);
  const [students,      setStudents]      = useState([]);
  const [attendance,    setAttendance]    = useState({});
  const [existingAtt,   setExistingAtt]   = useState([]);
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [features,      setFeatures]      = useState({ late_attendance_enabled: false });
  const [classSuspended, setClassSuspended] = useState(false);

  const lateEnabled = Boolean(features.late_attendance_enabled);

  // ── Effects (unchanged) ────────────────────────────────────────
  useEffect(() => {
    API.get('/batches').then(r => setBatches(r.data));
    API.get('/settings/features')
      .then(r => setFeatures({ late_attendance_enabled: false, ...(r.data || {}) }))
      .catch(() => setFeatures({ late_attendance_enabled: false }));
  }, []);

  useEffect(() => {
    if (!selectedBatch) {
      setStudents([]);
      setAttendance({});
      setExistingAtt([]);
      setClassSuspended(false);
      return;
    }

    let active = true;
    setClassSuspended(false);
    setExistingAtt([]);
    setAttendance({});

    API.get('/students', { params: { batchId: selectedBatch } }).then(r => {
      if (!active) return;
      setStudents(r.data);
      const defaults = {};
      r.data.forEach(s => { defaults[s.id] = 'present'; });
      setAttendance(prev => ({ ...defaults, ...prev }));
    });

    return () => {
      active = false;
    };
  }, [selectedBatch]);

  useEffect(() => {
    if (!selectedBatch || !date) return;

    let active = true;

    API.get('/attendance', { params: { batchId: selectedBatch, date } }).then(r => {
      if (!active) return;
      const payload = r.data || [];
      const records = Array.isArray(payload) ? payload : (payload.records || []);
      const suspended = Boolean(
        (!Array.isArray(payload) && (payload.classSuspended || payload.status === 'suspended')) ||
        records.some(a => a.status === 'suspended' || a.classSuspended)
      );

      setExistingAtt(records);
      setClassSuspended(suspended);
      const map = {};
      records.forEach(a => {
        const status = !lateEnabled && a.status === 'late' ? 'absent' : a.status;
        map[a.studentId] = suspended ? 'suspended' : status;
      });
      setAttendance(prev => ({ ...prev, ...map }));
    });

    return () => {
      active = false;
    };
  }, [selectedBatch, date, lateEnabled]);

  // ── Handlers (unchanged) ───────────────────────────────────────
  const toggleStatus = (sid) => {
    setAttendance(prev => {
      if (classSuspended) return prev;

      const curr = prev[sid] || 'present';
      let next;

      if (lateEnabled) {
        next = curr === 'present' ? 'late' : curr === 'late' ? 'absent' : 'present';
      } else {
        next = curr === 'present' ? 'absent' : 'present';
      }

      return { ...prev, [sid]: next };
    });
    setSaved(false);
  };

  const markAll = (status) => {
    const map = {};
    students.forEach(s => { map[s.id] = status; });
    setClassSuspended(false);
    setAttendance(map);
    setSaved(false);
  };

  const toggleClassSuspended = () => {
    setClassSuspended(prev => {
      const next = !prev;
      const map = {};
      students.forEach(s => { map[s.id] = next ? 'suspended' : 'present'; });
      setAttendance(map);
      setSaved(false);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const records = classSuspended
      ? students.map(s => ({ studentId: s.id, status: 'suspended' }))
      : Object.entries(attendance).map(([studentId, status]) => ({
          studentId,
          status: !lateEnabled && status === 'late' ? 'absent' : status,
        }));
    await API.post('/attendance/mark', { batchId: selectedBatch, date, classSuspended, records });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // ── Derived counts (unchanged) ─────────────────────────────────
  const attendanceValues = Object.values(attendance);
  const suspendedCount = classSuspended
    ? students.length
    : attendanceValues.filter(v => v === 'suspended').length;
  const presentCount = classSuspended ? 0 : attendanceValues.filter(v => v === 'present').length;
  const lateCount    = classSuspended || !lateEnabled ? 0 : attendanceValues.filter(v => v === 'late').length;
  const absentCount  = classSuspended
    ? 0
    : attendanceValues.filter(v => v === 'absent' || (!lateEnabled && v === 'late')).length;

  // Formatted date for the chip display
  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  const hasStudents = selectedBatch && students.length > 0;

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div data-testid="attendance-page" className="relative animate-fade-in">

      {/* ══════════════════════════════════════════════════════
          STICKY TOOLBAR — matches StudentsPage exactly
          -mx-4 lg:-mx-7 / px-4 lg:px-7 cancels + restores layout padding
          so the toolbar bleeds edge-to-edge in the content well.
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
        {/* Row 1 — title + date chip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1
              className="text-[1.2rem] font-bold tracking-tight leading-tight"
              style={{ color: 'rgba(255,255,255,0.95)' }}
            >
              Attendance
            </h1>
            <p className="text-[11.5px] mt-0.5" style={{ color: T.muted }}>
              Mark and manage daily batch attendance
            </p>
          </div>

          {/* Date chip + live indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold"
              style={{
                background: 'rgba(108,60,244,0.12)',
                border:     '1px solid rgba(108,60,244,0.24)',
                color:      '#c4b5fd',
              }}
            >
              <Calendar size={12} />
              {displayDate}
            </span>
            {hasStudents && (
              <span
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold"
                style={{
                  background: 'rgba(16,185,129,0.10)',
                  border:     '1px solid rgba(52,211,153,0.24)',
                  color:      '#34d399',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}
          </div>
        </div>

        {/* Row 2 — batch selector + date input */}
        <div className="flex flex-col sm:flex-row gap-2.5 mt-3">
          {/* Batch select */}
          <div className="relative flex-1">
            <GraduationCap
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: T.muted }}
            />
            <DarkSelect
              data-testid="attendance-batch-select"
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              style={{ paddingLeft: 34, paddingRight: 30 }}
            >
              <option value="" style={{ background: '#1a1625' }}>Select Batch</option>
              {batches.map(b => (
                <option key={b.id} value={b.id} style={{ background: '#1a1625' }}>
                  {b.batchName}
                </option>
              ))}
            </DarkSelect>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: T.muted }}
            />
          </div>

          {/* Date input */}
          <div className="relative">
            <Calendar
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: T.muted }}
            />
            <input
              data-testid="attendance-date-input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{
                ...INPUT_STYLE,
                colorScheme: 'dark',
                width:       'auto',
                paddingLeft: 32,
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'rgba(108,60,244,0.65)';
                e.currentTarget.style.boxShadow  = '0 0 0 3px rgba(108,60,244,0.14)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                e.currentTarget.style.boxShadow  = 'none';
              }}
            />
          </div>
        </div>
      </div>
      {/* ── end sticky toolbar ── */}

      <div className="mt-5">

        {/* ── Content when a batch is selected and has students ── */}
        {hasStudents && (
          <>
            {/* ── Stat cards ─────────────────────────────────── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
              <StatCard icon={Check}          label="Present" value={presentCount} color="#10b981" />
              {lateEnabled && <StatCard icon={Clock} label="Late" value={lateCount} color="#f59e0b" />}
              <StatCard icon={XIcon}          label="Absent"  value={absentCount}  color="#ef4444" />
              {classSuspended && <StatCard icon={PauseCircle} label="Suspended" value={suspendedCount} color="#cbd5e1" />}
              <StatCard icon={ClipboardCheck} label="Total"   value={students.length} color="#7c4ff5" />
            </div>

            {/* ── Quick actions + summary row ─────────────────── */}
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 mb-4"
              style={GLASS}
            >
              {/* Summary text */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: T.label }}>
                  Quick Actions
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[11px] font-semibold" style={{ color: '#34d399' }}>
                    {presentCount} present
                  </span>
                  {lateEnabled && (
                    <>
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.20)' }}>·</span>
                      <span className="text-[11px] font-semibold" style={{ color: '#fbbf24' }}>
                        {lateCount} late
                      </span>
                    </>
                  )}
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.20)' }}>·</span>
                  <span className="text-[11px] font-semibold" style={{ color: '#f87171' }}>
                    {absentCount} absent
                  </span>
                  {classSuspended && (
                    <>
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.20)' }}>·</span>
                      <span className="text-[11px] font-semibold" style={{ color: '#cbd5e1' }}>
                        {suspendedCount} suspended
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Mark-all chips */}
              <div className="flex flex-wrap gap-2">
                <MarkAllChip
                  onClick={() => markAll('present')}
                  
                  testId="mark-all-present"
                  icon={Check}
                  label="All Present"
                  color="#10b981"
                />
                {lateEnabled && (
                  <MarkAllChip
                    onClick={() => markAll('late')}
                    data-testid="mark-all-late"
                    testId="mark-all-late"
                    icon={Clock}
                    label="All Late"
                    color="#f59e0b"
                  />
                )}
                <MarkAllChip
                  onClick={() => markAll('absent')}
                  data-testid="mark-all-absent"
                  testId="mark-all-absent"
                  icon={XIcon}
                  label="All Absent"
                  color="#ef4444"
                />
                <MarkAllChip
                  onClick={toggleClassSuspended}
                  testId="mark-class-suspended"
                  icon={PauseCircle}
                  label="Class Suspended"
                  color="#fbbf24"
                  active={classSuspended}
                />
              </div>
            </div>

            {/* ── Attendance table ────────────────────────────── */}
            {classSuspended && (
              <div
                data-testid="class-suspended-banner"
                className="flex items-start gap-3 px-5 py-4 mb-4"
                style={{
                  ...GLASS,
                  background: 'linear-gradient(145deg, rgba(245,158,11,0.12), rgba(148,163,184,0.055))',
                  border:     '1px solid rgba(251,191,36,0.22)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: 'rgba(245,158,11,0.13)',
                    border:     '1px solid rgba(251,191,36,0.26)',
                    color:      '#fbbf24',
                  }}
                >
                  <PauseCircle size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: T.primary }}>
                    Class suspended for this date
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: T.secondary }}>
                    Students will not be counted as present, absent, or late.
                  </p>
                </div>
              </div>
            )}

            <div
              className="mb-4 overflow-hidden"
              style={GLASS}
            >
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="attendance-table">
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                        background:   'rgba(255,255,255,0.03)',
                      }}
                    >
                      <th
                        className="text-left px-5 py-3"
                        style={{
                          width:         48,
                          fontSize:      '9.5px',
                          fontWeight:    700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.14em',
                          color:         T.label,
                        }}
                      >
                        #
                      </th>
                      <th
                        className="text-left px-5 py-3"
                        style={{
                          fontSize:      '9.5px',
                          fontWeight:    700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.14em',
                          color:         T.label,
                        }}
                      >
                        Student
                      </th>
                      <th
                        className="text-center px-5 py-3"
                        style={{
                          width:         160,
                          fontSize:      '9.5px',
                          fontWeight:    700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.14em',
                          color:         T.label,
                        }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr
                        key={s.id}
                        data-testid={`attendance-row-${s.id}`}
                        style={{
                          borderBottom: i < students.length - 1
                            ? '1px solid rgba(255,255,255,0.05)'
                            : 'none',
                          transition: 'background 0.12s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,60,244,0.06)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {/* Row number */}
                        <td
                          className="px-5 py-3 text-[11.5px] tabular-nums"
                          style={{ color: T.label }}
                        >
                          {i + 1}
                        </td>

                        {/* Student name + avatar */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={s.name} size={30} />
                            <span
                              className="text-[13px] font-semibold"
                              style={{ color: T.primary }}
                            >
                              {s.name}
                            </span>
                          </div>
                        </td>

                        {/* Status toggle pill */}
                        <td className="px-5 py-3 text-center">
                          <StatusPill
                            status={
                              classSuspended
                                ? 'suspended'
                                : (!lateEnabled && attendance[s.id] === 'late' ? 'absent' : (attendance[s.id] || 'present'))
                            }
                            onClick={() => toggleStatus(s.id)}
                            testId={`toggle-attendance-${s.id}`}
                            disabled={classSuspended}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* ── end table ── */}

            {/* ══════════════════════════════════════════════════
                STICKY SAVE FAB
                sticky bottom-6 inside the page column —
                never overlaps the sidebar; right-aligned.
            ══════════════════════════════════════════════════ */}
            <div
              className="flex justify-end sticky bottom-6 mt-4 pointer-events-none"
              aria-hidden="true"
            >
              <button
                onClick={handleSave}
                disabled={saving}
                data-testid="save-attendance-button"
                className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[13px] font-bold text-white"
                style={
                  saved
                    ? {
                        background: 'linear-gradient(135deg,#10b981,#34d399)',
                        boxShadow:  '0 6px 28px rgba(16,185,129,0.52), 0 2px 8px rgba(0,0,0,0.40)',
                        transition: 'all 0.2s ease',
                      }
                    : {
                        background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6,#a855f7)',
                        boxShadow:  '0 6px 28px rgba(108,60,244,0.52), 0 2px 8px rgba(0,0,0,0.40)',
                        opacity:    saving ? 0.65 : 1,
                        transition: 'transform 0.18s ease, box-shadow 0.18s ease, opacity 0.15s ease',
                      }
                }
                onMouseEnter={e => {
                  if (!saving) {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                    e.currentTarget.style.boxShadow = saved
                      ? '0 10px 36px rgba(16,185,129,0.65), 0 2px 8px rgba(0,0,0,0.40)'
                      : '0 10px 36px rgba(108,60,244,0.65), 0 2px 8px rgba(0,0,0,0.40)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = saved
                    ? '0 6px 28px rgba(16,185,129,0.52), 0 2px 8px rgba(0,0,0,0.40)'
                    : '0 6px 28px rgba(108,60,244,0.52), 0 2px 8px rgba(0,0,0,0.40)';
                }}
                onMouseDown={e => { if (!saving) e.currentTarget.style.transform = 'scale(0.96)'; }}
                onMouseUp={e   => { if (!saving) e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; }}
              >
                {saving ? (
                  <>
                    <div
                      className="w-4 h-4 rounded-full animate-spin"
                      style={{ border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff' }}
                    />
                    Saving…
                  </>
                ) : saved ? (
                  <>
                    <Check size={15} strokeWidth={2.5} />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save size={14} strokeWidth={2.2} />
                    Save Attendance
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* ── Empty: batch selected but no students ─────────── */}
        {selectedBatch && !students.length && (
          <EmptyState text="No students found in this batch" />
        )}

        {/* ── Empty: no batch selected ──────────────────────── */}
        {!selectedBatch && (
          <EmptyState text="Select a batch to mark attendance" />
        )}

      </div>
    </div>
  );
}
