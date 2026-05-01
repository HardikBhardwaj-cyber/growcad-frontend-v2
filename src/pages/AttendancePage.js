import { useState, useEffect } from 'react';
import API from '@/api';
import { ClipboardCheck, Check, X as XIcon, Clock, Save } from 'lucide-react';

export default function AttendancePage() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [existingAtt, setExistingAtt] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { API.get('/batches').then(r => setBatches(r.data)); }, []);

  useEffect(() => {
    if (!selectedBatch) { setStudents([]); return; }
    API.get('/students', { params: { batchId: selectedBatch } }).then(r => {
      setStudents(r.data);
      const defaults = {};
      r.data.forEach(s => { defaults[s.id] = 'present'; });
      setAttendance(defaults);
    });
  }, [selectedBatch]);

  useEffect(() => {
    if (!selectedBatch || !date) return;
    API.get('/attendance', { params: { batchId: selectedBatch, date } }).then(r => {
      setExistingAtt(r.data);
      const map = {};
      r.data.forEach(a => { map[a.studentId] = a.status; });
      setAttendance(prev => ({ ...prev, ...map }));
    });
  }, [selectedBatch, date]);

  const toggleStatus = (sid) => {
    setAttendance(prev => {
      const curr = prev[sid];
      const next = curr === 'present' ? 'late' : curr === 'late' ? 'absent' : 'present';
      return { ...prev, [sid]: next };
    });
    setSaved(false);
  };

  const markAll = (status) => {
    const map = {};
    students.forEach(s => { map[s.id] = status; });
    setAttendance(map);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const records = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
    await API.post('/attendance/mark', { batchId: selectedBatch, date, records });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const lateCount = Object.values(attendance).filter(v => v === 'late').length;
  const absentCount = Object.values(attendance).filter(v => v === 'absent').length;

  return (
    <div data-testid="attendance-page">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#1a1625]">Attendance</h1>
        <p className="text-xs text-gray-400 mt-0.5">Mark daily attendance for batches</p>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            data-testid="attendance-batch-select"
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none flex-1"
          >
            <option value="">Select Batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
          </select>
          <input
            data-testid="attendance-date-input"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none"
          />
        </div>
      </div>

      {selectedBatch && students.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-3 text-xs">
              <span className="text-green-600 font-medium">Present: {presentCount}</span>
              <span className="text-amber-600 font-medium">Late: {lateCount}</span>
              <span className="text-red-500 font-medium">Absent: {absentCount}</span>
              <span className="text-gray-400">Total: {students.length}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => markAll('present')} data-testid="mark-all-present" className="text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-colors">All Present</button>
              <button onClick={() => markAll('late')} data-testid="mark-all-late" className="text-xs px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg font-medium hover:bg-amber-100 transition-colors">All Late</button>
              <button onClick={() => markAll('absent')} data-testid="mark-all-absent" className="text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg font-medium hover:bg-red-100 transition-colors">All Absent</button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
            <table className="w-full" data-testid="attendance-table">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-12">#</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-32">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id} className="border-b border-gray-50" data-testid={`attendance-row-${s.id}`}>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#6C3CF4]/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-[#6C3CF4]">{s.name?.charAt(0)}</span>
                        </div>
                        <span className="text-xs font-medium text-[#1a1625]">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => toggleStatus(s.id)}
                        data-testid={`toggle-attendance-${s.id}`}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          attendance[s.id] === 'present'
                            ? 'bg-green-50 text-green-600 border border-green-200'
                            : attendance[s.id] === 'late'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-red-50 text-red-500 border border-red-200'
                        }`}
                      >
                        {attendance[s.id] === 'present' ? <Check size={12} /> : attendance[s.id] === 'late' ? <Clock size={12} /> : <XIcon size={12} />}
                        {attendance[s.id] === 'present' ? 'Present' : attendance[s.id] === 'late' ? 'Late' : 'Absent'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            data-testid="save-attendance-button"
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-[#6C3CF4] hover:bg-[#5b2ed4] text-white shadow-[#6C3CF4]/20'
            }`}
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : saved ? (
              <><Check size={16} /> Saved!</>
            ) : (
              <><Save size={16} /> Save Attendance</>
            )}
          </button>
        </>
      )}

      {selectedBatch && !students.length && (
        <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
          <ClipboardCheck size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No students in this batch</p>
        </div>
      )}

      {!selectedBatch && (
        <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
          <ClipboardCheck size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Select a batch to mark attendance</p>
        </div>
      )}
    </div>
  );
}
