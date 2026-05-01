import { useState, useEffect } from 'react';
import API from '@/api';
import { ClipboardCheck, Check, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#ef4444'];

export default function MyAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/attendance').then(r => {
      setAttendance(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const present = attendance.filter(a => a.status === 'present').length;
  const absent = attendance.filter(a => a.status === 'absent').length;
  const total = attendance.length;
  const rate = total > 0 ? Math.round(present / total * 1000) / 10 : 0;

  const pieData = [
    { name: 'Present', value: present },
    { name: 'Absent', value: absent },
  ];

  // Group by date, most recent first
  const byDate = {};
  attendance.forEach(a => {
    if (!byDate[a.date]) byDate[a.date] = [];
    byDate[a.date].push(a);
  });
  const sortedDates = Object.keys(byDate).sort().reverse();

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-[3px] border-[#6C3CF4] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div data-testid="my-attendance-page">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#1a1625]">My Attendance</h1>
        <p className="text-xs text-gray-400 mt-0.5">Your attendance record</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1a1625] mb-2">Overall Summary</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center -mt-1">
            <p className="text-2xl font-bold text-[#1a1625]">{rate}%</p>
            <p className="text-[10px] text-gray-400">Attendance Rate</p>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-2"><Check size={20} className="text-green-600" /></div>
            <p className="text-2xl font-bold text-[#1a1625]">{present}</p>
            <p className="text-[10px] text-gray-400">Present</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-2"><X size={20} className="text-red-500" /></div>
            <p className="text-2xl font-bold text-[#1a1625]">{absent}</p>
            <p className="text-[10px] text-gray-400">Absent</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-2"><ClipboardCheck size={20} className="text-blue-600" /></div>
            <p className="text-2xl font-bold text-[#1a1625]">{total}</p>
            <p className="text-[10px] text-gray-400">Total Classes</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#1a1625]">Attendance History</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {sortedDates.map(date => (
            <div key={date} className="flex items-center justify-between px-4 py-2.5" data-testid={`att-date-${date}`}>
              <div>
                <p className="text-xs font-medium text-[#1a1625]">
                  {new Date(date + 'T00:00:00').toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${byDate[date][0].status === 'present' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-500 border border-red-200'}`}>
                {byDate[date][0].status === 'present' ? 'Present' : 'Absent'}
              </span>
            </div>
          ))}
          {!sortedDates.length && (
            <div className="px-4 py-12 text-center">
              <ClipboardCheck size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No attendance records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
