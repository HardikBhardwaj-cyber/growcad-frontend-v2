import { useState, useEffect } from 'react';
import API from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, IndianRupee, ClipboardCheck, CreditCard, Calendar, Bell, BookOpen, FileText, AlertCircle, BellRing, Send, Video, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['#6C3CF4', '#e8e4f3'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="dashboard-loading">
        <div className="w-8 h-8 border-[3px] border-[#6C3CF4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return <div className="text-gray-400 text-center py-20">Failed to load dashboard</div>;

  const role = stats.role || user?.role || 'admin';

  if (role === 'student') return <StudentDashboard stats={stats} />;
  if (role === 'teacher') return <TeacherDashboard stats={stats} />;
  return <AdminDashboard stats={stats} />;
}

// ─── ADMIN DASHBOARD ───
function AdminDashboard({ stats }) {
  const revenueData = Object.entries(stats.monthlyFees || {})
    .sort()
    .slice(-6)
    .map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleDateString('en', { month: 'short' }),
      collected: Math.round(amount),
    }));

  const attendanceData = [
    { name: 'Present', value: stats.attendanceRate || 0 },
    { name: 'Absent', value: Math.round((100 - (stats.attendanceRate || 0)) * 10) / 10 },
  ];

  const metricCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: GraduationCap, color: '#6C3CF4' },
    { label: 'Total Batches', value: stats.totalBatches || 0, icon: BookOpen, color: '#3b82f6' },
    { label: 'Revenue Collected', value: `Rs.${(stats.monthlyRevenue / 1000).toFixed(0)}K`, icon: IndianRupee, color: '#10b981' },
    { label: "Today's Attendance", value: `${stats.todayAttendanceRate || 0}%`, icon: ClipboardCheck, color: '#f59e0b' },
  ];

  return (
    <div data-testid="admin-dashboard">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a1625]">Admin Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Complete overview of your institute</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metricCards.map((card, i) => (
          <div key={i} data-testid={`stat-card-${i}`} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">{card.label}</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.color + '12' }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1a1625]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="revenue-chart">
          <h3 className="text-sm font-semibold text-[#1a1625] mb-1">Revenue Overview</h3>
          <p className="text-xs text-gray-400 mb-4">Monthly fee collection</p>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0eef5" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#8b85a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8b85a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e8e4f3', fontSize: '12px' }} formatter={(val) => [`Rs.${val.toLocaleString()}`, 'Collected']} />
                <Bar dataKey="collected" fill="#6C3CF4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">No revenue data yet</div>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="attendance-chart">
          <h3 className="text-sm font-semibold text-[#1a1625] mb-1">Attendance Rate</h3>
          <p className="text-xs text-gray-400 mb-2">Overall attendance</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0}>
                {attendanceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 -mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#6C3CF4]" />
              <span className="text-xs text-gray-500">Present {stats.attendanceRate}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#e8e4f3]" />
              <span className="text-xs text-gray-500">Absent {(100 - stats.attendanceRate).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="quick-actions">
          <h3 className="text-sm font-semibold text-[#1a1625] mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Mark Attendance', path: '/attendance', icon: ClipboardCheck },
              { label: 'Send Reminder', path: '/settings', icon: Bell },
              { label: 'Add Student', path: '/students', icon: GraduationCap },
              { label: 'Announcements', path: '/announcements', icon: FileText },
              { label: 'Communication', path: '/communication', icon: Users },
              { label: 'Collect Fees', path: '/fees', icon: CreditCard },
            ].map((a, i) => (
              <Link key={i} to={a.path} data-testid={`quick-action-${i}`} className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-100 hover:border-[#6C3CF4]/30 hover:bg-[#6C3CF4]/[0.03] transition-all text-center">
                <a.icon size={18} className="text-[#6C3CF4]" />
                <span className="text-[11px] font-medium text-gray-600">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="today-classes">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1a1625]">Today's Classes</h3>
            <BookOpen size={16} className="text-gray-400" />
          </div>
          {stats.todayClasses?.length > 0 ? stats.todayClasses.map((c, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-[#6C3CF4]/10 flex items-center justify-center shrink-0">
                <Calendar size={14} className="text-[#6C3CF4]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1a1625] truncate">{c.batchName}</p>
                <p className="text-[10px] text-gray-400">{c.classDuration} | {c.subject}</p>
              </div>
            </div>
          )) : <p className="text-xs text-gray-400 py-4 text-center">No classes scheduled today</p>}
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="recent-notifications">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1a1625]">Notifications</h3>
            <Bell size={16} className="text-gray-400" />
          </div>
          {stats.notifications?.length > 0 ? stats.notifications.map((n, i) => (
            <div key={i} className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0">
              <div className="w-6 h-6 rounded-full bg-[#6C3CF4]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bell size={11} className="text-[#6C3CF4]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#1a1625] truncate">{n.title}</p>
                <p className="text-[10px] text-gray-400 truncate">{n.message}</p>
              </div>
            </div>
          )) : <p className="text-xs text-gray-400 py-4 text-center">No notifications</p>}
        </div>
      </div>

      <PendingRemindersWidget />
      <UpcomingClassesWidget />

      {/* Announcements */}
      {stats.announcements?.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mt-6" data-testid="dashboard-announcements">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1a1625]">Latest Announcements</h3>
            <Link to="/announcements" className="text-[10px] text-[#6C3CF4] font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {stats.announcements.slice(0, 5).map((ann, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-[#1a1625]">{ann.title}</p>
                  {ann.targetBatchName && <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">{ann.targetBatchName}</span>}
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{ann.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{ann.createdAt?.slice(0, 10)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TEACHER DASHBOARD ───
function TeacherDashboard({ stats }) {
  return (
    <div data-testid="teacher-dashboard">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1a1625]">Teacher Dashboard</h1>
        <p className="text-xs text-gray-400 mt-0.5">Your classes and students overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'My Batches', value: stats.totalBatches || 0, icon: BookOpen, color: '#6C3CF4' },
          { label: 'My Students', value: stats.totalStudents || 0, icon: GraduationCap, color: '#3b82f6' },
          { label: 'Attendance Rate', value: `${stats.attendanceRate || 0}%`, icon: ClipboardCheck, color: '#10b981' },
        ].map((card, i) => (
          <div key={i} data-testid={`teacher-stat-${i}`} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">{card.label}</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.color + '12' }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1a1625]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="teacher-batches">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1a1625]">My Batches</h3>
            <Link to="/batches" className="text-xs text-[#6C3CF4] font-medium hover:underline">View All</Link>
          </div>
          {stats.myBatches?.map((b, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <div className="w-9 h-9 rounded-lg bg-[#6C3CF4]/10 flex items-center justify-center shrink-0">
                <BookOpen size={15} className="text-[#6C3CF4]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1a1625]">{b.batchName}</p>
                <p className="text-[10px] text-gray-400">{b.subject} | {b.studentCount || 0} students</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {(b.scheduleDays || []).slice(0, 3).map(d => (
                  <span key={d} className="text-[8px] px-1 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">{d.slice(0, 3)}</span>
                ))}
              </div>
            </div>
          ))}
          {!stats.myBatches?.length && <p className="text-xs text-gray-400 py-4 text-center">No batches assigned</p>}
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="teacher-today-classes">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1a1625]">Today's Classes</h3>
            <Calendar size={16} className="text-gray-400" />
          </div>
          {stats.todayClasses?.length > 0 ? stats.todayClasses.map((c, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <Calendar size={15} className="text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1a1625]">{c.batchName}</p>
                <p className="text-[10px] text-gray-400">{c.classDuration} | {c.subject}</p>
              </div>
            </div>
          )) : (
            <p className="text-xs text-gray-400 py-4 text-center">No classes scheduled today</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="teacher-quick-actions">
          <h3 className="text-sm font-semibold text-[#1a1625] mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Mark Attendance', path: '/attendance', icon: ClipboardCheck },
              { label: 'Create Test', path: '/tests', icon: FileText },
              { label: 'View Students', path: '/students', icon: GraduationCap },
              { label: 'My Batches', path: '/batches', icon: BookOpen },
            ].map((a, i) => (
              <Link key={i} to={a.path} className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-center">
                <a.icon size={18} className="text-blue-500" />
                <span className="text-[11px] font-medium text-gray-600">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="teacher-recent-tests">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1a1625]">Recent Tests</h3>
            <Link to="/tests" className="text-xs text-[#6C3CF4] font-medium hover:underline">View All</Link>
          </div>
          {stats.recentTests?.length > 0 ? stats.recentTests.map((t, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <FileText size={14} className="text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#1a1625] truncate">{t.testName}</p>
                <p className="text-[10px] text-gray-400">{t.batchName} | {t.testDate}</p>
              </div>
            </div>
          )) : <p className="text-xs text-gray-400 py-4 text-center">No tests yet</p>}
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT DASHBOARD ───
function StudentDashboard({ stats }) {
  const attData = stats.attendanceSummary || {};
  const feeData = stats.feeSummary || {};
  const pieData = [
    { name: 'Present', value: attData.rate || 0 },
    { name: 'Absent', value: Math.round((100 - (attData.rate || 0)) * 10) / 10 },
  ];

  return (
    <div data-testid="student-dashboard">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1a1625]">
          Welcome, {stats.student?.name || 'Student'}
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {stats.batch?.batchName || 'Your'} dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Attendance Rate', value: `${attData.rate || 0}%`, icon: ClipboardCheck, color: attData.rate >= 75 ? '#10b981' : '#ef4444' },
          { label: 'Classes Attended', value: `${attData.present || 0}/${attData.total || 0}`, icon: Calendar, color: '#3b82f6' },
          { label: 'Fee Paid', value: `Rs.${((feeData.totalPaid || 0) / 1000).toFixed(0)}K`, icon: CreditCard, color: '#10b981' },
          { label: 'Fee Pending', value: `Rs.${((feeData.totalPending || 0) / 1000).toFixed(0)}K`, icon: AlertCircle, color: feeData.totalPending > 0 ? '#ef4444' : '#10b981' },
        ].map((card, i) => (
          <div key={i} data-testid={`student-stat-${i}`} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">{card.label}</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.color + '12' }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1a1625]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="student-attendance-chart">
          <h3 className="text-sm font-semibold text-[#1a1625] mb-2">My Attendance</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">
            <span className="text-[10px] text-gray-500"><span className="inline-block w-2 h-2 rounded-full bg-[#6C3CF4] mr-1" />Present: {attData.present || 0}</span>
            <span className="text-[10px] text-gray-500"><span className="inline-block w-2 h-2 rounded-full bg-[#e8e4f3] mr-1" />Absent: {attData.absent || 0}</span>
          </div>
          <Link to="/my-attendance" className="block text-center text-xs text-[#6C3CF4] font-medium mt-3 hover:underline">View Details</Link>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="student-fee-status">
          <h3 className="text-sm font-semibold text-[#1a1625] mb-4">Fee Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Total Fee</span>
              <span className="font-semibold text-[#1a1625]">Rs.{(feeData.totalFee || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Paid</span>
              <span className="font-semibold text-green-600">Rs.{(feeData.totalPaid || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Pending</span>
              <span className="font-semibold text-red-500">Rs.{(feeData.totalPending || 0).toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${feeData.totalFee ? (feeData.totalPaid / feeData.totalFee * 100) : 0}%` }} />
            </div>
            {feeData.nextDue && (
              <div className="p-2.5 bg-red-50 rounded-lg border border-red-100 mt-2">
                <p className="text-[10px] text-red-500 font-semibold">Next Due: Rs.{feeData.nextDue.amount?.toLocaleString()} by {feeData.nextDue.dueDate}</p>
              </div>
            )}
          </div>
          <Link to="/my-fees" className="block text-center text-xs text-[#6C3CF4] font-medium mt-3 hover:underline">View Details</Link>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="student-notifications">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1a1625]">Notifications</h3>
            <Bell size={16} className="text-gray-400" />
          </div>
          {stats.notifications?.length > 0 ? stats.notifications.map((n, i) => (
            <div key={i} className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0">
              <div className="w-6 h-6 rounded-full bg-[#6C3CF4]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bell size={11} className="text-[#6C3CF4]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#1a1625] truncate">{n.title}</p>
                <p className="text-[10px] text-gray-400 truncate">{n.message}</p>
              </div>
            </div>
          )) : <p className="text-xs text-gray-400 py-4 text-center">No notifications</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="student-test-results">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#1a1625]">Recent Test Results</h3>
          <Link to="/my-tests" className="text-xs text-[#6C3CF4] font-medium hover:underline">View All</Link>
        </div>
        {stats.testResults?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase">Test</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase">Subject</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase">Marks</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase">%</th>
                </tr>
              </thead>
              <tbody>
                {stats.testResults.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-3 py-2 text-xs font-medium text-[#1a1625]">{r.testName}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{r.subject}</td>
                    <td className="px-3 py-2 text-xs font-medium text-gray-700">{r.marksObtained}/{r.maximumMarks}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${r.percentage >= 80 ? 'bg-green-50 text-green-600' : r.percentage >= 50 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'}`}>
                        {r.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-xs text-gray-400 py-4 text-center">No test results yet</p>}
      </div>

      {/* Student Announcements */}
      {stats.announcements?.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mt-4" data-testid="student-announcements">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1a1625]">Announcements</h3>
            <Link to="/announcements" className="text-[10px] text-[#6C3CF4] font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {stats.announcements.slice(0, 5).map((ann, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs font-semibold text-[#1a1625]">{ann.title}</p>
                <p className="text-[11px] text-gray-500 mt-1">{ann.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{ann.createdAt?.slice(0, 10)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ─── PENDING REMINDERS WIDGET ───
function PendingRemindersWidget() {
  const [data, setData] = useState(null);
  const [sending, setSending] = useState({});

  useEffect(() => {
    API.get('/dashboard/pending-reminders').then(r => setData(r.data)).catch(() => {});
  }, []);

  const sendReminder = async (item) => {
    setSending(p => ({ ...p, [item.studentId + item.dueDate]: true }));
    try {
      await API.post('/reminders/send-now', {
        studentId: item.studentId, amount: item.amount,
        dueDate: item.dueDate, type: item.type
      });
      setSending(p => ({ ...p, [item.studentId + item.dueDate]: 'done' }));
    } catch {
      setSending(p => ({ ...p, [item.studentId + item.dueDate]: 'error' }));
    }
  };

  if (!data || (data.totalUpcoming === 0 && data.totalOverdue === 0)) return null;

  const items = [...(data.upcoming || []), ...(data.overdue || [])].slice(0, 8);

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mt-6" data-testid="pending-reminders-widget">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BellRing size={16} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-[#1a1625]">Pending Fee Reminders</h3>
        </div>
        <div className="flex items-center gap-2">
          {data.totalOverdue > 0 && (
            <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-500 rounded-full font-semibold">{data.totalOverdue} overdue</span>
          )}
          {data.totalUpcoming > 0 && (
            <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-semibold">{data.totalUpcoming} upcoming</span>
          )}
          <Link to="/settings" className="text-[10px] text-[#6C3CF4] font-medium hover:underline">Settings</Link>
        </div>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => {
          const key = item.studentId + item.dueDate;
          const sendState = sending[key];
          return (
            <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border ${item.type === 'overdue' ? 'border-red-100 bg-red-50/30' : 'border-amber-100 bg-amber-50/30'}`}
              data-testid={`reminder-item-${i}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === 'overdue' ? 'bg-red-100' : 'bg-amber-100'}`}>
                <AlertCircle size={14} className={item.type === 'overdue' ? 'text-red-500' : 'text-amber-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1a1625]">{item.studentName}</p>
                <p className="text-[10px] text-gray-400">
                  Rs.{item.amount?.toLocaleString()} | Due: {item.dueDate}
                  {item.type === 'overdue' && <span className="text-red-500 font-medium ml-1">OVERDUE</span>}
                </p>
              </div>
              <button
                data-testid={`send-reminder-${i}`}
                onClick={() => sendReminder(item)}
                disabled={sendState === true || sendState === 'done'}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition-all shrink-0 ${
                  sendState === 'done' ? 'bg-green-100 text-green-600' :
                  sendState === 'error' ? 'bg-red-100 text-red-500' :
                  'bg-[#6C3CF4] text-white hover:bg-[#5b2ed4]'} disabled:opacity-60`}
              >
                {sendState === true ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /></> :
                 sendState === 'done' ? 'Sent' :
                 sendState === 'error' ? 'Failed' :
                 <><Send size={10} /> Remind</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ─── UPCOMING CLASSES WIDGET ───
function UpcomingClassesWidget() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    API.get('/dashboard/upcoming-classes').then(r => setClasses(r.data)).catch(() => {});
  }, []);

  if (!classes.length) return null;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mt-6" data-testid="upcoming-classes-widget">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Video size={16} className="text-[#6C3CF4]" />
          <h3 className="text-sm font-semibold text-[#1a1625]">Upcoming Live Classes</h3>
        </div>
        <Link to="/live-classes" className="text-[10px] text-[#6C3CF4] font-medium hover:underline">View All</Link>
      </div>
      <div className="space-y-2">
        {classes.slice(0, 3).map(c => {
          const start = new Date(c.startTime);
          const now = new Date();
          const isLive = now >= start && now <= new Date(c.endTime);
          return (
            <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg border ${isLive ? 'bg-green-50/50 border-green-200' : 'bg-gray-50 border-gray-100'}`}
              data-testid={`upcoming-class-${c.id}`}>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  {isLive && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                  <p className="text-xs font-semibold text-[#1a1625] truncate">{c.title}</p>
                </div>
                <p className="text-[10px] text-gray-400">{c.batchName} | {start.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <a href={c.meetLink} target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold shrink-0 ${isLive ? 'bg-green-500 text-white' : 'bg-[#6C3CF4] text-white'}`}
                data-testid={`join-upcoming-${c.id}`}>
                <ExternalLink size={10} /> {isLive ? 'Join Now' : 'Join'}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
