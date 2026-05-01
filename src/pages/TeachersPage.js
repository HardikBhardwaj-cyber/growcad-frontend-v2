import { useState, useEffect, useCallback } from 'react';
import API from '@/api';
import { Plus, Search, Upload, Pencil, Trash2, X, Users } from 'lucide-react';
import CSVUploadDialog from '@/components/CSVUploadDialog';

const emptyForm = { name: '', phoneNumber: '', email: '', subjectExpertise: '', assignedBatches: [], joiningDate: '', salary: 0 };

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

  return (
    <div data-testid="teachers-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1a1625]">Teachers</h1>
          <p className="text-xs text-gray-400 mt-0.5">{teachers.length} total teachers</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCSV(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
            data-testid="csv-upload-teachers"
          >
            <Upload size={14} /> CSV Upload
          </button>
          <button data-testid="add-teacher-button" onClick={() => { setEditing(null); setForm(emptyForm); setShowDialog(true); }} className="flex items-center gap-1.5 px-4 py-2 bg-[#6C3CF4] text-white rounded-lg text-xs font-semibold hover:bg-[#5b2ed4] transition-colors shadow-sm shadow-[#6C3CF4]/20">
            <Plus size={15} /> Add Teacher
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input data-testid="teacher-search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teachers..." className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="teacher-table">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Subject</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Phone</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Email</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Salary</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-[#6C3CF4]/[0.02] transition-colors" data-testid={`teacher-row-${t.id}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-blue-600">{t.name?.charAt(0)}</span>
                      </div>
                      <span className="text-xs font-medium text-[#1a1625]">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell"><span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">{t.subjectExpertise || '-'}</span></td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 hidden md:table-cell">{t.phoneNumber || '-'}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 hidden lg:table-cell">{t.email || '-'}</td>
                  <td className="px-4 py-2.5 text-xs font-medium text-gray-700 hidden lg:table-cell">{t.salary ? `Rs.${t.salary.toLocaleString()}` : '-'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-0.5">
                      <button onClick={() => handleEdit(t)} data-testid={`edit-teacher-${t.id}`} className="p-1.5 hover:bg-gray-100 rounded-md"><Pencil size={13} className="text-gray-400" /></button>
                      <button onClick={() => handleDelete(t.id)} data-testid={`delete-teacher-${t.id}`} className="p-1.5 hover:bg-red-50 rounded-md"><Trash2 size={13} className="text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!teachers.length && !loading && (
                <tr><td colSpan={6} className="px-4 py-12 text-center">
                  <Users size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No teachers found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="teacher-form-dialog">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#1a1625]">{editing ? 'Edit Teacher' : 'Add Teacher'}</h3>
              <button onClick={() => setShowDialog(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Teacher Name *" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none" />
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" type="email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} placeholder="Phone" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none" />
                <input value={form.subjectExpertise} onChange={e => setForm({...form, subjectExpertise: e.target.value})} placeholder="Subject" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 focus:border-[#6C3CF4] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
                <input type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} placeholder="Salary" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
              </div>
              <button type="submit" data-testid="teacher-form-submit" className="w-full bg-[#6C3CF4] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#5b2ed4] transition-colors shadow-sm">
                {editing ? 'Update Teacher' : 'Add Teacher'}
              </button>
            </form>
          </div>
        </div>
      )}

      <CSVUploadDialog open={showCSV} onClose={() => setShowCSV(false)} type="teachers" onSuccess={fetchTeachers} />
    </div>
  );
}