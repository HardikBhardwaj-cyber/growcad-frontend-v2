import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '@/api';
import { Plus, X, CreditCard, Check, ChevronDown } from 'lucide-react';

// ─── Constants (unchanged) ─────────────────────────────────────

const PLANS = [
  { value: 'one_time',    label: 'One Time'    },
  { value: 'monthly',     label: 'Monthly'     },
  { value: 'quarterly',   label: 'Quarterly'   },
  { value: 'half_yearly', label: 'Half-Yearly' },
  { value: 'annually',    label: 'Annually'    },
  { value: 'custom',      label: 'Custom'      },
];

// ─── Design tokens ─────────────────────────────────────────────

const GLASS = {
  background:           'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))',
  border:               '1px solid rgba(255,255,255,0.09)',
  borderRadius:         '18px',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow:            '0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)',
};

const MODAL_BG = {
  background:           'linear-gradient(160deg, rgba(22,18,38,0.98), rgba(14,11,26,0.98))',
  border:               '1px solid rgba(255,255,255,0.12)',
  borderRadius:         '20px',
  backdropFilter:       'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  boxShadow:            '0 24px 80px rgba(0,0,0,0.55)',
};

const INPUT = {
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

const LABEL = {
  display:       'block',
  fontSize:      10,
  fontWeight:    700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color:         'rgba(255,255,255,0.38)',
  marginBottom:  5,
};

const T = {
  primary:   'rgba(255,255,255,0.92)',
  secondary: 'rgba(255,255,255,0.65)',
  muted:     'rgba(255,255,255,0.45)',
  label:     'rgba(255,255,255,0.38)',
};

// ─── Focus / blur helpers ──────────────────────────────────────

const onFocus = e => {
  e.currentTarget.style.borderColor = 'rgba(108,60,244,0.65)';
  e.currentTarget.style.boxShadow  = '0 0 0 3px rgba(108,60,244,0.14)';
};
const onBlur = e => {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
  e.currentTarget.style.boxShadow  = 'none';
};

// ─── Dark field wrapper ────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      {label && <label style={LABEL}>{label}</label>}
      {children}
    </div>
  );
}

// ─── Dark input ────────────────────────────────────────────────

function DarkInput({ style = {}, ...props }) {
  return (
    <input
      {...props}
      style={{ ...INPUT, ...style }}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

// ─── Dark select ───────────────────────────────────────────────

function DarkSelect({ style = {}, children, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        style={{ ...INPUT, appearance: 'none', cursor: 'pointer', paddingRight: 30, ...style }}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {children}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: T.muted }}
      />
    </div>
  );
}

// ─── Modal close button ────────────────────────────────────────

function CloseBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0"
      style={{ color: 'rgba(255,255,255,0.40)', transition: 'background 0.12s, color 0.12s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.40)'; }}
    >
      <X size={16} />
    </button>
  );
}

// ─── Avatar ────────────────────────────────────────────────────

function Avatar({ name, size = 30 }) {
  const letter  = name?.charAt(0)?.toUpperCase() || '?';
  const palette = ['#6C3CF4', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#0ea5e9'];
  const color   = palette[(name?.charCodeAt(0) || 0) % palette.length];
  return (
    <div
      className="flex items-center justify-center shrink-0 rounded-full font-bold"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `${color}22`, border: `1px solid ${color}40`, color }}
    >
      {letter}
    </div>
  );
}

// ─── Status badge (dark glass) ────────────────────────────────

function StatusBadge({ status }) {
  const cfg = {
    paid:    { bg: 'rgba(16,185,129,0.15)',  color: '#34d399', border: 'rgba(52,211,153,0.30)'  },
    partial: { bg: 'rgba(245,158,11,0.14)',  color: '#fbbf24', border: 'rgba(251,191,36,0.30)'  },
    pending: { bg: 'rgba(239,68,68,0.13)',   color: '#f87171', border: 'rgba(248,113,113,0.28)' },
  };
  const s = cfg[status] ?? cfg.pending;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold capitalize"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {status === 'paid' && <Check size={9} strokeWidth={3} />}
      {status}
    </span>
  );
}

