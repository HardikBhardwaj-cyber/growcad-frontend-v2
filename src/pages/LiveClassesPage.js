import { useState, useEffect } from 'react';
import API from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Video, Plus, X, ExternalLink, Play, Clock, AlertCircle,
  RefreshCw, Trash2, Lock, Calendar, Users
} from 'lucide-react';

const STATUS_CONFIG = {
  not_available: { label: 'No Recording', color: 'bg-gray-100 text-gray-400', icon: Lock },
  pending: { label: 'Waiting for Recording', color: 'bg-amber-50 text-amber-600', icon: Clock },
  processing: { label: 'Processing...', color: 'bg-blue-50 text-blue-600', icon: RefreshCw },
  ready: { label: 'Watch Recording', color: 'bg-green-50 text-green-600', icon: Play },
  failed: { label: 'Failed', color: 'bg-red-50 text-red-500', icon: AlertCircle },
};

export default function LiveClassesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const canCreate = isAdmin || isTeacher;
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [plan, setPlan] = useState('standard');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', batchId: '', startTime: '', endTime: '', recordingEnabled: false });
  const [creating, setCreating] = useState(false);

  const fetchClasses = () => {
    API.get('/live-classes').then(r => setClasses(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClasses();
    API.get('/batches').then(r => setBatches(r.data));
    API.get('/institute/plan').then(r => setPlan(r.data.plan));
  }, []);

  const now = new Date().toISOString();
  const upcoming = classes.filter(c => c.startTime >= now).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const past = classes.filter(c => c.startTime < now).sort((a, b) => b.startTime.localeCompare(a.startTime));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.batchId || !form.startTime || !form.endTime) return;
    setCreating(true);
    try {
      await API.post('/live-classes/create', {
        title: form.title, batchId: form.batchId,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        recordingEnabled: form.recordingEnabled,
      });
      setShowForm(false);
      setForm({ title: '', batchId: '', startTime: '', endTime: '', recordingEnabled: false });
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create class');
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class?')) return;
    await API.delete(`/live-classes/${id}`);
    fetchClasses();
  };

  const handleRetry = async (id) => {
    await API.post(`/live-classes/${id}/retry-recording`);
    fetchClasses();
  };

  if (plan === 'base') return (
    <div data-testid="live-classes-upgrade" className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center max-w-md">
        <div className="w-14 h-14 rounded-xl bg-[#6C3CF4]/10 flex items-center justify-center mx-auto mb-4"><Lock size={24} className="text-[#6C3CF4]" /></div>
        <h2 className="text-lg font-bold text-[#1a1625] mb-2">Live Classes Not Available</h2>
        <p className="text-xs text-gray-400 mb-5 leading-relaxed">Live classes with Google Meet integration are available on Starter and Standard plans. Upgrade your plan to unlock this feature.</p>
        <button data-testid="upgrade-plan-btn" onClick={() => window.location.href = '/settings'}
          className="px-6 py-2.5 bg-[#6C3CF4] text-white rounded-lg text-sm font-semibold hover:bg-[#5b2ed4] transition-colors shadow-sm">Upgrade Plan</button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-[3px] border-[#6C3CF4] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div data-testid="live-classes-page">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1a1625]">Live Classes</h1>
          <p className="text-xs text-gray-400 mt-0.5">Schedule and manage live sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${plan === 'standard' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
            {plan === 'standard' ? 'Standard Plan' : 'Starter Plan'}
          </span>
          {canCreate && (
            <button data-testid="schedule-class-btn" onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#6C3CF4] text-white rounded-lg text-xs font-semibold hover:bg-[#5b2ed4] transition-colors shadow-sm">
              <Plus size={14} /> Schedule Class
            </button>
          )}
        </div>
      </div>

      {/* Schedule Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl" data-testid="schedule-class-form">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#1a1625]">Schedule Live Class</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Class Title</label>
                <input data-testid="class-title-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" placeholder="e.g. Physics - Mechanics" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Batch</label>
                <select data-testid="class-batch-select" value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none">
                  <option value="">Select batch...</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                  <input data-testid="class-start-input" type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                  <input data-testid="class-end-input" type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
                </div>
              </div>
              {/* Recording toggle - plan gated */}
              {plan === 'standard' ? (
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors" data-testid="recording-toggle">
                  <input type="checkbox" checked={form.recordingEnabled} onChange={e => setForm({ ...form, recordingEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-[#6C3CF4] focus:ring-[#6C3CF4]" />
                  <div>
                    <p className="text-xs font-semibold text-[#1a1625]">Enable Recording</p>
                    <p className="text-[10px] text-gray-400">Class will be recorded and saved to cloud storage</p>
                  </div>
                </label>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200" data-testid="recording-upgrade-hint">
                  <Lock size={14} className="text-gray-300" />
                  <p className="text-[10px] text-gray-400">Upgrade to Standard plan for class recordings</p>
                </div>
              )}
              <button data-testid="create-class-submit" type="submit" disabled={creating || !form.title || !form.batchId || !form.startTime || !form.endTime}
                className="w-full py-2.5 bg-[#6C3CF4] text-white rounded-lg text-sm font-semibold hover:bg-[#5b2ed4] transition-colors disabled:opacity-50">
                {creating ? 'Scheduling...' : 'Schedule Class'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upcoming Classes */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[#1a1625] mb-3 flex items-center gap-2">
          <Calendar size={14} className="text-[#6C3CF4]" /> Upcoming Classes ({upcoming.length})
        </h2>
        {upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {upcoming.map(c => <ClassCard key={c.id} cls={c} plan={plan} canDelete={canCreate} onDelete={handleDelete} onRetry={handleRetry} />)}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
            <Video size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No upcoming classes scheduled</p>
          </div>
        )}
      </div>

      {/* Past Classes */}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#1a1625] mb-3 flex items-center gap-2">
            <Clock size={14} className="text-gray-400" /> Past Classes ({past.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {past.map(c => <ClassCard key={c.id} cls={c} plan={plan} isPast canDelete={canCreate} onDelete={handleDelete} onRetry={handleRetry} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function ClassCard({ cls, plan, isPast, canDelete, onDelete, onRetry }) {
  const c = cls;
  const start = new Date(c.startTime);
  const end = new Date(c.endTime);
  const now = new Date();
  const isLive = now >= start && now <= end;
  const status = STATUS_CONFIG[c.recordingStatus] || STATUS_CONFIG.not_available;
  const StatusIcon = status.icon;

  const formatTime = (d) => d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const duration = Math.round((end - start) / 60000);

  return (
    <div className={`bg-white rounded-xl p-4 border shadow-sm transition-all ${isLive ? 'border-green-300 ring-1 ring-green-100' : 'border-gray-100'}`}
      data-testid={`class-card-${c.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isLive && <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-bold border border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE</span>}
            <h4 className="text-sm font-semibold text-[#1a1625] truncate">{c.title}</h4>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <Users size={10} /> {c.batchName}
            <span className="text-gray-200">|</span>
            {c.teacherName}
          </div>
        </div>
        {canDelete && (
          <button onClick={() => onDelete(c.id)} className="p-1 hover:bg-red-50 rounded-md transition-colors" data-testid={`delete-class-${c.id}`}>
            <Trash2 size={13} className="text-gray-300 hover:text-red-400" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-3">
        <Clock size={10} />
        <span>{formatTime(start)} - {formatTime(end)}</span>
        <span className="text-gray-200">|</span>
        <span>{duration} min</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {!isPast ? (
          <a href={c.meetLink} target="_blank" rel="noopener noreferrer" data-testid={`join-class-${c.id}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isLive ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm' : 'bg-[#6C3CF4] text-white hover:bg-[#5b2ed4]'}`}>
            <ExternalLink size={12} /> {isLive ? 'Join Now' : 'Join Class'}
          </a>
        ) : c.meetLink && (
          <a href={c.meetLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs font-medium">
            <ExternalLink size={12} /> Meet Link
          </a>
        )}

        {/* Recording status */}
        <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold ${status.color}`}>
          <StatusIcon size={11} className={c.recordingStatus === 'processing' ? 'animate-spin' : ''} />
          {c.recordingStatus === 'ready' ? (
            <a href={c.recordingUrl} target="_blank" rel="noopener noreferrer" className="hover:underline" data-testid={`watch-recording-${c.id}`}>
              Watch Recording
            </a>
          ) : plan === 'starter' && c.recordingStatus === 'not_available' ? (
            <span>Upgrade for Recording</span>
          ) : (
            <span>{status.label}</span>
          )}
        </div>

        {c.recordingStatus === 'failed' && canDelete && (
          <button onClick={() => onRetry(c.id)} data-testid={`retry-recording-${c.id}`}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-semibold hover:bg-amber-100 transition-colors">
            <RefreshCw size={10} /> Retry
          </button>
        )}
      </div>

      {/* Recording metadata */}
      {c.recordingStatus === 'ready' && (c.recordingDuration > 0 || c.recordingSize > 0) && (
        <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
          {c.recordingDuration > 0 && <span>{c.recordingDuration} min</span>}
          {c.recordingSize > 0 && <><span className="text-gray-200">|</span><span>{c.recordingSize} MB</span></>}
        </div>
      )}
    </div>
  );
}
