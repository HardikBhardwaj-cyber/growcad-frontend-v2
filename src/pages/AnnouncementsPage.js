import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { Megaphone, Plus, Trash2, X, ChevronDown, Users } from 'lucide-react';

// ─── Design tokens ─────────────────────────────────────────────

const GLASS = {
  background:           'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))',
  border:               '1px solid rgba(255,255,255,0.09)',
  borderRadius:         '18px',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow:            '0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)',
};

// Slightly denser glass for modal
const MODAL_GLASS = {
  background:           'linear-gradient(160deg, rgba(22,18,38,0.98), rgba(14,11,26,0.98))',
  border:               '1px solid rgba(255,255,255,0.12)',
  borderRadius:         '20px',
  backdropFilter:       'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  boxShadow:            '0 24px 80px rgba(0,0,0,0.55)',
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

const LABEL_STYLE = {
  display:       'block',
  fontSize:      10,
  fontWeight:    700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color:         'rgba(255,255,255,0.38)',
  marginBottom:  6,
};

// ─── Focus helpers (reused across input / textarea / select) ───

const onFocus = e => {
  e.currentTarget.style.borderColor = 'rgba(108,60,244,0.65)';
  e.currentTarget.style.boxShadow  = '0 0 0 3px rgba(108,60,244,0.14)';
};
const onBlur = e => {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
  e.currentTarget.style.boxShadow  = 'none';
};

// ─── Main component ────────────────────────────────────────────

export default function AnnouncementsPage() {
  // ── State (unchanged) ─────────────────────────────────────────
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin';
  const [announcements, setAnnouncements] = useState([]);
  const [batches,       setBatches]       = useState([]);
  const [showForm,      setShowForm]      = useState(false);
  const [form,          setForm]          = useState({ title: '', message: '', targetBatchId: '' });
  const [saving,        setSaving]        = useState(false);

  // ── Effects + handlers (unchanged) ───────────────────────────
  const fetch = () => { API.get('/announcements').then(r => setAnnouncements(r.data)); };
  useEffect(() => { fetch(); API.get('/batches').then(r => setBatches(r.data)); }, []); // eslint-disable-line

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    setSaving(true);
    await API.post('/announcements', form);
    setSaving(false);
    setShowForm(false);
    setForm({ title: '', message: '', targetBatchId: '' });
    fetch();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      await API.delete(`/announcements/${id}`);
      fetch();
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div data-testid="announcements-page" className="relative animate-fade-in">

      {/* ════════════════════════════════════════════════════════
          STICKY TOOLBAR — matches StudentsPage / AttendancePage
      ════════════════════════════════════════════════════════ */}
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
            <h1
              className="text-[1.2rem] font-bold tracking-tight leading-tight"
              style={{ color: 'rgba(255,255,255,0.95)' }}
            >
              Announcements
            </h1>
            <p className="text-[11.5px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Institute notices and updates
            </p>
          </div>

          {/* New Announcement button — admin only */}
          {isAdmin && (
            <button
              data-testid="create-announcement-btn"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-bold text-white shrink-0"
              style={{
                background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',
                boxShadow:  '0 3px 12px rgba(108,60,244,0.38)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 5px 18px rgba(108,60,244,0.52)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 3px 12px rgba(108,60,244,0.38)';
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              New Announcement
            </button>
          )}
        </div>
      </div>
      {/* ── end sticky toolbar ── */}

      {/* ════════════════════════════════════════════════════════
          CREATE ANNOUNCEMENT MODAL
      ════════════════════════════════════════════════════════ */}
      {showForm && createPortal((
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
            style={{
              ...MODAL_GLASS,
              maxHeight: 'calc(100vh - 48px)',
              overflow:  'hidden',
              display:   'flex',
              flexDirection: 'column',
            }}
            data-testid="announcement-form"
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(108,60,244,0.18)', border: '1px solid rgba(108,60,244,0.30)' }}
                >
                  <Megaphone size={14} style={{ color: '#a78bfa' }} />
                </div>
                <h3 className="text-[14.5px] font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>
                  New Announcement
                </h3>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg"
                style={{ color: 'rgba(255,255,255,0.40)', transition: 'background 0.12s, color 0.12s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.40)'; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body — scrollable */}
            <form
              onSubmit={handleCreate}
              className="p-5 space-y-4 overflow-y-auto"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(108,60,244,0.25) transparent' }}
            >
              {/* Title */}
              <div>
                <label style={LABEL_STYLE}>Title</label>
                <input
                  data-testid="announcement-title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Announcement title…"
                  style={INPUT_STYLE}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              {/* Message */}
              <div>
                <label style={LABEL_STYLE}>Message</label>
                <textarea
                  data-testid="announcement-message"
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  placeholder="Write your announcement…"
                  style={{
                    ...INPUT_STYLE,
                    resize:     'none',
                    lineHeight: 1.6,
                  }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              {/* Target batch */}
              <div>
                <label style={LABEL_STYLE}>Target Audience</label>
                <div className="relative">
                  <select
                    data-testid="announcement-target"
                    value={form.targetBatchId}
                    onChange={e => setForm({ ...form, targetBatchId: e.target.value })}
                    style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer', paddingRight: 30 }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  >
                    <option value="" style={{ background: '#1a1625' }}>All Students</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id} style={{ background: '#1a1625' }}>
                        {b.batchName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                data-testid="submit-announcement"
                type="submit"
                disabled={saving || !form.title.trim() || !form.message.trim()}
                className="w-full py-2.5 rounded-[10px] text-[13px] font-bold text-white mt-1"
                style={{
                  background: (saving || !form.title.trim() || !form.message.trim())
                    ? 'rgba(108,60,244,0.35)'
                    : 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',
                  boxShadow: (saving || !form.title.trim() || !form.message.trim())
                    ? 'none'
                    : '0 3px 14px rgba(108,60,244,0.42)',
                  cursor:     (saving || !form.title.trim() || !form.message.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  opacity:    saving ? 0.7 : 1,
                }}
                onMouseEnter={e => {
                  if (!saving && form.title.trim() && form.message.trim()) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 5px 20px rgba(108,60,244,0.55)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 3px 14px rgba(108,60,244,0.42)';
                }}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className="inline-block w-3.5 h-3.5 rounded-full animate-spin"
                      style={{ border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff' }}
                    />
                    Publishing…
                  </span>
                ) : (
                  'Publish Announcement'
                )}
              </button>
            </form>
          </div>
        </div>
      ), document.body)}

      {/* ════════════════════════════════════════════════════════
          ANNOUNCEMENTS LIST
      ════════════════════════════════════════════════════════ */}
      <div className="mt-5 space-y-3">
        {announcements.length > 0 ? (
          announcements.map(ann => (
            <div
              key={ann.id}
              data-testid={`announcement-${ann.id}`}
              style={{
                ...GLASS,
                padding:    '18px 20px',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform   = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(108,60,244,0.28)';
                e.currentTarget.style.boxShadow   =
                  '0 10px 36px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 40px rgba(108,60,244,0.07)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform   = 'none';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
                e.currentTarget.style.boxShadow   =
                  '0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)';
              }}
            >
              <div className="flex items-start justify-between gap-3">

                {/* Left — icon + content */}
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Megaphone icon bubble */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: 'rgba(108,60,244,0.15)',
                      border:     '1px solid rgba(108,60,244,0.28)',
                    }}
                  >
                    <Megaphone size={17} style={{ color: '#a78bfa' }} />
                  </div>

                  <div className="min-w-0">
                    {/* Title */}
                    <h4
                      className="text-[13.5px] font-bold leading-tight"
                      style={{ color: 'rgba(255,255,255,0.92)' }}
                    >
                      {ann.title}
                    </h4>

                    {/* Message body */}
                    <p
                      className="text-[12.5px] mt-1.5 leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.62)' }}
                    >
                      {ann.message}
                    </p>

                    {/* Metadata row */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2.5">
                      {/* Date */}
                      <span className="text-[10.5px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
                        {ann.createdAt?.slice(0, 10)}
                      </span>

                      <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>·</span>

                      {/* Author */}
                      <span className="text-[10.5px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
                        by {ann.createdBy}
                      </span>

                      {/* Batch badge */}
                      {ann.targetBatchName ? (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={{
                            background: 'rgba(59,130,246,0.14)',
                            color:      '#93c5fd',
                            border:     '1px solid rgba(59,130,246,0.24)',
                          }}
                        >
                          {ann.targetBatchName}
                        </span>
                      ) : (
                        /* "All Students" badge — only when targetBatchId is falsy */
                        !ann.targetBatchId && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                            style={{
                              background: 'rgba(108,60,244,0.13)',
                              color:      '#c4b5fd',
                              border:     '1px solid rgba(108,60,244,0.24)',
                            }}
                          >
                            <Users size={9} />
                            All Students
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Right — delete button (admin only) */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(ann.id)}
                    data-testid={`delete-announcement-${ann.id}`}
                    className="p-1.5 rounded-lg shrink-0"
                    style={{ color: 'rgba(239,68,68,0.45)', transition: 'background 0.12s, color 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.10)'; e.currentTarget.style.color = '#f87171'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(239,68,68,0.45)'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          /* ── Empty state ── */
          <div
            className="flex flex-col items-center justify-center py-20 gap-4"
            style={GLASS}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(108,60,244,0.12)', border: '1px solid rgba(108,60,244,0.24)' }}
            >
              <Megaphone size={26} style={{ color: '#a78bfa' }} />
            </div>
            <div className="text-center">
              <p className="text-[13.5px] font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
                No announcements yet
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.32)' }}>
                {isAdmin ? 'Create one with the button above' : 'Check back later for updates from your institute'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
