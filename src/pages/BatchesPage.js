import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Pencil, Trash2, X, BookOpen, Users, Clock, ChevronDown } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const emptyForm = { batchName: '', courseName: '', subject: '', teacherId: '', classDuration: '', scheduleDays: [], startDate: '', maxStudents: 30 };

const INPUT = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
  color: 'rgba(255,255,255,0.88)',
  borderRadius: '10px',
  outline: 'none',
  width: '100%',
  padding: '9px 12px',
  fontSize: '13px',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const btnPrimary = {
  background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',
  boxShadow: '0 3px 12px rgba(108,60,244,0.38)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
};

const glassCard = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '16px',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)',
};

function focusInput(e) {
  e.currentTarget.style.borderColor = 'rgba(108,60,244,0.65)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,60,244,0.14)';
}

function blurInput(e) {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
  e.currentTarget.style.boxShadow = 'none';
}

function DarkInput({ style = {}, ...props }) {
  return (
    <input
      {...props}
      style={{ ...INPUT, ...style }}
      onFocus={focusInput}
      onBlur={blurInput}
    />
  );
}

function InfoRow({ icon, children }) {
  return (
    <div className="flex items-center gap-2 text-[12px]" style={{ color: 'rgba(255,255,255,0.58)' }}>
      <span className="shrink-0" style={{ color: 'rgba(196,181,253,0.76)' }}>{icon}</span>
      <span className="truncate">{children}</span>
    </div>
  );
}

