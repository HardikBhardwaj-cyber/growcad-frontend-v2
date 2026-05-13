import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '@/api';
import { Plus, X, FileText, Eye, Upload, Trash2, ChevronDown } from 'lucide-react';

// ─── Design tokens ─────────────────────────────────────────────

const GLASS = {
  background:           'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))',
  border:               '1px solid rgba(255,255,255,0.09)',
  borderRadius:         '18px',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow:            '0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)',
};

const MODAL = {
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

// ─── Reusable field wrapper ───────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      {label && <label style={LABEL}>{label}</label>}
      {children}
    </div>
  );
}

// ─── Dark input ───────────────────────────────────────────────

function DarkInput({ style = {}, ...props }) {
  return (
    <input {...props} style={{ ...INPUT, ...style }} onFocus={onFocus} onBlur={onBlur} />
  );
}

// ─── Dark select ──────────────────────────────────────────────

function DarkSelect({ children, style = {}, ...props }) {
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

// ─── Modal close button ───────────────────────────────────────

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

// ─── Avatar ───────────────────────────────────────────────────

function Avatar({ name, size = 28 }) {
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

// ─── Score badge ──────────────────────────────────────────────

function ScoreBadge({ pct }) {
  const [bg, color, border] =
    pct >= 80
      ? ['rgba(16,185,129,0.15)',  '#34d399',  'rgba(52,211,153,0.30)']
      : pct >= 50
      ? ['rgba(245,158,11,0.14)',  '#fbbf24',  'rgba(251,191,36,0.28)']
      : ['rgba(239,68,68,0.13)',   '#f87171',  'rgba(248,113,113,0.26)'];
  return (
    <span
      className="text-[10px] px-2.5 py-0.5 rounded-full font-bold"
      style={{ background: bg, color, border: `1px solid ${border}` }}
    >
      {pct}%
    </span>
  );
}

// ─── Modal overlay ────────────────────────────────────────────

function Overlay({ children }) {
  return createPortal((
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      style={{
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {children}
    </div>
  ), document.body);
}

// ─── Purple gradient button ───────────────────────────────────

function BtnPrimary({ children, style = {}, ...props }) {
  return (
    <button
      {...props}
      className="w-full py-2.5 rounded-[10px] text-[13px] font-bold text-white"
      style={{
        background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',
        boxShadow:  '0 3px 12px rgba(108,60,244,0.38)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 18px rgba(108,60,244,0.52)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(108,60,244,0.38)'; }}
    >
      {children}
    </button>
  );
}

// ─── Action icon button ────────────────────────────────────────

function ActionBtn({ onClick, testId, title, icon: Icon, iconColor, hoverBg }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      title={title}
      className="p-1.5 rounded-lg"
      style={{ color: `${iconColor}99`, transition: 'background 0.12s, color 0.12s' }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = iconColor; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = `${iconColor}99`; }}
    >
      <Icon size={13} />
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────

export default function TestsPage() {
  // ── State (unchanged) ─────────────────────────────────────────
  const [tests,       setTests]       = useState([]);
  const [batches,     setBatches]     = useState([]);
  const [students,    setStudents]    = useState([]);  // eslint-disable-line no-unused-vars
  const [showCreate,  setShowCreate]  = useState(false);
  const [showResults, setShowResults] = useState(null);
  const [showMarks,   setShowMarks]   = useState(null);
  const [results,     setResults]     = useState(null);
  const [marksForm,   setMarksForm]   = useState([]);
  const [form,        setForm]        = useState({ testName: '', subject: '', batchId: '', maximumMarks: 100, testDate: '' });
  const [batchFilter, setBatchFilter] = useState('');

  // ── Effects + handlers (unchanged) ────────────────────────────
  useEffect(() => {
    API.get('/batches').then(r => setBatches(r.data));
    fetchTests();
  }, []); // eslint-disable-line

  const fetchTests = (bid) => {
    const params = {};
    if (bid) params.batchId = bid;
    API.get('/tests', { params }).then(r => setTests(r.data));
  };

  useEffect(() => { fetchTests(batchFilter); }, [batchFilter]); // eslint-disable-line

  const handleCreate = async (e) => {
    e.preventDefault();
    await API.post('/tests', { ...form, maximumMarks: parseFloat(form.maximumMarks) });
    setShowCreate(false);
    setForm({ testName: '', subject: '', batchId: '', maximumMarks: 100, testDate: '' });
    fetchTests(batchFilter);
  };

  const viewResults = async (testId) => {
    const res = await API.get(`/tests/${testId}/results`);
    setResults(res.data);
    setShowResults(testId);
  };

  const openMarksUpload = async (test) => {
    const res = await API.get('/students', { params: { batchId: test.batchId } });
    setStudents(res.data);
    setMarksForm(res.data.map(s => ({ studentId: s.id, studentName: s.name, marksObtained: '' })));
    setShowMarks(test);
  };

  const handleUploadMarks = async (e) => {
    e.preventDefault();
    const marks = marksForm
      .filter(m => m.marksObtained !== '')
      .map(m => ({ studentId: m.studentId, marksObtained: parseFloat(m.marksObtained) }));
    await API.post(`/tests/${showMarks.id}/marks`, { marks });
    setShowMarks(null);
    fetchTests(batchFilter);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this test?')) {
      await API.delete(`/tests/${id}`);
      fetchTests(batchFilter);
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div data-testid="tests-page" className="relative animate-fade-in">

      {/* ══════════════════════════════════════════════════════
          STICKY TOOLBAR
      ══════════════════════════════════════════════════════ */}
      <div
        className="sticky top-0 z-20 -mx-4 lg:-mx-7 px-4 lg:px-7 pb-3 pt-4"
        style={{
          background:           'rgba(14,12,23,0.88)',
          backdropFilter:       'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom:         '1px solid rgba(255,255,255,0.08)',
          boxShadow:            '0 4px 20px rgba(0,0,0,0.28)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Title block */}
          <div>
            <h1 className="text-[1.2rem] font-bold tracking-tight leading-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
              Tests &amp; Exams
            </h1>
            <p className="text-[11.5px] mt-0.5" style={{ color: T.muted }}>
              {tests.length} test{tests.length !== 1 ? 's' : ''} created
            </p>
          </div>

          {/* Create Test button */}
          <button
            data-testid="create-test-button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-bold text-white shrink-0"
            style={{
              background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',
              boxShadow:  '0 3px 12px rgba(108,60,244,0.38)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 18px rgba(108,60,244,0.52)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(108,60,244,0.38)'; }}
          >
            <Plus size={14} strokeWidth={2.5} /> Create Test
          </button>
        </div>
      </div>
      {/* ── end sticky toolbar ── */}

      <div className="mt-5">
        {/* Batch filter */}
        <div className="mb-4" style={{ maxWidth: 220 }}>
          <DarkSelect
            data-testid="test-batch-filter"
            value={batchFilter}
            onChange={e => setBatchFilter(e.target.value)}
          >
            <option value="" style={{ background: '#1a1625' }}>All Batches</option>
            {batches.map(b => (
              <option key={b.id} value={b.id} style={{ background: '#1a1625' }}>{b.batchName}</option>
            ))}
          </DarkSelect>
        </div>

        {/* ── Tests table ─────────────────────────────────── */}
        <div style={{ ...GLASS, overflow: 'hidden' }}>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="tests-table">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
                  {[
                    { label: 'Test Name', cls: '' },
                    { label: 'Subject',   cls: ' hidden md:table-cell' },
                    { label: 'Batch',     cls: ' hidden md:table-cell' },
                    { label: 'Max Marks', cls: '' },
                    { label: 'Date',      cls: ' hidden lg:table-cell' },
                    { label: 'Actions',   cls: '' },
                  ].map(({ label, cls }) => (
                    <th
                      key={label}
                      className={`text-left px-5 py-3${cls}`}
                      style={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em', color: T.label, whiteSpace: 'nowrap' }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tests.map(t => (
                  <tr
                    key={t.id}
                    data-testid={`test-row-${t.id}`}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.12s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,60,244,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Test name */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: 'rgba(108,60,244,0.15)', border: '1px solid rgba(108,60,244,0.26)' }}
                        >
                          <FileText size={14} style={{ color: '#a78bfa' }} />
                        </div>
                        <span className="text-[12.5px] font-semibold" style={{ color: T.primary }}>
                          {t.testName}
                        </span>
                      </div>
                    </td>

                    {/* Subject badge */}
                    <td className="px-5 py-3 hidden md:table-cell">
                      {t.subject ? (
                        <span
                          className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
                          style={{ background: 'rgba(59,130,246,0.14)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.22)' }}
                        >
                          {t.subject}
                        </span>
                      ) : (
                        <span style={{ color: T.label, fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* Batch badge */}
                    <td className="px-5 py-3 hidden md:table-cell">
                      {t.batchName ? (
                        <span
                          className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
                          style={{ background: 'rgba(108,60,244,0.13)', color: '#c4b5fd', border: '1px solid rgba(108,60,244,0.24)' }}
                        >
                          {t.batchName}
                        </span>
                      ) : (
                        <span style={{ color: T.label, fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* Max marks */}
                    <td className="px-5 py-3 text-[12px] font-semibold" style={{ color: T.secondary }}>
                      {t.maximumMarks}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3 text-[12px] hidden lg:table-cell" style={{ color: T.muted }}>
                      {t.testDate || '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-0.5">
                        <ActionBtn
                          onClick={() => viewResults(t.id)}
                          testId={`view-results-${t.id}`}
                          title="View Results"
                          icon={Eye}
                          iconColor="#60a5fa"
                          hoverBg="rgba(59,130,246,0.10)"
                        />
                        <ActionBtn
                          onClick={() => openMarksUpload(t)}
                          testId={`upload-marks-${t.id}`}
                          title="Upload Marks"
                          icon={Upload}
                          iconColor="#34d399"
                          hoverBg="rgba(16,185,129,0.10)"
                        />
                        <ActionBtn
                          onClick={() => handleDelete(t.id)}
                          testId={`delete-test-${t.id}`}
                          title="Delete Test"
                          icon={Trash2}
                          iconColor="#f87171"
                          hoverBg="rgba(239,68,68,0.10)"
                        />
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty state */}
                {!tests.length && (
                  <tr>
                    <td colSpan={6} style={{ padding: '52px 20px', textAlign: 'center', border: 'none' }}>
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: 'rgba(108,60,244,0.12)', border: '1px solid rgba(108,60,244,0.22)' }}
                        >
                          <FileText size={22} style={{ color: '#a78bfa' }} />
                        </div>
                        <p className="text-[13px] font-medium" style={{ color: T.secondary }}>No tests created yet</p>
                        <p className="text-[11px]" style={{ color: T.muted }}>Create your first test to start tracking results</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          DIALOG: CREATE TEST
      ══════════════════════════════════════════════════════ */}
      {showCreate && (
        <Overlay>
          <div
            className="relative z-[10000] w-full max-w-md animate-scale-in"
            style={{ ...MODAL, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
            data-testid="create-test-dialog"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                  style={{ background: 'rgba(108,60,244,0.18)', border: '1px solid rgba(108,60,244,0.30)' }}
                >
                  <FileText size={14} style={{ color: '#a78bfa' }} />
                </div>
                <h3 className="text-[14.5px] font-bold" style={{ color: T.primary }}>Create Test</h3>
              </div>
              <CloseBtn onClick={() => setShowCreate(false)} />
            </div>

            {/* Form body */}
            <form
              onSubmit={handleCreate}
              className="p-5 space-y-4 overflow-y-auto"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(108,60,244,0.25) transparent' }}
            >
              <Field label="Test Name">
                <DarkInput
                  value={form.testName}
                  onChange={e => setForm({ ...form, testName: e.target.value })}
                  placeholder="e.g. Physics Unit Test 1"
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Subject">
                  <DarkInput
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Physics"
                  />
                </Field>
                <Field label="Max Marks">
                  <DarkInput
                    type="number"
                    value={form.maximumMarks}
                    onChange={e => setForm({ ...form, maximumMarks: e.target.value })}
                    placeholder="100"
                  />
                </Field>
              </div>

              <Field label="Batch">
                <DarkSelect
                  value={form.batchId}
                  onChange={e => setForm({ ...form, batchId: e.target.value })}
                  required
                >
                  <option value="" style={{ background: '#1a1625' }}>Select Batch *</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id} style={{ background: '#1a1625' }}>{b.batchName}</option>
                  ))}
                </DarkSelect>
              </Field>

              <Field label="Test Date">
                <DarkInput
                  type="date"
                  value={form.testDate}
                  onChange={e => setForm({ ...form, testDate: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                />
              </Field>

              <BtnPrimary type="submit" data-testid="create-test-submit">
                Create Test
              </BtnPrimary>
            </form>
          </div>
        </Overlay>
      )}

      {/* ══════════════════════════════════════════════════════
          DIALOG: TEST RESULTS
      ══════════════════════════════════════════════════════ */}
      {showResults && results && (
        <Overlay>
          <div
            className="relative z-[10000] w-full max-w-lg animate-scale-in"
            style={{ ...MODAL, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
            data-testid="test-results-dialog"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="min-w-0">
                <h3 className="text-[14.5px] font-bold truncate" style={{ color: T.primary }}>
                  {results.test?.testName}
                </h3>
                <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>
                  Max: {results.test?.maximumMarks} marks
                </p>
              </div>
              <CloseBtn onClick={() => { setShowResults(null); setResults(null); }} />
            </div>

            {/* Results table */}
            <div className="overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(108,60,244,0.25) transparent' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', position: 'sticky', top: 0 }}>
                    {['Rank', 'Student', 'Marks', '%'].map(h => (
                      <th
                        key={h}
                        className="text-left px-5 py-3"
                        style={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em', color: T.label }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.results?.map((r, i) => (
                    <tr
                      key={r.studentId}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.12s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,60,244,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Rank */}
                      <td className="px-5 py-3 text-[11.5px] tabular-nums font-bold" style={{ color: i === 0 ? '#fbbf24' : i === 1 ? 'rgba(255,255,255,0.55)' : T.label }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </td>

                      {/* Student */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={r.studentName} size={26} />
                          <span className="text-[12.5px] font-semibold" style={{ color: T.primary }}>{r.studentName}</span>
                        </div>
                      </td>

                      {/* Marks */}
                      <td className="px-5 py-3 text-[12px] font-medium" style={{ color: T.secondary }}>
                        {r.marksObtained}
                      </td>

                      {/* % */}
                      <td className="px-5 py-3">
                        <ScoreBadge pct={r.percentage} />
                      </td>
                    </tr>
                  ))}

                  {!results.results?.length && (
                    <tr>
                      <td colSpan={4} style={{ padding: '40px 20px', textAlign: 'center', border: 'none' }}>
                        <div className="flex flex-col items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(108,60,244,0.12)', border: '1px solid rgba(108,60,244,0.22)' }}
                          >
                            <FileText size={18} style={{ color: '#a78bfa' }} />
                          </div>
                          <p className="text-[12px]" style={{ color: T.muted }}>No results uploaded yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Overlay>
      )}

      {/* ══════════════════════════════════════════════════════
          DIALOG: UPLOAD MARKS
      ══════════════════════════════════════════════════════ */}
      {showMarks && (
        <Overlay>
          <div
            className="relative z-[10000] w-full max-w-lg animate-scale-in"
            style={{ ...MODAL, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
            data-testid="upload-marks-dialog"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="min-w-0">
                <h3 className="text-[14.5px] font-bold" style={{ color: T.primary }}>Upload Marks</h3>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: T.muted }}>
                  {showMarks.testName}
                  <span
                    className="ml-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                    style={{ background: 'rgba(108,60,244,0.15)', color: '#c4b5fd' }}
                  >
                    Max: {showMarks.maximumMarks}
                  </span>
                </p>
              </div>
              <CloseBtn onClick={() => setShowMarks(null)} />
            </div>

            {/* Marks form */}
            <form
              onSubmit={handleUploadMarks}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Scrollable student list */}
              <div
                className="flex-1 overflow-y-auto px-5 py-4 space-y-2"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(108,60,244,0.25) transparent' }}
              >
                {marksForm.map((m, i) => (
                  <div
                    key={m.studentId}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{
                      background:  'rgba(255,255,255,0.04)',
                      border:      '1px solid rgba(255,255,255,0.07)',
                      transition:  'background 0.12s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,60,244,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  >
                    <Avatar name={m.studentName} size={28} />
                    <span
                      className="flex-1 text-[12.5px] font-semibold truncate"
                      style={{ color: T.primary }}
                    >
                      {m.studentName}
                    </span>
                    <input
                      type="number"
                      value={m.marksObtained}
                      onChange={e => {
                        const updated = [...marksForm];
                        updated[i].marksObtained = e.target.value;
                        setMarksForm(updated);
                      }}
                      placeholder="—"
                      max={showMarks.maximumMarks}
                      min="0"
                      data-testid={`marks-input-${m.studentId}`}
                      style={{
                        ...INPUT,
                        width:       72,
                        padding:     '6px 8px',
                        textAlign:   'center',
                        fontSize:    '12px',
                        borderRadius: '8px',
                      }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 pb-5 pt-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <BtnPrimary type="submit" data-testid="upload-marks-submit">
                  Save Marks
                </BtnPrimary>
              </div>
            </form>
          </div>
        </Overlay>
      )}
    </div>
  );
}