// ─── Main component ────────────────────────────────────────────

export default function FeesPage() {
  // ── State (unchanged) ─────────────────────────────────────────
  const [tab,                  setTab]                = useState('structures');
  const [structures,           setStructures]         = useState([]);
  const [studentFees,          setStudentFees]        = useState([]);
  const [batches,              setBatches]            = useState([]);
  const [showStructureDialog,  setShowStructureDialog]= useState(false);
  const [showPayDialog,        setShowPayDialog]      = useState(false);
  const [payData,              setPayData]            = useState({ studentFeeId: '', installmentIndex: 0, amount: 0 });
  const [payingStudent,        setPayingStudent]      = useState(null);
  const [structureForm,        setStructureForm]      = useState({ batchId: '', totalCourseFee: '', paymentPlan: 'monthly', firstDueDate: '', numberOfInstallments: 1, lateFeePerDay: 0 });
  const [batchFilter,          setBatchFilter]        = useState('');

  // ── Effects + handlers (unchanged) ────────────────────────────
  useEffect(() => {
    API.get('/batches').then(r => setBatches(r.data));
    fetchStructures();
    fetchStudentFees();
  }, []); // eslint-disable-line

  const fetchStructures   = () => API.get('/fee-structures').then(r => setStructures(r.data));
  const fetchStudentFees  = (bid) => {
    const params = {};
    if (bid) params.batchId = bid;
    API.get('/student-fees', { params }).then(r => setStudentFees(r.data));
  };

  useEffect(() => { fetchStudentFees(batchFilter); }, [batchFilter]); // eslint-disable-line

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    await API.post('/fee-structures', {
      ...structureForm,
      totalCourseFee:       parseFloat(structureForm.totalCourseFee),
      numberOfInstallments: parseInt(structureForm.numberOfInstallments),
      lateFeePerDay:        parseFloat(structureForm.lateFeePerDay) || 0,
    });
    setShowStructureDialog(false);
    setStructureForm({ batchId: '', totalCourseFee: '', paymentPlan: 'monthly', firstDueDate: '', numberOfInstallments: 1, lateFeePerDay: 0 });
    fetchStructures();
  };

  const openPayDialog = (sf, instIdx) => {
    const inst = sf.installments[instIdx];
    setPayingStudent(sf);
    setPayData({ studentFeeId: sf.id, installmentIndex: instIdx, amount: inst.amount - (inst.paidAmount || 0) });
    setShowPayDialog(true);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    await API.post('/fees/pay', { ...payData, amount: parseFloat(payData.amount) });
    setShowPayDialog(false);
    fetchStudentFees(batchFilter);
  };

  // ── Shared button styles ──────────────────────────────────────
  const btnPrimary = {
    background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',
    boxShadow:  '0 3px 12px rgba(108,60,244,0.38)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div data-testid="fees-page" className="relative animate-fade-in">

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
        <div>
          <h1 className="text-[1.2rem] font-bold tracking-tight leading-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
            Fee Management
          </h1>
          <p className="text-[11.5px] mt-0.5" style={{ color: T.muted }}>
            Manage fee structures and collect payments
          </p>
        </div>

        {/* Row 2 — dark segmented tabs */}
        <div
          className="flex gap-1 mt-3 w-fit p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {[
            { id: 'structures',   label: 'Fee Structures', testId: 'fee-tab-structures'   },
            { id: 'student-fees', label: 'Student Fees',   testId: 'fee-tab-student-fees' },
          ].map(t => (
            <button
              key={t.id}
              data-testid={t.testId}
              onClick={() => setTab(t.id)}
              className="px-4 py-1.5 rounded-[9px] text-[12px] font-bold"
              style={
                tab === t.id
                  ? {
                      background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',
                      color:      '#fff',
                      boxShadow:  '0 2px 10px rgba(108,60,244,0.40)',
                      transition: 'none',
                    }
                  : {
                      color:      'rgba(255,255,255,0.50)',
                      transition: 'color 0.12s ease',
                    }
              }
              onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.color = 'rgba(255,255,255,0.82)'; }}
              onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.color = 'rgba(255,255,255,0.50)'; }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {/* ── end sticky toolbar ── */}

      <div className="mt-5">

        {/* ════════════════════════════════════════════════════
            TAB: FEE STRUCTURES
        ════════════════════════════════════════════════════ */}
        {tab === 'structures' && (
          <div>
            {/* Add button */}
            <div className="flex justify-end mb-4">
              <button
                data-testid="add-fee-structure-button"
                onClick={() => setShowStructureDialog(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-bold text-white"
                style={btnPrimary}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 18px rgba(108,60,244,0.52)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(108,60,244,0.38)'; }}
              >
                <Plus size={14} strokeWidth={2.5} /> Add Fee Structure
              </button>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {structures.map(fs => (
                <div
                  key={fs.id}
                  data-testid={`fee-structure-${fs.id}`}
                  style={{
                    ...GLASS,
                    padding:    '18px 20px',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)'; }}
                >
                  {/* Card header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(52,211,153,0.26)' }}
                    >
                      <CreditCard size={17} style={{ color: '#34d399' }} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13.5px] font-bold truncate" style={{ color: T.primary }}>
                        {fs.batchName || 'Batch'}
                      </h3>
                      <p className="text-[10px] mt-0.5 capitalize" style={{ color: T.muted }}>
                        {fs.paymentPlan?.replace('_', ' ')} Plan
                      </p>
                    </div>
                  </div>

                  {/* Detail rows */}
                  <div className="space-y-2">
                    {[
                      { label: 'Total Fee',     value: `Rs.${fs.totalCourseFee?.toLocaleString()}`, highlight: true },
                      { label: 'Installments',  value: fs.numberOfInstallments },
                      { label: 'First Due',     value: fs.firstDueDate },
                      { label: 'Late Fee',      value: `Rs.${fs.lateFeePerDay}/day` },
                    ].map(({ label, value, highlight }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}
                      >
                        <span className="text-[11px]" style={{ color: T.label }}>{label}</span>
                        <span
                          className="text-[12px] font-semibold"
                          style={{ color: highlight ? '#c4b5fd' : T.secondary }}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {!structures.length && (
                <div
                  className="col-span-full flex flex-col items-center justify-center py-16 gap-4"
                  style={GLASS}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(52,211,153,0.22)' }}
                  >
                    <CreditCard size={24} style={{ color: '#34d399' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-semibold" style={{ color: T.secondary }}>No fee structures yet</p>
                    <p className="text-[11px] mt-1" style={{ color: T.muted }}>Create one to start managing fees</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            TAB: STUDENT FEES
        ════════════════════════════════════════════════════ */}
        {tab === 'student-fees' && (
          <div>
            {/* Batch filter */}
            <div className="mb-4" style={{ maxWidth: 220 }}>
              <DarkSelect
                data-testid="fee-batch-filter"
                value={batchFilter}
                onChange={e => setBatchFilter(e.target.value)}
              >
                <option value="" style={{ background: '#1a1625' }}>All Batches</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id} style={{ background: '#1a1625' }}>{b.batchName}</option>
                ))}
              </DarkSelect>
            </div>

            {/* Table */}
            <div style={{ ...GLASS, overflow: 'hidden' }}>
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="student-fees-table">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
                      {['Student', 'Batch', 'Total', 'Paid', 'Pending', 'Actions'].map((h, idx) => (
                        <th
                          key={h}
                          className={`text-left px-5 py-3${idx === 1 ? ' hidden md:table-cell' : ''}`}
                          style={{
                            fontSize: '9.5px', fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.13em',
                            color: T.label, whiteSpace: 'nowrap',
                            width: h === 'Actions' ? 140 : undefined,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {studentFees.map(sf => {
                      const nextPending = sf.installments?.findIndex(i => i.status !== 'paid');
                      return (
                        <tr
                          key={sf.id}
                          data-testid={`student-fee-row-${sf.id}`}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.12s ease' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,60,244,0.06)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          {/* Student */}
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={sf.studentName} size={28} />
                              <span className="text-[12.5px] font-semibold" style={{ color: T.primary }}>
                                {sf.studentName}
                              </span>
                            </div>
                          </td>

                          {/* Batch */}
                          <td className="px-5 py-3 hidden md:table-cell">
                            <span
                              className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
                              style={{ background: 'rgba(108,60,244,0.13)', color: '#c4b5fd', border: '1px solid rgba(108,60,244,0.24)' }}
                            >
                              {sf.batchName}
                            </span>
                          </td>

                          {/* Total */}
                          <td className="px-5 py-3 text-[12px] font-medium" style={{ color: T.secondary }}>
                            Rs.{sf.totalFee?.toLocaleString()}
                          </td>

                          {/* Paid */}
                          <td className="px-5 py-3 text-[12px] font-semibold" style={{ color: '#34d399' }}>
                            Rs.{sf.totalPaid?.toLocaleString()}
                          </td>

                          {/* Pending */}
                          <td className="px-5 py-3 text-[12px] font-semibold" style={{ color: sf.totalPending > 0 ? '#f87171' : T.muted }}>
                            Rs.{sf.totalPending?.toLocaleString()}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3">
                            {nextPending >= 0 && nextPending < sf.installments.length ? (
                              <button
                                data-testid={`pay-fee-${sf.id}`}
                                onClick={() => openPayDialog(sf, nextPending)}
                                className="text-[11px] px-3 py-1.5 rounded-[9px] font-bold text-white whitespace-nowrap"
                                style={{
                                  background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',
                                  boxShadow:  '0 2px 8px rgba(108,60,244,0.36)',
                                  transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(108,60,244,0.52)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(108,60,244,0.36)'; }}
                              >
                                Record Payment
                              </button>
                            ) : (
                              <StatusBadge status="paid" />
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Empty */}
                    {!studentFees.length && (
                      <tr>
                        <td colSpan={6} style={{ padding: '52px 20px', textAlign: 'center', border: 'none' }}>
                          <div className="flex flex-col items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center"
                              style={{ background: 'rgba(108,60,244,0.12)', border: '1px solid rgba(108,60,244,0.22)' }}
                            >
                              <CreditCard size={20} style={{ color: '#a78bfa' }} />
                            </div>
                            <p className="text-[13px] font-medium" style={{ color: T.secondary }}>No student fees found</p>
                            <p className="text-[11px]" style={{ color: T.muted }}>Assign fee structures to students to see them here</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          DIALOG: CREATE FEE STRUCTURE
      ══════════════════════════════════════════════════════ */}
      {showStructureDialog && createPortal((
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
          style={{
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div
            className="relative z-[10000] w-full max-w-md animate-scale-in"
            style={{ ...MODAL_BG, maxHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column' }}
            data-testid="fee-structure-form-dialog"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(52,211,153,0.26)' }}
                >
                  <CreditCard size={14} style={{ color: '#34d399' }} />
                </div>
                <h3 className="text-[14.5px] font-bold" style={{ color: T.primary }}>
                  Create Fee Structure
                </h3>
              </div>
              <CloseBtn onClick={() => setShowStructureDialog(false)} />
            </div>

            {/* Body */}
            <form
              onSubmit={handleCreateStructure}
              className="p-5 space-y-4 overflow-y-auto"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(108,60,244,0.25) transparent' }}
            >
              {/* Batch */}
              <Field label="Batch">
                <DarkSelect
                  data-testid="fee-structure-batch"
                  value={structureForm.batchId}
                  onChange={e => setStructureForm({ ...structureForm, batchId: e.target.value })}
                  required
                >
                  <option value="" style={{ background: '#1a1625' }}>Select Batch *</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id} style={{ background: '#1a1625' }}>{b.batchName}</option>
                  ))}
                </DarkSelect>
              </Field>

              {/* Total course fee */}
              <Field label="Total Course Fee">
                <DarkInput
                  data-testid="fee-structure-amount"
                  type="number"
                  value={structureForm.totalCourseFee}
                  onChange={e => setStructureForm({ ...structureForm, totalCourseFee: e.target.value })}
                  placeholder="e.g. 150000"
                  required
                />
              </Field>

              {/* Payment plan */}
              <Field label="Payment Plan">
                <DarkSelect
                  value={structureForm.paymentPlan}
                  onChange={e => setStructureForm({ ...structureForm, paymentPlan: e.target.value })}
                >
                  {PLANS.map(p => (
                    <option key={p.value} value={p.value} style={{ background: '#1a1625' }}>{p.label}</option>
                  ))}
                </DarkSelect>
              </Field>

              {/* First due date + installments */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Due Date">
                  <DarkInput
                    type="date"
                    value={structureForm.firstDueDate}
                    onChange={e => setStructureForm({ ...structureForm, firstDueDate: e.target.value })}
                    required
                    style={{ colorScheme: 'dark' }}
                  />
                </Field>
                <Field label="Installments">
                  <DarkInput
                    type="number"
                    value={structureForm.numberOfInstallments}
                    onChange={e => setStructureForm({ ...structureForm, numberOfInstallments: e.target.value })}
                    placeholder="e.g. 12"
                    min="1"
                  />
                </Field>
              </div>

              {/* Late fee */}
              <Field label="Late Fee Per Day (Rs.)">
                <DarkInput
                  type="number"
                  value={structureForm.lateFeePerDay}
                  onChange={e => setStructureForm({ ...structureForm, lateFeePerDay: e.target.value })}
                  placeholder="e.g. 50"
                />
              </Field>

              {/* Submit */}
              <button
                type="submit"
                data-testid="fee-structure-submit"
                className="w-full py-2.5 rounded-[10px] text-[13px] font-bold text-white mt-1"
                style={btnPrimary}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 18px rgba(108,60,244,0.52)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(108,60,244,0.38)'; }}
              >
                Create Structure
              </button>
            </form>
          </div>
        </div>
      ), document.body)}

      {/* ══════════════════════════════════════════════════════
          DIALOG: RECORD PAYMENT
      ══════════════════════════════════════════════════════ */}
      {showPayDialog && payingStudent && createPortal((
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
          style={{
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div
            className="relative z-[10000] w-full max-w-sm animate-scale-in"
            style={MODAL_BG}
            data-testid="pay-fee-dialog"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(52,211,153,0.26)' }}
                >
                  <CreditCard size={14} style={{ color: '#34d399' }} />
                </div>
                <h3 className="text-[14.5px] font-bold" style={{ color: T.primary }}>Record Payment</h3>
              </div>
              <CloseBtn onClick={() => setShowPayDialog(false)} />
            </div>

            <div className="p-5 space-y-4">
              {/* Payment summary */}
              <div
                className="p-4 rounded-2xl space-y-2.5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {[
                  { label: 'Student',     value: payingStudent.studentName },
                  { label: 'Installment', value: `#${payData.installmentIndex + 1}` },
                  { label: 'Due Amount',  value: `Rs.${payingStudent.installments[payData.installmentIndex]?.amount?.toLocaleString()}`, highlight: true },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[11px]" style={{ color: T.label }}>{label}</span>
                    <span className="text-[12.5px] font-semibold" style={{ color: highlight ? '#34d399' : T.secondary }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Amount input */}
              <form onSubmit={handlePay} className="space-y-3">
                <Field label="Payment Amount">
                  <DarkInput
                    data-testid="pay-amount-input"
                    type="number"
                    value={payData.amount}
                    onChange={e => setPayData({ ...payData, amount: e.target.value })}
                    placeholder="Enter amount"
                    required
                  />
                </Field>

                {/* Confirm button — green gradient */}
                <button
                  type="submit"
                  data-testid="pay-submit"
                  className="w-full py-2.5 rounded-[10px] text-[13px] font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg,#10b981,#34d399)',
                    boxShadow:  '0 3px 14px rgba(16,185,129,0.42)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 20px rgba(16,185,129,0.55)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 3px 14px rgba(16,185,129,0.42)'; }}
                >
                  Confirm Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      ), document.body)}
    </div>
  );
}
