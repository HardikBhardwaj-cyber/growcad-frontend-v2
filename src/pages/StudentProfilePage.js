import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '@/api';
import { ArrowLeft, GraduationCap, ClipboardCheck, CreditCard, FileText, Send } from 'lucide-react';

const GLASS_CARD = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 18,
  boxShadow: '0 4px 18px rgba(0,0,0,0.22)',
};

const MUTED = 'rgba(255,255,255,0.45)';
const SECONDARY = 'rgba(255,255,255,0.65)';
const PRIMARY = 'rgba(255,255,255,0.92)';

function money(n = 0) {
  return `Rs.${Number(n || 0).toLocaleString('en-IN')}`;
}

function statusStyle(status) {
  if (status === 'paid') {
    return {
      background: 'rgba(16,185,129,0.14)',
      border: '1px solid rgba(52,211,153,0.25)',
      color: '#34d399',
    };
  }
  if (status === 'partial') {
    return {
      background: 'rgba(245,158,11,0.14)',
      border: '1px solid rgba(251,191,36,0.25)',
      color: '#fbbf24',
    };
  }
  return {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(248,113,113,0.22)',
    color: '#f87171',
  };
}

function scoreStyle(score) {
  if (score >= 80) {
    return {
      background: 'rgba(16,185,129,0.14)',
      border: '1px solid rgba(52,211,153,0.25)',
      color: '#34d399',
    };
  }
  if (score >= 60) {
    return {
      background: 'rgba(245,158,11,0.14)',
      border: '1px solid rgba(251,191,36,0.25)',
      color: '#fbbf24',
    };
  }
  return {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(248,113,113,0.22)',
    color: '#f87171',
  };
}

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
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-9 h-9 rounded-full animate-spin"
          style={{ border: '3px solid rgba(108,60,244,0.22)', borderTopColor: '#8b5cf6' }}
        />
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>
          Loading profile
        </p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-[55vh] flex items-center justify-center">
      <div className="text-center px-6 py-8" style={GLASS_CARD}>
        <GraduationCap size={28} className="mx-auto mb-3 text-violet-300" />
        <h2 className="text-lg font-bold" style={{ color: PRIMARY }}>Student not found</h2>
        <p className="text-sm mt-1" style={{ color: MUTED }}>This profile may have been removed.</p>
      </div>
    </div>
  );

  const { student, batch, attendance, fees, tests } = data;

  return (
    <div data-testid="student-profile-page" className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          to="/students"
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
          style={{ ...GLASS_CARD, borderRadius: 12, color: '#c4b5fd' }}
          data-testid="profile-back"
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(108,60,244,0.18)';
            e.currentTarget.style.borderColor = 'rgba(167,139,250,0.32)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = GLASS_CARD.background;
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
          }}
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-[1.55rem] font-bold tracking-tight truncate" style={{ color: PRIMARY }}>{student.name}</h1>
          <p className="text-xs mt-1 truncate" style={{ color: MUTED }}>
            {batch?.batchName || 'No batch assigned'} <span className="text-white/20 px-1.5">|</span> {student.email || 'No email'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={ClipboardCheck} label="Attendance" value={`${attendance.rate}%`} sub={`${attendance.present}P / ${attendance.late || 0}L / ${attendance.absent}A`} color="#8b5cf6" />
        <StatCard icon={CreditCard} label="Fee Paid" value={`Rs.${(fees.totalPaid / 1000).toFixed(0)}K`} sub={`of Rs.${(fees.totalFee / 1000).toFixed(0)}K`} color="#10b981" />
        <StatCard icon={CreditCard} label="Fee Pending" value={`Rs.${(fees.totalPending / 1000).toFixed(0)}K`} sub="outstanding" color="#ef4444" />
        <StatCard icon={FileText} label="Tests Taken" value={tests.length} sub={tests.length ? `Avg ${(tests.reduce((s, t) => s + t.percentage, 0) / tests.length).toFixed(1)}%` : 'No tests'} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5" style={GLASS_CARD} data-testid="profile-info">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(108,60,244,0.16)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.22)' }}>
                <GraduationCap size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: PRIMARY }}>Student Information</h3>
                <p className="text-[11px]" style={{ color: MUTED }}>Contact and admission details</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[['Phone', student.phoneNumber], ['Parent Phone', student.parentPhoneNumber], ['Batch', batch?.batchName], ['Admission', student.admissionDate]].map(([l, v]) => (
              <InfoItem key={l} label={l} value={v || '-'} />
            ))}
          </div>

          {fees.totalPending > 0 && (
            <button
              data-testid="profile-send-reminder"
              onClick={sendReminder}
              disabled={sending || sent}
              className="mt-5 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-70"
              style={sent
                ? { background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }
                : { background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)', boxShadow: '0 4px 18px rgba(108,60,244,0.34)', color: '#fff' }}
            >
              {sending ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : sent ? (
                'Reminder Sent'
              ) : (
                <><Send size={13} /> Send Fee Reminder</>
              )}
            </button>
          )}
        </div>

        <div className="p-5" style={GLASS_CARD} data-testid="profile-fees">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.13)', color: '#34d399', border: '1px solid rgba(52,211,153,0.22)' }}>
              <CreditCard size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: PRIMARY }}>Fee Installments</h3>
              <p className="text-[11px]" style={{ color: MUTED }}>{money(fees.totalPending)} pending</p>
            </div>
          </div>

          {fees.records?.length > 0 ? (
            <div
              className="space-y-2 max-h-52 overflow-y-auto pr-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(108,60,244,0.36) transparent' }}
            >
              {fees.records[0]?.installments?.map((inst, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: inst.status === 'paid' ? 'rgba(16,185,129,0.045)' : 'rgba(255,255,255,0.045)',
                    border: inst.status === 'paid' ? '1px solid rgba(52,211,153,0.15)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>Installment {i + 1}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: PRIMARY }}>{money(inst.amount)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-1 rounded-full font-bold capitalize" style={statusStyle(inst.status)}>
                      {inst.status}
                    </span>
                    <p className="text-[10px] mt-1.5" style={{ color: MUTED }}>{inst.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs" style={{ color: MUTED }}>No fee records</p>
          )}
        </div>
      </div>

      {tests.length > 0 && (
        <div style={GLASS_CARD} className="overflow-hidden" data-testid="profile-tests">
          <div className="px-4 py-4 border-b border-white/[0.08] flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.13)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.22)' }}>
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: PRIMARY }}>Test Results</h3>
              <p className="text-[11px]" style={{ color: MUTED }}>{tests.length} recorded tests</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.035)' }}>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>Test</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>Subject</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>Marks</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>%</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/[0.06] transition-colors hover:bg-violet-500/[0.08]"
                  >
                    <td className="px-4 py-3 text-xs font-bold" style={{ color: PRIMARY }}>{t.testName}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(108,60,244,0.15)', border: '1px solid rgba(167,139,250,0.22)', color: '#c4b5fd' }}>
                        {t.subject || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: SECONDARY }}>{t.marksObtained}/{t.maximumMarks}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={scoreStyle(t.percentage)}>
                        {t.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{t.testDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>{label}</p>
      <p className="text-xs font-bold mt-1 truncate" style={{ color: PRIMARY }}>{value}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="p-4 transition-all hover:-translate-y-0.5" style={GLASS_CARD}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}1f`, border: `1px solid ${color}35`, color }}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: PRIMARY }}>{value}</p>
      <p className="text-[10px] mt-1" style={{ color: SECONDARY }}>{sub}</p>
    </div>
  );
}
