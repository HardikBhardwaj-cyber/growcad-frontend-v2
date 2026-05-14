import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Pencil, Trash2, X, BookOpen, Users, Clock, ChevronDown } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const emptyForm = {
  batchName: '',
  courseName: '',
  subject: '',
  teacherId: '',
  teacherIds: [],
  subjects: [],
  classDuration: '',
  scheduleDays: [],
  startDate: '',
  maxStudents: 30,
};

const makeEmptyForm = () => ({
  ...emptyForm,
  teacherIds: [],
  subjects: [],
  scheduleDays: [],
});

const FEATURE_DEFAULTS = {
  multi_teacher_batches_enabled: false,
  multi_subject_batches_enabled: false,
};

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

function MiniChip({ children, onRemove, tone = 'purple' }) {
  const tones = {
    purple: ['rgba(108,60,244,0.15)', 'rgba(167,139,250,0.28)', '#c4b5fd'],
    blue: ['rgba(59,130,246,0.14)', 'rgba(96,165,250,0.24)', '#93c5fd'],
    slate: ['rgba(148,163,184,0.10)', 'rgba(148,163,184,0.18)', '#cbd5e1'],
  };
  const [background, border, color] = tones[tone] || tones.purple;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold"
      style={{ background, border: `1px solid ${border}`, color }}
    >
      <span className="truncate max-w-[150px]">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md"
          style={{ color: 'rgba(255,255,255,0.62)' }}
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
}

