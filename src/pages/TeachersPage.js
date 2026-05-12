import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import API from '@/api';
import { Plus, Search, Upload, Pencil, Trash2, X, Users } from 'lucide-react';
import CSVUploadDialog from '@/components/CSVUploadDialog';

const emptyForm = { name: '', phoneNumber: '', email: '', subjectExpertise: '', assignedBatches: [], joiningDate: '', salary: 0 };

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

const tableCard = {
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

function Avatar({ name, size = 30 }) {
  const letter = name?.charAt(0)?.toUpperCase() || '?';
  const colors = ['#6C3CF4', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#0ea5e9'];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  const color = colors[idx];

  return (
    <div
      className="flex items-center justify-center shrink-0 rounded-full font-bold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `${color}22`,
        border: `1px solid ${color}40`,
        color,
      }}
    >
      {letter}
    </div>
  );
}

function SubjectBadge({ subject }) {
  if (!subject) {
    return <span style={{ color: 'rgba(255,255,255,0.30)', fontSize: 12 }}>-</span>;
  }

  return (
    <span
      className="font-semibold"
      style={{
        fontSize: 11,
        padding: '2px 9px',
        borderRadius: 99,
        background: 'rgba(16,185,129,0.12)',
        color: '#34d399',
        border: '1px solid rgba(52,211,153,0.22)',
        whiteSpace: 'nowrap',
      }}
    >
      {subject}
    </span>
  );
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = useCallback(() => {
    const params = {};
    if (search) params.search = search;
    API.get('/teachers', { params }).then(r => { setTeachers(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);
  useEffect(() => { API.get('/batches').then(r => setBatches(r.data)); }, []);

  const openAddDialog = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, salary: parseFloat(form.salary) || 0 };
    if (editing) {
      await API.put(`/teachers/${editing.id}`, payload);
    } else {
      await API.post('/teachers', payload);
    }
    setShowDialog(false);
    setEditing(null);
    setForm(emptyForm);
    fetchTeachers();
  };

  const handleEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name, phoneNumber: t.phoneNumber || '', email: t.email || '', subjectExpertise: t.subjectExpertise || '', assignedBatches: t.assignedBatches || [], joiningDate: t.joiningDate || '', salary: t.salary || 0 });
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this teacher?')) {
      await API.delete(`/teachers/${id}`);
      fetchTeachers();
    }
  };

  const formatSalary = (salary) => {
    const value = Number(salary || 0);
    return value ? `Rs.${value.toLocaleString('en-IN')}` : '-';
  };

  if (loading) {
    return (
      <div data-testid="teachers-page" className="relative animate-fade-in">
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 rounded-full animate-spin"
              style={{ border: '2px solid rgba(108,60,244,0.22)', borderTopColor: '#7c4ff5' }}
            />
            <p className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Loading teachers...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="teachers-page" className="relative animate-fade-in">
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
            <h1
              className="text-[1.2rem] font-bold tracking-tight leading-tight"
              style={{ color: 'rgba(255,255,255,0.95)' }}
            >
              Teachers
            </h1>
            <p className="text-[11.5px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {teachers.length} total teacher{teachers.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCSV(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px] font-semibold"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.72)',
                transition: 'background 0.15s, border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.92)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.72)';
              }}
              data-testid="csv-upload-teachers"
            >
              <Upload size={13} /> CSV Upload
            </button>
            <button
              data-testid="add-teacher-button"
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
              <Plus size={14} /> Add Teacher
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <div className="relative flex-1 max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            />
            <input
              data-testid="teacher-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search teachers..."
              style={{ ...INPUT, paddingLeft: 34 }}
              onFocus={focusInput}
              onBlur={blurInput}
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="overflow-hidden" style={tableCard}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 900 }} data-testid="teacher-table">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)' }}>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>Name</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest hidden md:table-cell" style={{ color: 'rgba(255,255,255,0.45)' }}>Subject</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest hidden md:table-cell" style={{ color: 'rgba(255,255,255,0.45)' }}>Phone</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest hidden lg:table-cell" style={{ color: 'rgba(255,255,255,0.45)' }}>Email</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest hidden lg:table-cell" style={{ color: 'rgba(255,255,255,0.45)' }}>Salary</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest w-24" style={{ color: 'rgba(255,255,255,0.45)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(t => (
                <tr
                  key={t.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.055)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,60,244,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  data-testid={`teacher-row-${t.id}`}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={t.name} size={30} />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold truncate" style={{ color: 'rgba(255,255,255,0.88)' }}>
                          {t.name}
                        </p>
                        <p className="text-[11px] md:hidden truncate" style={{ color: 'rgba(255,255,255,0.42)' }}>
                          {t.subjectExpertise || 'No subject'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <SubjectBadge subject={t.subjectExpertise} />
                  </td>
                  <td className="px-5 py-3 text-[12px] hidden md:table-cell" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {t.phoneNumber || '-'}
                  </td>
                  <td className="px-5 py-3 text-[12px] hidden lg:table-cell" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {t.email || '-'}
                  </td>
                  <td className="px-5 py-3 text-[12px] font-semibold hidden lg:table-cell" style={{ color: 'rgba(255,255,255,0.72)' }}>
                    {formatSalary(t.salary)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => handleEdit(t)}
                        data-testid={`edit-teacher-${t.id}`}
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
                        onClick={() => handleDelete(t.id)}
                        data-testid={`delete-teacher-${t.id}`}
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
                  </td>
                </tr>
              ))}
              {!teachers.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center" style={{ border: 'none' }}>
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(108,60,244,0.12)', border: '1px solid rgba(108,60,244,0.22)' }}
                      >
                        <Users size={22} style={{ color: '#a78bfa' }} />
                      </div>
                      <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.50)' }}>
                        No teachers found
                      </p>
                      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.32)' }}>
                        {search ? 'Try adjusting your search' : 'Add your first teacher to get started'}
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

      <div className="hidden sm:flex justify-end sticky bottom-6 mt-5 pointer-events-none" aria-hidden="true">
        <button
          onClick={openAddDialog}
          aria-label="Add teacher"
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
          Add Teacher
        </button>
      </div>

      {showDialog && createPortal((
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
          style={{
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          data-testid="teacher-form-dialog"
        >
          <div
            className="w-full max-w-md animate-fade-in overflow-y-auto"
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
                  {editing ? 'Edit Teacher' : 'Add Teacher'}
                </h3>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.42)' }}>
                  Teacher profile and subject details
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
                  Teacher Name *
                </label>
                <DarkInput
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Teacher name"
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                  Email
                </label>
                <DarkInput
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="teacher@email.com"
                  type="email"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                    Phone
                  </label>
                  <DarkInput
                    value={form.phoneNumber}
                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                    Subject
                  </label>
                  <DarkInput
                    value={form.subjectExpertise}
                    onChange={e => setForm({ ...form, subjectExpertise: e.target.value })}
                    placeholder="Physics"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                    Joining Date
                  </label>
                  <DarkInput
                    type="date"
                    value={form.joiningDate}
                    onChange={e => setForm({ ...form, joiningDate: e.target.value })}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
                    Salary
                  </label>
                  <DarkInput
                    type="number"
                    value={form.salary}
                    onChange={e => setForm({ ...form, salary: e.target.value })}
                    placeholder="45000"
                  />
                </div>
              </div>
              {!!batches.length && (
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.34)' }}>
                  {batches.length} batch{batches.length !== 1 ? 'es' : ''} available for assignment from batch settings.
                </p>
              )}
              <button
                type="submit"
                data-testid="teacher-form-submit"
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
                {editing ? 'Update Teacher' : 'Add Teacher'}
              </button>
            </form>
          </div>
        </div>
      ), document.body)}

      <CSVUploadDialog open={showCSV} onClose={() => setShowCSV(false)} type="teachers" onSuccess={fetchTeachers} />
    </div>
  );
}