export default function BatchesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const fetchBatches = () => {
    API.get('/batches').then(r => { setBatches(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchBatches(); API.get('/teachers').then(r => setTeachers(r.data)); }, []);

  const openAddDialog = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, maxStudents: parseInt(form.maxStudents) || 30 };
    if (editing) {
      await API.put(`/batches/${editing.id}`, payload);
    } else {
      await API.post('/batches', payload);
    }
    setShowDialog(false);
    setEditing(null);
    setForm(emptyForm);
    fetchBatches();
  };

  const handleEdit = (b) => {
    setEditing(b);
    setForm({ batchName: b.batchName, courseName: b.courseName || '', subject: b.subject || '', teacherId: b.teacherId || '', classDuration: b.classDuration || '', scheduleDays: b.scheduleDays || [], startDate: b.startDate || '', maxStudents: b.maxStudents || 30 });
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this batch?')) {
      await API.delete(`/batches/${id}`);
      fetchBatches();
    }
  };

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      scheduleDays: f.scheduleDays.includes(day)
        ? f.scheduleDays.filter(d => d !== day)
        : [...f.scheduleDays, day]
    }));
  };

  if (loading) {
    return (
      <div data-testid="batches-page" className="relative animate-fade-in">
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 rounded-full animate-spin"
              style={{ border: '2px solid rgba(108,60,244,0.22)', borderTopColor: '#7c4ff5' }}
            />
            <p className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Loading batches...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="batches-page" className="relative animate-fade-in">
      <div
        className="sticky top-0 z-20 -mx-4 lg:-mx-7 px-4 lg:px-7 pb-3 pt-4"
        style={{
          background: 'rgba(14,12,23,0.88)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.28)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h1 className="text-[1.2rem] font-bold tracking-tight leading-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
              {isAdmin ? 'Batches' : 'My Batches'}
            </h1>
            <p className="text-[11.5px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {batches.length} {isAdmin ? 'active' : 'assigned'} batch{batches.length !== 1 ? 'es' : ''}
            </p>
          </div>

          {isAdmin && (
            <button
              data-testid="add-batch-button"
              onClick={openAddDialog}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-bold text-white"
              style={btnPrimary}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 5px 18px rgba(108,60,244,0.52)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 3px 12px rgba(108,60,244,0.38)';
              }}
            >
              <Plus size={14} /> Add Batch
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {batches.map(b => (
          <div
            key={b.id}
            data-testid={`batch-card-${b.id}`}
            className="p-4 transition-transform"
            style={glassCard}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = 'rgba(167,139,250,0.22)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(108,60,244,0.14)', border: '1px solid rgba(108,60,244,0.28)' }}
                >
                  <BookOpen size={17} style={{ color: '#c4b5fd' }} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[14px] font-bold truncate" style={{ color: 'rgba(255,255,255,0.92)' }}>
                    {b.batchName}
                  </h3>
                  <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.42)' }}>
                    {b.courseName || 'No course assigned'}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-0.5 shrink-0">
                  <button
                    onClick={() => handleEdit(b)}
                    data-testid={`edit-batch-${b.id}`}
                    className="p-1.5 rounded-lg"
                    style={{ color: 'rgba(255,255,255,0.38)', transition: 'background 0.12s, color 0.12s' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.80)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.38)';
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    data-testid={`delete-batch-${b.id}`}
                    className="p-1.5 rounded-lg"
                    style={{ color: 'rgba(239,68,68,0.55)', transition: 'background 0.12s, color 0.12s' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.10)';
                      e.currentTarget.style.color = '#f87171';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(239,68,68,0.55)';
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <InfoRow icon={<BookOpen size={13} />}>{b.subject || 'General'}</InfoRow>
              <InfoRow icon={<Users size={13} />}>{b.teacherName || 'Unassigned'} | {b.studentCount || 0} students</InfoRow>
              <InfoRow icon={<Clock size={13} />}>{b.classDuration || 'N/A'}</InfoRow>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {(b.scheduleDays || []).length ? (
                (b.scheduleDays || []).map(d => (
                  <span
                    key={d}
                    className="text-[10px] px-2 py-1 rounded-lg font-semibold"
                    style={{
                      background: 'rgba(108,60,244,0.14)',
                      border: '1px solid rgba(108,60,244,0.22)',
                      color: '#c4b5fd',
                    }}
                  >
                    {d.slice(0, 3)}
                  </span>
                ))
              ) : (
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.32)' }}>
                  No schedule set
                </span>
              )}
            </div>
          </div>
        ))}

        {!batches.length && (
          <div className="col-span-full py-14 text-center" style={glassCard}>
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(108,60,244,0.12)', border: '1px solid rgba(108,60,244,0.22)' }}
              >
                <BookOpen size={22} style={{ color: '#a78bfa' }} />
              </div>
              <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.50)' }}>
                No batches created yet
              </p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.32)' }}>
                Create a batch to organize classes and students
              </p>
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="hidden sm:flex justify-end sticky bottom-6 mt-5 pointer-events-none" aria-hidden="true">
          <button
            onClick={openAddDialog}
            aria-label="Add batch"
            className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-bold text-white"
            style={{
              background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6,#a855f7)',
              boxShadow: '0 4px 18px rgba(108,60,244,0.38), 0 2px 6px rgba(0,0,0,0.32)',
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
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; }}
          >
            <Plus size={15} strokeWidth={2.4} />
            Add Batch
          </button>
        </div>
      )}

      {showDialog && createPortal((
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
          style={{
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          data-testid="batch-form-dialog"
        >
          <div
            className="w-full max-w-lg animate-fade-in overflow-y-auto"
            style={{
              background: 'linear-gradient(160deg, rgba(22,18,38,0.98), rgba(16,13,28,0.98))',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
              backdropFilter: 'blur(28px)',
              maxHeight: 'calc(100vh - 48px)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>
                  {editing ? 'Edit Batch' : 'Add Batch'}
                </h3>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.42)' }}>
                  Batch schedule, teacher, and capacity details
                </p>
              </div>
              <button
                onClick={() => setShowDialog(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg"
                style={{ color: 'rgba(255,255,255,0.40)', transition: 'background 0.12s, color 0.12s' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.40)';
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                  Batch Name *
                </label>
                <DarkInput
                  value={form.batchName}
                  onChange={e => setForm({ ...form, batchName: e.target.value })}
                  placeholder="Batch name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                    Course Name
                  </label>
                  <DarkInput
                    value={form.courseName}
                    onChange={e => setForm({ ...form, courseName: e.target.value })}
                    placeholder="Course name"
                  />
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                    Subject
                  </label>
                  <DarkInput
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="Subject"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                  Teacher
                </label>
                <div className="relative">
                  <select
                    value={form.teacherId}
                    onChange={e => setForm({ ...form, teacherId: e.target.value })}
                    style={{ ...INPUT, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                    onFocus={focusInput}
                    onBlur={blurInput}
                  >
                    <option value="" style={{ background: '#1a1625' }}>Assign Teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id} style={{ background: '#1a1625' }}>{t.name} ({t.subjectExpertise || 'General'})</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.35)' }} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                    Duration
                  </label>
                  <DarkInput
                    value={form.classDuration}
                    onChange={e => setForm({ ...form, classDuration: e.target.value })}
                    placeholder="Duration (e.g. 2 hours)"
                  />
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                    Max Students
                  </label>
                  <DarkInput
                    type="number"
                    value={form.maxStudents}
                    onChange={e => setForm({ ...form, maxStudents: e.target.value })}
                    placeholder="Max students"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                  Start Date
                </label>
                <DarkInput
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div>
                <label className="block mb-2" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                  Schedule Days
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map(d => {
                    const selected = form.scheduleDays.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleDay(d)}
                        className="text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-colors"
                        style={{
                          background: selected ? 'rgba(108,60,244,0.82)' : 'rgba(255,255,255,0.06)',
                          border: selected ? '1px solid rgba(167,139,250,0.42)' : '1px solid rgba(255,255,255,0.10)',
                          color: selected ? '#fff' : 'rgba(255,255,255,0.58)',
                        }}
                      >
                        {d.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                data-testid="batch-form-submit"
                className="w-full py-2.5 rounded-[10px] text-[13px] font-bold text-white mt-1"
                style={btnPrimary}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 5px 18px rgba(108,60,244,0.52)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 3px 12px rgba(108,60,244,0.38)';
                }}
              >
                {editing ? 'Update Batch' : 'Create Batch'}
              </button>
            </form>
          </div>
        </div>
      ), document.body)}
    </div>
  );
}
