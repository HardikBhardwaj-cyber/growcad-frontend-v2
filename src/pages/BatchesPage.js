import { useState, useEffect } from 'react';
import API from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Pencil, Trash2, X, BookOpen, Users, Clock } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const emptyForm = { batchName: '', courseName: '', subject: '', teacherId: '', classDuration: '', scheduleDays: [], startDate: '', maxStudents: 30 };

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

  return (
    <div data-testid="batches-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1a1625]">{isAdmin ? 'Batches' : 'My Batches'}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{batches.length} {isAdmin ? 'active' : 'assigned'} batches</p>
        </div>
        {isAdmin && (
        <button data-testid="add-batch-button" onClick={() => { setEditing(null); setForm(emptyForm); setShowDialog(true); }} className="flex items-center gap-1.5 px-4 py-2 bg-[#6C3CF4] text-white rounded-lg text-xs font-semibold hover:bg-[#5b2ed4] transition-colors shadow-sm shadow-[#6C3CF4]/20">
          <Plus size={15} /> Add Batch
        </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map(b => (
          <div key={b.id} data-testid={`batch-card-${b.id}`} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#6C3CF4]/10 flex items-center justify-center">
                  <BookOpen size={16} className="text-[#6C3CF4]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1a1625]">{b.batchName}</h3>
                  <p className="text-[10px] text-gray-400">{b.courseName}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {isAdmin && <button onClick={() => handleEdit(b)} data-testid={`edit-batch-${b.id}`} className="p-1.5 hover:bg-gray-100 rounded-md"><Pencil size={13} className="text-gray-400" /></button>}
                {isAdmin && <button onClick={() => handleDelete(b.id)} data-testid={`delete-batch-${b.id}`} className="p-1.5 hover:bg-red-50 rounded-md"><Trash2 size={13} className="text-red-400" /></button>}
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-500">
                <BookOpen size={12} /> <span>{b.subject || 'General'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Users size={12} /> <span>{b.teacherName || 'Unassigned'} | {b.studentCount || 0} students</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Clock size={12} /> <span>{b.classDuration || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {(b.scheduleDays || []).map(d => (
                  <span key={d} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">{d.slice(0, 3)}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {!batches.length && !loading && (
          <div className="col-span-full py-12 text-center">
            <BookOpen size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No batches created yet</p>
          </div>
        )}
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="batch-form-dialog">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#1a1625]">{editing ? 'Edit Batch' : 'Add Batch'}</h3>
              <button onClick={() => setShowDialog(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.batchName} onChange={e => setForm({...form, batchName: e.target.value})} placeholder="Batch Name *" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.courseName} onChange={e => setForm({...form, courseName: e.target.value})} placeholder="Course Name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
                <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Subject" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
              </div>
              <select value={form.teacherId} onChange={e => setForm({...form, teacherId: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none">
                <option value="">Assign Teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subjectExpertise})</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input value={form.classDuration} onChange={e => setForm({...form, classDuration: e.target.value})} placeholder="Duration (e.g. 2 hours)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
                <input type="number" value={form.maxStudents} onChange={e => setForm({...form, maxStudents: e.target.value})} placeholder="Max Students" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
              </div>
              <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Schedule Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map(d => (
                    <button type="button" key={d} onClick={() => toggleDay(d)} className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors ${form.scheduleDays.includes(d) ? 'bg-[#6C3CF4] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{d.slice(0, 3)}</button>
                  ))}
                </div>
              </div>
              <button type="submit" data-testid="batch-form-submit" className="w-full bg-[#6C3CF4] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#5b2ed4] transition-colors shadow-sm">
                {editing ? 'Update Batch' : 'Create Batch'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