function uniqueList(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function getBatchTeacherIds(batch = {}) {
  const ids = Array.isArray(batch.teacherIds) ? batch.teacherIds.filter(Boolean) : [];
  if (ids.length) return uniqueList(ids);

  const teacherObjects = Array.isArray(batch.teachers) ? batch.teachers : [];
  const derived = teacherObjects
    .map(t => (typeof t === 'string' ? t : (t?.id || t?.teacherId || '')))
    .filter(Boolean);
  if (derived.length) return uniqueList(derived);

  return batch.teacherId ? [batch.teacherId] : [];
}

function getBatchSubjects(batch = {}) {
  const subjects = Array.isArray(batch.subjects) ? batch.subjects.filter(Boolean) : [];
  if (subjects.length) return uniqueList(subjects);
  return batch.subject ? [batch.subject] : [];
}

export default function BatchesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(makeEmptyForm());
  const [subjectDraft, setSubjectDraft] = useState('');
  const [featureFlags, setFeatureFlags] = useState(FEATURE_DEFAULTS);
  const [loading, setLoading] = useState(true);

  const fetchBatches = () => {
    API.get('/batches').then(r => { setBatches(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchBatches();
    API.get('/teachers').then(r => setTeachers(r.data));
    API.get('/settings/features')
      .then(r => setFeatureFlags({ ...FEATURE_DEFAULTS, ...(r.data || {}) }))
      .catch(() => setFeatureFlags(FEATURE_DEFAULTS));
  }, []);

  const multiTeacherEnabled = Boolean(featureFlags.multi_teacher_batches_enabled);
  const multiSubjectEnabled = Boolean(featureFlags.multi_subject_batches_enabled);

  const teacherLabel = (teacherId, batch = null) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) return teacher.name;
    if (batch?.teacherId === teacherId && batch?.teacherName) return batch.teacherName;
    return teacherId || 'Unassigned';
  };

  const teacherSummary = (batch) => {
    const ids = getBatchTeacherIds(batch);
    const names = ids.map(id => teacherLabel(id, batch)).filter(Boolean);
    if (!names.length && batch.teacherName) names.push(batch.teacherName);
    if (!names.length) return 'Unassigned';
    return names.length > 1 ? `${names[0]} +${names.length - 1} teachers` : names[0];
  };

  const openAddDialog = () => {
    setEditing(null);
    setForm(makeEmptyForm());
    setSubjectDraft('');
    setShowDialog(true);
  };

  const toggleTeacher = (teacherId) => {
    setForm(f => {
      const current = Array.isArray(f.teacherIds) && f.teacherIds.length
        ? f.teacherIds
        : (f.teacherId ? [f.teacherId] : []);
      const teacherIds = current.includes(teacherId)
        ? current.filter(id => id !== teacherId)
        : [...current, teacherId];
      return { ...f, teacherIds, teacherId: teacherIds[0] || '' };
    });
  };

  const addSubject = (raw = subjectDraft) => {
    const value = String(raw || '').trim();
    if (!value) return;
    setForm(f => {
      const current = Array.isArray(f.subjects) && f.subjects.length
        ? f.subjects
        : (f.subject ? [f.subject] : []);
      const exists = current.some(s => s.toLowerCase() === value.toLowerCase());
      const subjects = exists ? current : [...current, value];
      return { ...f, subjects, subject: subjects[0] || '' };
    });
    setSubjectDraft('');
  };

  const removeSubject = (subject) => {
    setForm(f => {
      const subjects = (f.subjects || []).filter(s => s !== subject);
      return { ...f, subjects, subject: subjects[0] || '' };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const teacherIds = uniqueList(Array.isArray(form.teacherIds) ? form.teacherIds : []);
    const subjects = uniqueList(Array.isArray(form.subjects) ? form.subjects : []);
    const payload = {
      ...form,
      maxStudents: parseInt(form.maxStudents) || 30,
      teacherId: multiTeacherEnabled ? (teacherIds[0] || form.teacherId || '') : (form.teacherId || ''),
      subject: multiSubjectEnabled ? (subjects[0] || form.subject || '') : (form.subject || ''),
    };

    if (multiTeacherEnabled) {
      payload.teacherIds = teacherIds.length ? teacherIds : (payload.teacherId ? [payload.teacherId] : []);
    } else {
      delete payload.teacherIds;
    }

    if (multiSubjectEnabled) {
      payload.subjects = subjects.length ? subjects : (payload.subject ? [payload.subject] : []);
    } else {
      delete payload.subjects;
    }

    if (editing) {
      await API.put(`/batches/${editing.id}`, payload);
    } else {
      await API.post('/batches', payload);
    }
    setShowDialog(false);
    setEditing(null);
    setForm(makeEmptyForm());
    setSubjectDraft('');
    fetchBatches();
  };

  const handleEdit = (b) => {
    const teacherIds = getBatchTeacherIds(b);
    const subjects = getBatchSubjects(b);
    setEditing(b);
    setForm({
      batchName: b.batchName,
      courseName: b.courseName || '',
      subject: subjects[0] || b.subject || '',
      teacherId: teacherIds[0] || b.teacherId || '',
      teacherIds,
      subjects,
      classDuration: b.classDuration || '',
      scheduleDays: b.scheduleDays || [],
      startDate: b.startDate || '',
      maxStudents: b.maxStudents || 30,
    });
    setSubjectDraft('');
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
        {batches.map(b => {
          const subjectList = getBatchSubjects(b);
          const teacherIdList = getBatchTeacherIds(b);
          const batchSubjects = multiSubjectEnabled ? subjectList : (b.subject ? [b.subject] : subjectList.slice(0, 1));
          const batchTeacherIds = multiTeacherEnabled ? teacherIdList : (b.teacherId ? [b.teacherId] : teacherIdList.slice(0, 1));
          const batchTeacherNames = batchTeacherIds.map(id => teacherLabel(id, b)).filter(Boolean);
          const teacherText = multiTeacherEnabled
            ? teacherSummary(b)
            : (b.teacherName || batchTeacherNames[0] || 'Unassigned');

          return (
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
              {batchSubjects.length > 1 ? (
                <div className="flex flex-wrap gap-1.5">
                  {batchSubjects.map(subject => (
                    <MiniChip key={subject} tone="blue">{subject}</MiniChip>
                  ))}
                </div>
              ) : (
                <InfoRow icon={<BookOpen size={13} />}>{batchSubjects[0] || 'General'}</InfoRow>
              )}
              <InfoRow icon={<Users size={13} />}>{teacherText} | {b.studentCount || 0} students</InfoRow>
              {multiTeacherEnabled && batchTeacherNames.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {batchTeacherNames.map(name => (
                    <MiniChip key={name} tone="purple">{name}</MiniChip>
                  ))}
                </div>
              )}
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
          );
        })}

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
                {multiSubjectEnabled ? (
                  <div className="sm:col-span-2">
                    <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                      Subjects
                    </label>
                    <div
                      style={{
                        ...INPUT,
                        padding: 10,
                        minHeight: 92,
                      }}
                    >
                      <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                        {(form.subjects || []).length ? (
                          form.subjects.map(subject => (
                            <MiniChip key={subject} tone="blue" onRemove={() => removeSubject(subject)}>
                              {subject}
                            </MiniChip>
                          ))
                        ) : (
                          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.34)' }}>
                            Add subjects for this batch
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <input
                          value={subjectDraft}
                          onChange={e => setSubjectDraft(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSubject();
                            }
                          }}
                          placeholder="Type subject and press Enter"
                          className="min-w-0 flex-1 bg-transparent outline-none text-[13px]"
                          style={{ color: 'rgba(255,255,255,0.88)' }}
                        />
                        <button
                          type="button"
                          onClick={() => addSubject()}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
                          style={{
                            background: 'rgba(108,60,244,0.22)',
                            border: '1px solid rgba(167,139,250,0.30)',
                            color: '#c4b5fd',
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                      Subject
                    </label>
                    <DarkInput
                      value={form.subject}
                      onChange={e => {
                        const subject = e.target.value;
                        setForm({ ...form, subject, subjects: subject ? [subject] : [] });
                      }}
                      placeholder="Subject"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                  {multiTeacherEnabled ? 'Teachers' : 'Teacher'}
                </label>
                {multiTeacherEnabled ? (
                  <div
                    style={{
                      ...INPUT,
                      padding: 10,
                      minHeight: 118,
                    }}
                  >
                    <div className="flex flex-wrap gap-1.5 min-h-[24px] mb-2">
                      {(form.teacherIds || []).length ? (
                        form.teacherIds.map(id => (
                          <MiniChip key={id} tone="purple" onRemove={() => toggleTeacher(id)}>
                            {teacherLabel(id)}
                          </MiniChip>
                        ))
                      ) : (
                        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.34)' }}>
                          Select one or more teachers
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {teachers.map(t => {
                        const selected = (form.teacherIds || []).includes(t.id);
                        return (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => toggleTeacher(t.id)}
                            className="text-left rounded-lg px-2.5 py-2 transition-colors"
                            style={{
                              background: selected ? 'rgba(108,60,244,0.22)' : 'rgba(255,255,255,0.045)',
                              border: selected ? '1px solid rgba(167,139,250,0.34)' : '1px solid rgba(255,255,255,0.08)',
                              color: 'rgba(255,255,255,0.86)',
                            }}
                          >
                            <span className="block text-[12px] font-bold truncate">{t.name}</span>
                            <span className="block text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.42)' }}>
                              {t.subjectExpertise || 'General'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={form.teacherId}
                      onChange={e => {
                        const teacherId = e.target.value;
                        setForm({ ...form, teacherId, teacherIds: teacherId ? [teacherId] : [] });
                      }}
                      style={{ ...INPUT, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                      onFocus={focusInput}
                      onBlur={blurInput}
                    >
                      <option value="" style={{ background: '#1a1625' }}>Assign Teacher</option>
                      {teachers.map(t => <option key={t.id} value={t.id} style={{ background: '#1a1625' }}>{t.name} ({t.subjectExpertise || 'General'})</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.35)' }} />
                  </div>
                )}
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
