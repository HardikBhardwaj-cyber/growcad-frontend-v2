import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import API from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Upload, Pencil, Trash2, X, GraduationCap, Send, Eye, ChevronDown } from 'lucide-react';
import CSVUploadDialog from '@/components/CSVUploadDialog';

// ─── Shared input style ────────────────────────────────────────

const INPUT = {
  background:   'rgba(255,255,255,0.06)',
  border:       '1px solid rgba(255,255,255,0.10)',
  color:        'rgba(255,255,255,0.88)',
  borderRadius: '10px',
  outline:      'none',
  width:        '100%',
  padding:      '9px 12px',
  fontSize:     '13px',
  transition:   'border-color 0.15s ease, box-shadow 0.15s ease',
};

function DarkInput({ style = {}, ...props }) {
  return (
    <input
      {...props}
      style={{ ...INPUT, ...style }}
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

const emptyForm = {
  name: '', phoneNumber: '', parentPhoneNumber: '',
  email: '', batchId: '', admissionDate: '',
};

// ─── Avatar ────────────────────────────────────────────────────

function Avatar({ name, size = 32 }) {
  const letter = name?.charAt(0)?.toUpperCase() || '?';
  const colors = ['#6C3CF4', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#0ea5e9'];
  const idx    = (name?.charCodeAt(0) || 0) % colors.length;
  return (
    <div
      className="flex items-center justify-center shrink-0 rounded-full font-bold"
      style={{
        width:      size,
        height:     size,
        fontSize:   size * 0.38,
        background: `${colors[idx]}22`,
        border:     `1px solid ${colors[idx]}40`,
        color:      colors[idx],
      }}
    >
      {letter}
    </div>
  );
}

// ─── Batch badge ───────────────────────────────────────────────

function BatchBadge({ name }) {
  if (!name || name === '-') {
    return <span style={{ color: 'rgba(255,255,255,0.30)', fontSize: 12 }}>—</span>;
  }
  return (
    <span
      className="font-semibold"
      style={{
        fontSize:     11,
        padding:      '2px 9px',
        borderRadius: 99,
        background:   'rgba(108,60,244,0.14)',
        color:        '#c4b5fd',
        border:       '1px solid rgba(108,60,244,0.26)',
        whiteSpace:   'nowrap',
      }}
    >
      {name}
    </span>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default function StudentsPage() {
  const { user }  = useAuth();
  const isAdmin   = user?.role === 'admin';

  const [students,    setStudents]    = useState([]);
  const [batches,     setBatches]     = useState([]);
  const [search,      setSearch]      = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [showDialog,  setShowDialog]  = useState(false);
  const [showCSV,     setShowCSV]     = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState(emptyForm);
  const [loading,     setLoading]     = useState(true);
  const [reminding,   setReminding]   = useState({});

  // ── Data fetching (unchanged) ─────────────────────────────────────

  const fetchStudents = useCallback(() => {
    const params = {};
    if (search)      params.search  = search;
    if (batchFilter) params.batchId = batchFilter;
    API.get('/students', { params })
      .then(r => { setStudents(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search, batchFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { API.get('/batches').then(r => setBatches(r.data)); }, []);

  // ── Handlers (unchanged) ──────────────────────────────────────────

  /*
   * Single place to open the "Add Student" dialog.
   * Both the toolbar button and the FAB call this — keeping the
   * action consistent and the modal state shared.
   */
  const openAddDialog = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await API.put(`/students/${editing.id}`, form);
    } else {
      await API.post('/students', form);
    }
    setShowDialog(false);
    setEditing(null);
    setForm(emptyForm);
    fetchStudents();
  };

  const handleEdit = (s) => {
    setEditing(s);
    setForm({
      name:              s.name,
      phoneNumber:       s.phoneNumber       || '',
      parentPhoneNumber: s.parentPhoneNumber || '',
      email:             s.email             || '',
      batchId:           s.batchId           || '',
      admissionDate:     s.admissionDate     || '',
    });
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this student?')) {
      await API.delete(`/students/${id}`);
      fetchStudents();
    }
  };

  const sendQuickReminder = async (s) => {
    setReminding(p => ({ ...p, [s.id]: true }));
    try {
      const fees    = await API.get(`/students/${s.id}/profile`);
      const feeData = fees.data?.fees;
      if (feeData?.totalPending > 0 && feeData?.records?.[0]) {
        const pending = feeData.records[0].installments?.find(i => i.status !== 'paid');
        if (pending) {
          await API.post('/reminders/send-now', {
            studentId: s.id, amount: pending.amount,
            dueDate: pending.dueDate, type: 'manual',
          });
        }
      }
      setReminding(p => ({ ...p, [s.id]: 'done' }));
      setTimeout(() => setReminding(p => ({ ...p, [s.id]: false })), 2000);
    } catch {
      setReminding(p => ({ ...p, [s.id]: false }));
    }
  };

  const batchName = (id) => batches.find(b => b.id === id)?.batchName || '-';

  // ── Reusable button style objects ─────────────────────────────────

  const btnPrimary = {
    background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',
    boxShadow:  '0 3px 12px rgba(108,60,244,0.38)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  };

  // ── Loading state ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div data-testid="students-page" className="animate-fade-in relative">
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full animate-spin"
              style={{ border: '2px solid rgba(108,60,244,0.22)', borderTopColor: '#7c4ff5' }} />
            <p className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Loading…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────

  return (
    /*
     * position: relative scopes the FAB's sticky positioning to this
     * column.  The DashboardLayout scroll container is
     * `flex-1 overflow-y-auto` — sticky children inside it stick
     * relative to THAT container's scroll root, which is exactly
     * what we need: top-0 means "top of the scroll viewport", not
     * "top of the browser window".
     */
    <div data-testid="students-page" className="relative animate-fade-in">

      {/* ══════════════════════════════════════════════════════
          STICKY TOOLBAR
          ─────────────────────────────────────────────────────
          • sticky top-0 — sticks to top of the scroll container.
            The DashboardLayout header is a SIBLING of the scroll
            container, not an ancestor, so there is no overlap.
          • z-20 — floats above table rows (z-auto) but below
            the modal overlay (z-50) and the dashboard header
            (z-30).
          • -mx-4 lg:-mx-7 / px-4 lg:px-7 — mirrors and cancels
            the layout's own padding so the toolbar bleeds to
            full content-well width with a seamless edge.
          • backdrop-filter blur — the dark frosted-glass effect
            matches the main dashboard header aesthetic.
          • boxShadow — creates a subtle lift-line that visually
            separates the toolbar from rows scrolling beneath it.
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
        {/* Row 1 — title + action buttons ──────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">

          {/* Title block */}
          <div>
            <h1
              className="text-[1.2rem] font-bold tracking-tight leading-tight"
              style={{ color: 'rgba(255,255,255,0.95)' }}
            >
              Students
            </h1>
            <p className="text-[11.5px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {students.length} enrolled student{students.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Actions — right-aligned on sm+ */}
          {isAdmin && (
            <div className="flex items-center gap-2 shrink-0">
              {/* CSV upload */}
              <button
                onClick={() => setShowCSV(true)}
                data-testid="csv-upload-students"
                className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px] font-semibold"
                style={{
                  background:  'rgba(255,255,255,0.06)',
                  border:      '1px solid rgba(255,255,255,0.10)',
                  color:       'rgba(255,255,255,0.72)',
                  transition:  'background 0.15s, border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background  = 'rgba(255,255,255,0.10)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                  e.currentTarget.style.color       = 'rgba(255,255,255,0.92)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background  = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                  e.currentTarget.style.color       = 'rgba(255,255,255,0.72)';
                }}
              >
                <Upload size={13} /> CSV Upload
              </button>

              {/*
               * PRIMARY "Add Student" button.
               * The add-student-button testid lives HERE — canonical.
               * The FAB below does NOT carry this testid.
               */}
              <button
                data-testid="add-student-button"
                onClick={openAddDialog}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-bold text-white"
                style={btnPrimary}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 18px rgba(108,60,244,0.52)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none';             e.currentTarget.style.boxShadow = '0 3px 12px rgba(108,60,244,0.38)'; }}
              >
                <Plus size={14} /> Add Student
              </button>
            </div>
          )}
        </div>

        {/* Row 2 — search + batch filter ───────────────────── */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3">

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            />
            <input
              data-testid="student-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search students…"
              style={{ ...INPUT, paddingLeft: 34 }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(108,60,244,0.65)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,60,244,0.14)'; }}
              onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Batch filter */}
          <div className="relative">
            <select
              data-testid="student-batch-filter"
              value={batchFilter}
              onChange={e => setBatchFilter(e.target.value)}
              style={{ ...INPUT, width: 'auto', minWidth: 156, paddingRight: 30, appearance: 'none', cursor: 'pointer' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(108,60,244,0.65)'; }}
              onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
            >
              <option value="" style={{ background: '#1a1625' }}>All Batches</option>
              {batches.map(b => (
                <option key={b.id} value={b.id} style={{ background: '#1a1625' }}>{b.batchName}</option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            />
          </div>
        </div>
      </div>
      {/* ── end sticky toolbar ── */}


      {/* ── Students table ───────────────────────────────────────── */}
      <div className="mt-4">
        <div
          className="overflow-hidden"
          style={{
            background:     'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))',
            border:         '1px solid rgba(255,255,255,0.09)',
            borderRadius:   '16px',
            backdropFilter: 'blur(20px)',
            boxShadow:      '0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/*
           * overflow-x-auto only on the table wrapper — NOT on the
           * outer page div — so horizontal scrolling only affects the
           * table and the sticky toolbar always stays full-width.
           */}
          <div className="overflow-x-auto">
            <table className="w-full dark-table" data-testid="student-table">
              <thead>
                <tr>
                  <th className="text-left">Name</th>
                  <th className="text-left hidden md:table-cell">Phone</th>
                  <th className="text-left hidden lg:table-cell">Email</th>
                  <th className="text-left">Batch</th>
                  <th className="text-left" style={{ width: 110 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} data-testid={`student-row-${s.id}`}>

                    {/* Name */}
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={s.name} size={30} />
                        <Link
                          to={`/students/${s.id}`}
                          data-testid={`student-link-${s.id}`}
                          className="font-semibold"
                          style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13, transition: 'color 0.12s ease' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.88)'}
                        >
                          {s.name}
                        </Link>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="hidden md:table-cell" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
                      {s.phoneNumber || '—'}
                    </td>

                    {/* Email */}
                    <td className="hidden lg:table-cell" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
                      {s.email || '—'}
                    </td>

                    {/* Batch */}
                    <td>
                      <BatchBadge name={batchName(s.batchId)} />
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex items-center gap-0.5">

                        {/* View */}
                        <Link
                          to={`/students/${s.id}`}
                          data-testid={`view-student-${s.id}`}
                          className="p-1.5 rounded-lg"
                          style={{ color: 'rgba(255,255,255,0.38)', transition: 'background 0.12s, color 0.12s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.80)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent';            e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }}
                        >
                          <Eye size={13} />
                        </Link>

                        {isAdmin && (
                          <>
                            {/* Remind */}
                            <button
                              onClick={() => sendQuickReminder(s)}
                              data-testid={`remind-student-${s.id}`}
                              disabled={reminding[s.id] === true}
                              className="p-1.5 rounded-lg"
                              style={{
                                color:      reminding[s.id] === 'done' ? '#34d399' : 'rgba(245,158,11,0.80)',
                                transition: 'background 0.12s, color 0.12s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.10)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <Send size={13} className={reminding[s.id] === true ? 'animate-pulse' : ''} />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleEdit(s)}
                              data-testid={`edit-student-${s.id}`}
                              className="p-1.5 rounded-lg"
                              style={{ color: 'rgba(255,255,255,0.38)', transition: 'background 0.12s, color 0.12s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.80)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent';            e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }}
                            >
                              <Pencil size={13} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(s.id)}
                              data-testid={`delete-student-${s.id}`}
                              className="p-1.5 rounded-lg"
                              style={{ color: 'rgba(239,68,68,0.55)', transition: 'background 0.12s, color 0.12s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.10)'; e.currentTarget.style.color = '#f87171'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent';           e.currentTarget.style.color = 'rgba(239,68,68,0.55)'; }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty state */}
                {!students.length && (
                  <tr>
                    <td colSpan={5} style={{ padding: '52px 16px', textAlign: 'center', border: 'none' }}>
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: 'rgba(108,60,244,0.12)', border: '1px solid rgba(108,60,244,0.22)' }}
                        >
                          <GraduationCap size={22} style={{ color: '#a78bfa' }} />
                        </div>
                        <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.50)' }}>
                          No students found
                        </p>
                        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.32)' }}>
                          {search || batchFilter
                            ? 'Try adjusting your filters'
                            : 'Add your first student to get started'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* ── end table ── */}


      {/* ══════════════════════════════════════════════════════
          FLOATING ACTION BUTTON (FAB)
          ─────────────────────────────────────────────────────
          Design decisions:
          • position: sticky + bottom-6 keeps the FAB inside the
            page column.  It does NOT use position:fixed so it:
              – never overlaps the sidebar
              – never overlaps table row action icons
              – scrolls away naturally once past the page bottom
          • pointer-events:none on the outer flex wrapper, then
            pointer-events:auto on the button itself, so the
            transparent wrapper never accidentally swallows clicks
            on table cells beneath it.
          • hidden on mobile (< sm) — on small screens the table
            action buttons are already accessible and a FAB would
            block the last row's icons.
          • No data-testid — avoids duplicate-testid clash with
            the canonical add-student-button testid above.
          • aria-label provided for screen-reader access.
          • mt-5 gives 20px gap above FAB when table is short;
            when the table is long the FAB sticks to bottom-6.
      ══════════════════════════════════════════════════════ */}
      {isAdmin && (
        <div
          className="hidden sm:flex justify-end sticky bottom-6 mt-5 pointer-events-none"
          aria-hidden="true"
        >
          <button
            onClick={openAddDialog}
            aria-label="Add student"
            className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-bold text-white"
            style={{
              background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6,#a855f7)',
              boxShadow:  '0 4px 18px rgba(108,60,244,0.38), 0 2px 6px rgba(0,0,0,0.32)',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 7px 24px rgba(108,60,244,0.48), 0 2px 6px rgba(0,0,0,0.32)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(108,60,244,0.38), 0 2px 6px rgba(0,0,0,0.32)';
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
            onMouseUp={e   => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; }}
          >
            <Plus size={15} strokeWidth={2.4} />
            Add Student
          </button>
        </div>
      )}


      {/* ── Add / Edit dialog ──────────────────────────────────── */}
      {showDialog && createPortal((
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
          style={{
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          data-testid="student-form-dialog"
        >
          <div
            className="w-full max-w-md animate-fade-in overflow-y-auto"
            style={{
              background:     'linear-gradient(160deg, rgba(22,18,38,0.98), rgba(16,13,28,0.98))',
              border:         '1px solid rgba(255,255,255,0.12)',
              borderRadius:   '18px',
              padding:        '24px',
              boxShadow:      '0 24px 80px rgba(0,0,0,0.55)',
              backdropFilter: 'blur(28px)',
              maxHeight:      'calc(100vh - 48px)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>
                {editing ? 'Edit Student' : 'Add Student'}
              </h3>
              <button
                onClick={() => setShowDialog(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg"
                style={{ color: 'rgba(255,255,255,0.40)', transition: 'background 0.12s, color 0.12s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent';            e.currentTarget.style.color = 'rgba(255,255,255,0.40)'; }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">

              {/* Name */}
              <div>
                <label className="block mb-1.5"
                  style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                  Full Name *
                </label>
                <DarkInput
                  data-testid="student-form-name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Student full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1.5"
                  style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                  Email
                </label>
                <DarkInput
                  data-testid="student-form-email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="student@email.com"
                />
              </div>

              {/* Phone row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5"
                    style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                    Phone
                  </label>
                  <DarkInput
                    value={form.phoneNumber}
                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="block mb-1.5"
                    style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                    Parent Phone
                  </label>
                  <DarkInput
                    value={form.parentPhoneNumber}
                    onChange={e => setForm({ ...form, parentPhoneNumber: e.target.value })}
                    placeholder="9876543211"
                  />
                </div>
              </div>

              {/* Batch */}
              <div>
                <label className="block mb-1.5"
                  style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                  Batch
                </label>
                <div className="relative">
                  <select
                    data-testid="student-form-batch"
                    value={form.batchId}
                    onChange={e => setForm({ ...form, batchId: e.target.value })}
                    style={{ ...INPUT, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(108,60,244,0.65)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,60,244,0.14)'; }}
                    onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <option value="" style={{ background: '#1a1625' }}>Select batch</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id} style={{ background: '#1a1625' }}>{b.batchName}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgba(255,255,255,0.35)' }} />
                </div>
              </div>

              {/* Admission date */}
              <div>
                <label className="block mb-1.5"
                  style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                  Admission Date
                </label>
                <DarkInput
                  type="date"
                  value={form.admissionDate}
                  onChange={e => setForm({ ...form, admissionDate: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              {/* Submit */}
              <button
                data-testid="student-form-submit"
                type="submit"
                className="w-full py-2.5 rounded-[10px] text-[13px] font-bold text-white mt-1"
                style={btnPrimary}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 18px rgba(108,60,244,0.52)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none';             e.currentTarget.style.boxShadow = '0 3px 12px rgba(108,60,244,0.38)'; }}
              >
                {editing ? 'Update Student' : 'Add Student'}
              </button>
            </form>
          </div>
        </div>
      ), document.body)}

      <CSVUploadDialog
        open={showCSV}
        onClose={() => setShowCSV(false)}
        type="students"
        onSuccess={fetchStudents}
      />
    </div>
  );
}
