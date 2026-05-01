import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Upload, Pencil, Trash2, X, GraduationCap, Send, Eye } from 'lucide-react';
import CSVUploadDialog from '@/components/CSVUploadDialog';

const emptyForm = { name: '', phoneNumber: '', parentPhoneNumber: '', email: '', batchId: '', admissionDate: '' };

export default function StudentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(() => {
    const params = {};
    if (search) params.search = search;
    if (batchFilter) params.batchId = batchFilter;
    API.get('/students', { params }).then(r => { setStudents(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [search, batchFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { API.get('/batches').then(r => setBatches(r.data)); }, []);

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
    setForm({ name: s.name, phoneNumber: s.phoneNumber || '', parentPhoneNumber: s.parentPhoneNumber || '', email: s.email || '', batchId: s.batchId || '', admissionDate: s.admissionDate || '' });
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this student?')) {
      await API.delete(`/students/${id}`);
      fetchStudents();
    }
  };

  const [reminding, setReminding] = useState({});

  const sendQuickReminder = async (s) => {
    setReminding(p => ({ ...p, [s.id]: true }));
    try {
      const fees = await API.get(`/students/${s.id}/profile`);
      const feeData = fees.data?.fees;
      if (feeData?.totalPending > 0 && feeData?.records?.[0]) {
        const pending = feeData.records[0].installments?.find(i => i.status !== 'paid');
        if (pending) {
          await API.post('/reminders/send-now', { studentId: s.id, amount: pending.amount, dueDate: pending.dueDate, type: 'manual' });
        }
      }
      setReminding(p => ({ ...p, [s.id]: 'done' }));
      setTimeout(() => setReminding(p => ({ ...p, [s.id]: false })), 2000);
    } catch { setReminding(p => ({ ...p, [s.id]: false })); }
  };

  const batchName = (id) => batches.find(b => b.id === id)?.batchName || '-';

  return (
    <div data-testid="students-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1a1625]">Students</h1>
          <p className="text-xs text-gray-400 mt-0.5">{students.length} total students</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowCSV(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
              data-testid="csv-upload-students"
            >
              <Upload size={14} /> CSV Upload
            </button>
          )}
          {isAdmin && (
            <button
              data-testid="add-student-button"
              onClick={() => { setEditing(null); setForm(emptyForm); setShowDialog(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#6C3CF4] text-white rounded-lg text-xs font-semibold hover:bg-[#5b2ed4] transition-colors shadow-sm shadow-[#6C3CF4]/20"
            >
              <Plus size={15} /> Add Student
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            data-testid="student-search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none"
          />
        </div>
        <select
          data-testid="student-batch-filter"
          value={batchFilter}
          onChange={e => setBatchFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none"
        >
          <option value="">All Batches</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="student-table">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Phone</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Email</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Batch</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-[#6C3CF4]/[0.02] transition-colors" data-testid={`student-row-${s.id}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#6C3CF4]/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-[#6C3CF4]">{s.name?.charAt(0)}</span>
                      </div>
                      <Link to={`/students/${s.id}`} className="text-xs font-medium text-[#1a1625] hover:text-[#6C3CF4] transition-colors" data-testid={`student-link-${s.id}`}>{s.name}</Link>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 hidden md:table-cell">{s.phoneNumber || '-'}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 hidden lg:table-cell">{s.email || '-'}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] px-2 py-0.5 bg-[#6C3CF4]/8 text-[#6C3CF4] rounded-full font-medium">{batchName(s.batchId)}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-0.5">
                      <Link to={`/students/${s.id}`} data-testid={`view-student-${s.id}`} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><Eye size={13} className="text-gray-400" /></Link>
                      {isAdmin && <>
                        <button onClick={() => sendQuickReminder(s)} data-testid={`remind-student-${s.id}`}
                          className={`p-1.5 rounded-md transition-colors ${reminding[s.id] === 'done' ? 'bg-green-50' : 'hover:bg-amber-50'}`} disabled={reminding[s.id] === true}>
                          <Send size={13} className={reminding[s.id] === 'done' ? 'text-green-500' : reminding[s.id] === true ? 'text-gray-300 animate-pulse' : 'text-amber-400'} />
                        </button>
                        <button onClick={() => handleEdit(s)} data-testid={`edit-student-${s.id}`} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><Pencil size={13} className="text-gray-400" /></button>
                        <button onClick={() => handleDelete(s.id)} data-testid={`delete-student-${s.id}`} className="p-1.5 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={13} className="text-red-400" /></button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
              {!students.length && !loading && (
                <tr><td colSpan={5} className="px-4 py-12 text-center">
                  <GraduationCap size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No students found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="student-form-dialog">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#1a1625]">{editing ? 'Edit Student' : 'Add Student'}</h3>
              <button onClick={() => setShowDialog(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input data-testid="student-form-name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Student Name *" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none" />
              <input data-testid="student-form-email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" type="email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} placeholder="Phone" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none" />
                <input value={form.parentPhoneNumber} onChange={e => setForm({...form, parentPhoneNumber: e.target.value})} placeholder="Parent Phone" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none" />
              </div>
              <select data-testid="student-form-batch" value={form.batchId} onChange={e => setForm({...form, batchId: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none">
                <option value="">Select Batch</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
              </select>
              <input type="date" value={form.admissionDate} onChange={e => setForm({...form, admissionDate: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
              <button data-testid="student-form-submit" type="submit" className="w-full bg-[#6C3CF4] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#5b2ed4] transition-colors shadow-sm">
                {editing ? 'Update Student' : 'Add Student'}
              </button>
            </form>
          </div>
        </div>
      )}

      <CSVUploadDialog open={showCSV} onClose={() => setShowCSV(false)} type="students" onSuccess={fetchStudents} />
    </div>
  );
}
