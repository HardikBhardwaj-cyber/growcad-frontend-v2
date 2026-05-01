import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '@/api';
import { ArrowLeft, GraduationCap, ClipboardCheck, CreditCard, FileText, Clock, Send } from 'lucide-react';

export default function StudentProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    API.get(`/students/${id}/profile`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [id]);

  const sendReminder = async () => {
    if (!data?.fees?.records?.length) return;
    setSending(true);
    const fee = data.fees.records[0];
    const pending = fee.installments?.find(i => i.status !== 'paid');
    if (pending) {
      await API.post('/reminders/send-now', { studentId: id, amount: pending.amount, dueDate: pending.dueDate, type: 'manual' });
    }
    setSending(false); setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64" data-testid="profile-loading">
      <div className="w-8 h-8 border-[3px] border-[#6C3CF4] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return <div className="text-center py-20 text-gray-400">Student not found</div>;
  const { student, batch, attendance, fees, tests } = data;

  return (
    <div data-testid="student-profile-page">
      <div className="flex items-center gap-3 mb-5">
        <Link to="/students" className="p-1.5 hover:bg-gray-100 rounded-lg" data-testid="profile-back"><ArrowLeft size={18} className="text-gray-500" /></Link>
        <div>
          <h1 className="text-xl font-bold text-[#1a1625]">{student.name}</h1>
          <p className="text-xs text-gray-400">{batch?.batchName || 'No batch assigned'} | {student.email || 'No email'}</p>
        </div>
      </div>

      {/* Info + Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard icon={ClipboardCheck} label="Attendance" value={`${attendance.rate}%`} sub={`${attendance.present}P / ${attendance.late || 0}L / ${attendance.absent}A`} color="#6C3CF4" />
        <StatCard icon={CreditCard} label="Fee Paid" value={`Rs.${(fees.totalPaid / 1000).toFixed(0)}K`} sub={`of Rs.${(fees.totalFee / 1000).toFixed(0)}K`} color="#10b981" />
        <StatCard icon={CreditCard} label="Fee Pending" value={`Rs.${(fees.totalPending / 1000).toFixed(0)}K`} sub="outstanding" color="#ef4444" />
        <StatCard icon={FileText} label="Tests Taken" value={tests.length} sub={tests.length ? `Avg ${(tests.reduce((s, t) => s + t.percentage, 0) / tests.length).toFixed(1)}%` : 'No tests'} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Student Info */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="profile-info">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap size={16} className="text-[#6C3CF4]" />
            <h3 className="text-sm font-semibold text-[#1a1625]">Student Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['Phone', student.phoneNumber], ['Parent Phone', student.parentPhoneNumber], ['Batch', batch?.batchName], ['Admission', student.admissionDate]].map(([l, v]) => (
              <div key={l}><p className="text-[10px] text-gray-400 font-medium">{l}</p><p className="text-xs font-medium text-[#1a1625]">{v || '-'}</p></div>
            ))}
          </div>
          {fees.totalPending > 0 && (
            <button data-testid="profile-send-reminder" onClick={sendReminder} disabled={sending || sent}
              className={`mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sent ? 'bg-green-100 text-green-600' : 'bg-[#6C3CF4] text-white hover:bg-[#5b2ed4]'} disabled:opacity-60`}>
              {sending ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : sent ? 'Reminder Sent' : <><Send size={12} /> Send Fee Reminder</>}
            </button>
          )}
        </div>

        {/* Fee Installments */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="profile-fees">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-green-500" />
            <h3 className="text-sm font-semibold text-[#1a1625]">Fee Installments</h3>
          </div>
          {fees.records?.length > 0 ? (
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {fees.records[0]?.installments?.map((inst, i) => (
                <div key={i} className={`flex items-center justify-between p-2 rounded-lg border ${inst.status === 'paid' ? 'bg-green-50/50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div>
                    <p className="text-[10px] text-gray-400">Installment {i + 1}</p>
                    <p className="text-xs font-medium text-[#1a1625]">Rs.{inst.amount?.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${inst.status === 'paid' ? 'bg-green-100 text-green-600' : inst.status === 'partial' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-50 text-red-500'}`}>{inst.status}</span>
                    <p className="text-[10px] text-gray-400 mt-0.5">{inst.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-gray-400">No fee records</p>}
        </div>
      </div>

      {/* Test Results */}
      {tests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" data-testid="profile-tests">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2"><FileText size={16} className="text-amber-500" /><h3 className="text-sm font-semibold text-[#1a1625]">Test Results</h3></div>
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Test</th>
              <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Subject</th>
              <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Marks</th>
              <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">%</th>
              <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Date</th>
            </tr></thead>
            <tbody>
              {tests.map((t, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-4 py-2 text-xs font-medium text-[#1a1625]">{t.testName}</td>
                  <td className="px-4 py-2"><span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">{t.subject}</span></td>
                  <td className="px-4 py-2 text-xs text-gray-600">{t.marksObtained}/{t.maximumMarks}</td>
                  <td className="px-4 py-2"><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${t.percentage >= 80 ? 'bg-green-50 text-green-600' : t.percentage >= 60 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'}`}>{t.percentage}%</span></td>
                  <td className="px-4 py-2 text-xs text-gray-400">{t.testDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-gray-400 font-medium">{label}</p>
        <Icon size={16} style={{ color }} />
      </div>
      <p className="text-lg font-bold text-[#1a1625]">{value}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
