import { useState, useEffect } from 'react';
import API from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { Megaphone, Plus, Trash2, X } from 'lucide-react';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [announcements, setAnnouncements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', targetBatchId: '' });
  const [saving, setSaving] = useState(false);

  const fetch = () => { API.get('/announcements').then(r => setAnnouncements(r.data)); };
  useEffect(() => { fetch(); API.get('/batches').then(r => setBatches(r.data)); }, []);

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

  return (
    <div data-testid="announcements-page">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1a1625]">Announcements</h1>
          <p className="text-xs text-gray-400 mt-0.5">Institute notices and updates</p>
        </div>
        {isAdmin && (
          <button data-testid="create-announcement-btn" onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#6C3CF4] text-white rounded-lg text-xs font-semibold hover:bg-[#5b2ed4] transition-colors shadow-sm">
            <Plus size={14} /> New Announcement
          </button>
        )}
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl" data-testid="announcement-form">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#1a1625]">New Announcement</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                <input data-testid="announcement-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" placeholder="Announcement title..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
                <textarea data-testid="announcement-message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none resize-none" placeholder="Write your announcement..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Target</label>
                <select data-testid="announcement-target" value={form.targetBatchId} onChange={e => setForm({ ...form, targetBatchId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none">
                  <option value="">All Students</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
                </select>
              </div>
              <button data-testid="submit-announcement" type="submit" disabled={saving || !form.title.trim() || !form.message.trim()}
                className="w-full py-2.5 bg-[#6C3CF4] text-white rounded-lg text-sm font-semibold hover:bg-[#5b2ed4] transition-colors disabled:opacity-50">
                {saving ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length > 0 ? announcements.map(ann => (
          <div key={ann.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm" data-testid={`announcement-${ann.id}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#6C3CF4]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone size={16} className="text-[#6C3CF4]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1a1625]">{ann.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{ann.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400">{ann.createdAt?.slice(0, 10)}</span>
                    <span className="text-[10px] text-gray-300">|</span>
                    <span className="text-[10px] text-gray-400">by {ann.createdBy}</span>
                    {ann.targetBatchName && (
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">{ann.targetBatchName}</span>
                    )}
                    {!ann.targetBatchId && <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">All Students</span>}
                  </div>
                </div>
              </div>
              {isAdmin && (
                <button onClick={() => handleDelete(ann.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" data-testid={`delete-announcement-${ann.id}`}>
                  <Trash2 size={14} className="text-gray-300 hover:text-red-400" />
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <Megaphone size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No announcements yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
