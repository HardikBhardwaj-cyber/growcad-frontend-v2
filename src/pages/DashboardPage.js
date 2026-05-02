import { useState, useEffect } from 'react';
import API from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Users, IndianRupee, ClipboardCheck,
  CreditCard, Calendar, Bell, BookOpen, FileText,
  AlertCircle, BellRing, Send, Video, ExternalLink,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const PIE_COLORS = ['#6C3CF4', 'rgba(108,60,244,0.12)'];

// ─── Shared primitives ───────────────────────────────────────────────────────

const panel = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
  border:     '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  boxShadow:  '0 1px 3px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
};

function Panel({ className = '', style = {}, ...props }) {
  return (
    <div
      className={`transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] ${className}`}
      style={{ ...panel, ...style }}
      {...props}
    />
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '9.5px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.28)', fontWeight: 700 }}
      className="uppercase mb-0.5">{children}</p>
  );
}

function SectionTitle({ children }) {
  return <h3 className="text-[13px] font-semibold text-white tracking-tight">{children}</h3>;
}

function ViewAllLink({ to, label = 'View All' }) {
  return (
    <Link to={to}
      className="text-[10px] font-semibold transition-colors duration-150"
      style={{ color: '#a78bfa' }}
      onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
      onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
    >{label}</Link>
  );
}

function EmptyState({ text }) {
  return <p className="text-[11px] text-white/30 py-5 text-center">{text}</p>;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(18,15,30,0.96)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px 12px', fontSize: '11px', color: '#fff' }}>
      <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontWeight: 700 }}>{payload[0].name}: {payload[0].value?.toLocaleString?.() ?? payload[0].value}</p>
    </div>
  );
}

// ─── MetricCard ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, icon: Icon, color, testId }) {
  return (
    <Panel
      data-testid={testId}
      className="p-4 cursor-default hover:-translate-y-[2px] hover:shadow-xl"
      style={{
        ...panel,
        boxShadow: `0 1px 3px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <SectionLabel>{label}</SectionLabel>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}28`, boxShadow: `0 0 12px ${color}22` }}
        >
          <Icon size={17} style={{ color }} />
        </div>
      </div>
      <p className="text-[1.6rem] font-bold text-white leading-none tracking-tight">{value}</p>
    </Panel>
  );
}

// ─── QuickAction ─────────────────────────────────────────────────────────────

function QuickAction({ to, icon: Icon, label, iconColor = '#6C3CF4', testId, i }) {
  return (
    <Link
      key={i}
      to={to}
      data-testid={testId}
      className="flex flex-col items-center gap-2 p-3.5 rounded-2xl text-center transition-all duration-200 hover:-translate-y-[2px]"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,60,244,0.35)'; e.currentTarget.style.background = 'rgba(108,60,244,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200"
        style={{ background: `${iconColor}18`, border: `1px solid ${iconColor}22` }}>
        <Icon size={17} style={{ color: iconColor }} />
      </div>
      <span className="text-[11px] font-semibold text-white/60 leading-tight">{label}</span>
    </Link>
  );
}

// ─── ListRow ─────────────────────────────────────────────────────────────────

function ListRow({ icon: Icon, iconBg, iconColor, title, subtitle, right, divider = true }) {
  return (
    <div
      className="flex items-center gap-3 py-2.5 transition-colors duration-150 rounded-xl px-1 -mx-1 cursor-default"
      style={divider ? { borderBottom: '1px solid rgba(255,255,255,0.05)' } : {}}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: iconBg, border: `1px solid ${iconColor}28` }}>
        <Icon size={15} style={{ color: iconColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-white/85 truncate">{title}</p>
        <p className="text-[10px] text-white/35 mt-0.5">{subtitle}</p>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

// ─── NotifRow ─────────────────────────────────────────────────────────────────

function NotifRow({ n, divider }) {
  return (
    <div
      className="flex items-start gap-2.5 py-2.5 transition-colors duration-150 rounded-xl px-1 -mx-1"
      style={divider ? { borderBottom: '1px solid rgba(255,255,255,0.05)' } : {}}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: 'rgba(108,60,244,0.15)', border: '1px solid rgba(108,60,244,0.22)' }}>
        <Bell size={11} style={{ color: '#a78bfa' }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-white/80 truncate">{n.title}</p>
        <p className="text-[10px] text-white/35 truncate mt-0.5">{n.message}</p>
      </div>
    </div>
  );
}

// ─── AnnouncementCard ─────────────────────────────────────────────────────────

function AnnouncementCard({ ann }) {
  return (
    <div
      className="p-3.5 rounded-2xl transition-all duration-200"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.11)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-semibold text-white/85">{ann.title}</p>
        {ann.targetBatchName && (
          <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' }}>
            {ann.targetBatchName}
          </span>
        )}
      </div>
      <p className="text-[11px] text-white/45 leading-relaxed">{ann.message}</p>
      <p className="text-[10px] text-white/22 mt-1.5">{ann.createdAt?.slice(0, 10)}</p>
    </div>
  );
}

// ─── DayBadge ─────────────────────────────────────────────────────────────────

function DayBadge({ d }) {
  return (
    <span className="text-[8px] px-1.5 py-0.5 rounded font-bold"
      style={{ background: 'rgba(108,60,244,0.15)', color: '#a78bfa', border: '1px solid rgba(108,60,244,0.18)' }}>
      {d.slice(0, 3)}
    </span>
  );
}

// ─── ScoreBadge ──────────────────────────────────────────────────────────────

function ScoreBadge({ pct }) {
  const [bg, color] =
    pct >= 80 ? ['rgba(16,185,129,0.12)', '#34d399'] :
    pct >= 50 ? ['rgba(245,158,11,0.12)', '#fbbf24'] :
                ['rgba(239,68,68,0.12)',   '#f87171'];
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
      style={{ background: bg, color, border: `1px solid ${color}28` }}>
      {pct}%
    </span>
  );
}

// ─── Loading / Error ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user }  = useAuth();
  const [stats, setStats]   = useState(null);
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
        <div className="w-8 h-8 rounded-full animate-spin"
          style={{ border: '3px solid rgba(108,60,244,0.2)', borderTopColor: '#6C3CF4' }} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-white/30">Failed to load dashboard</p>
      </div>
    );
  }

  const role = stats.role || user?.role || 'admin';
  if (role === 'student') return <StudentDashboard stats={stats} />;
  if (role === 'teacher') return <TeacherDashboard stats={stats} />;
  return <AdminDashboard stats={stats} />;
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────

function AdminDashboard({ stats }) {
  const revenueData = Object.entries(stats.monthlyFees || {})
    .sort().slice(-6)
    .map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleDateString('en', { month: 'short' }),
      collected: Math.round(amount),
    }));

  const attendanceData = [
    { name: 'Present', value: stats.attendanceRate || 0 },
    { name: 'Absent',  value: Math.round((100 - (stats.attendanceRate || 0)) * 10) / 10 },
  ];

  const metricCards = [
    { label: 'Total Students',      value: stats.totalStudents,                                    icon: GraduationCap, color: '#6C3CF4' },
    { label: 'Total Batches',       value: stats.totalBatches || 0,                                icon: BookOpen,      color: '#3b82f6' },
    { label: 'Revenue Collected',   value: `Rs.${(stats.monthlyRevenue / 1000).toFixed(0)}K`,     icon: IndianRupee,   color: '#10b981' },
    { label: "Today's Attendance",  value: `${stats.todayAttendanceRate || 0}%`,                   icon: ClipboardCheck, color: '#f59e0b' },
  ];

  return (
    <div data-testid="admin-dashboard">
      <div className="flex items-center justify-between mb-7">
        <div>
          <SectionLabel>Overview</SectionLabel>
          <h1 className="text-[1.3rem] font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-white/35 mt-0.5">Complete overview of your institute</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricCards.map((card, i) => (
          <MetricCard key={i} {...card} testId={`stat-card-${i}`} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Revenue chart */}
        <Panel className="lg:col-span-2 p-5" data-testid="revenue-chart">
          <div className="mb-4">
            <SectionTitle>Revenue Overview</SectionTitle>
            <p className="text-[11px] text-white/35 mt-0.5">Monthly fee collection (last 6 months)</p>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} formatter={(val) => [`Rs.${val.toLocaleString()}`, 'Collected']} />
                <Bar dataKey="collected" radius={[8, 8, 0, 0]}
                  fill="url(#barGrad)"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(108,60,244,0.3))' }} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c4ff5" />
                    <stop offset="100%" stopColor="#6C3CF4" stopOpacity={0.75} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <EmptyState text="No revenue data yet" />
            </div>
          )}
        </Panel>

        {/* Attendance pie */}
        <Panel className="p-5" data-testid="attendance-chart">
          <div className="mb-2">
            <SectionTitle>Attendance Rate</SectionTitle>
            <p className="text-[11px] text-white/35 mt-0.5">Overall attendance</p>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={55} outerRadius={78} dataKey="value" strokeWidth={0}>
                {attendanceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 -mt-2">
            {[
              { label: `Present ${stats.attendanceRate}%`, color: '#6C3CF4' },
              { label: `Absent ${(100 - stats.attendanceRate).toFixed(1)}%`, color: 'rgba(108,60,244,0.25)' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[11px] text-white/45">{label}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Quick actions */}
        <Panel className="p-5" data-testid="quick-actions">
          <SectionTitle>Quick Actions</SectionTitle>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { label: 'Mark Attendance', path: '/attendance',    icon: ClipboardCheck, color: '#6C3CF4' },
              { label: 'Send Reminder',   path: '/settings',      icon: Bell,           color: '#f59e0b' },
              { label: 'Add Student',     path: '/students',      icon: GraduationCap,  color: '#10b981' },
              { label: 'Announcements',   path: '/announcements', icon: FileText,       color: '#3b82f6' },
              { label: 'Communication',   path: '/communication', icon: Users,          color: '#a855f7' },
              { label: 'Collect Fees',    path: '/fees',          icon: CreditCard,     color: '#10b981' },
            ].map((a, i) => (
              <QuickAction key={i} to={a.path} icon={a.icon} label={a.label} iconColor={a.color} testId={`quick-action-${i}`} />
            ))}
          </div>
        </Panel>

        {/* Today's classes */}
        <Panel className="p-5" data-testid="today-classes">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Today's Classes</SectionTitle>
            <BookOpen size={15} style={{ color: 'rgba(255,255,255,0.25)' }} />
          </div>
          {stats.todayClasses?.length > 0
            ? stats.todayClasses.map((c, i) => (
                <ListRow key={i}
                  icon={Calendar} iconBg="rgba(108,60,244,0.13)" iconColor="#7c4ff5"
                  title={c.batchName} subtitle={`${c.classDuration} · ${c.subject}`}
                  divider={i < stats.todayClasses.length - 1}
                />
              ))
            : <EmptyState text="No classes scheduled today" />
          }
        </Panel>

        {/* Notifications */}
        <Panel className="p-5" data-testid="recent-notifications">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Notifications</SectionTitle>
            <Bell size={15} style={{ color: 'rgba(255,255,255,0.25)' }} />
          </div>
          {stats.notifications?.length > 0
            ? stats.notifications.map((n, i) => (
                <NotifRow key={i} n={n} divider={i < stats.notifications.length - 1} />
              ))
            : <EmptyState text="No notifications" />
          }
        </Panel>
      </div>

      <PendingRemindersWidget />
      <UpcomingClassesWidget />

      {/* Announcements */}
      {stats.announcements?.length > 0 && (
        <Panel className="p-5 mt-5" data-testid="dashboard-announcements">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Latest Announcements</SectionTitle>
            <ViewAllLink to="/announcements" />
          </div>
          <div className="space-y-2">
            {stats.announcements.slice(0, 5).map((ann, i) => (
              <AnnouncementCard key={i} ann={ann} />
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

// ─── TEACHER DASHBOARD ───────────────────────────────────────────────────────

function TeacherDashboard({ stats }) {
  return (
    <div data-testid="teacher-dashboard">
      <div className="mb-7">
        <SectionLabel>Overview</SectionLabel>
        <h1 className="text-[1.3rem] font-bold text-white tracking-tight">Teacher Dashboard</h1>
        <p className="text-xs text-white/35 mt-0.5">Your classes and students overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'My Batches',      value: stats.totalBatches || 0,       icon: BookOpen,      color: '#6C3CF4' },
          { label: 'My Students',     value: stats.totalStudents || 0,      icon: GraduationCap, color: '#3b82f6' },
          { label: 'Attendance Rate', value: `${stats.attendanceRate || 0}%`, icon: ClipboardCheck, color: '#10b981' },
        ].map((card, i) => (
          <MetricCard key={i} {...card} testId={`teacher-stat-${i}`} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* My Batches */}
        <Panel className="p-5" data-testid="teacher-batches">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>My Batches</SectionTitle>
            <ViewAllLink to="/batches" />
          </div>
          {stats.myBatches?.map((b, i) => (
            <ListRow key={i}
              icon={BookOpen} iconBg="rgba(108,60,244,0.13)" iconColor="#7c4ff5"
              title={b.batchName} subtitle={`${b.subject} · ${b.studentCount || 0} students`}
              divider={i < stats.myBatches.length - 1}
              right={
                <div className="flex flex-wrap gap-1">
                  {(b.scheduleDays || []).slice(0, 3).map(d => <DayBadge key={d} d={d} />)}
                </div>
              }
            />
          ))}
          {!stats.myBatches?.length && <EmptyState text="No batches assigned" />}
        </Panel>

        {/* Today's classes */}
        <Panel className="p-5" data-testid="teacher-today-classes">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Today's Classes</SectionTitle>
            <Calendar size={15} style={{ color: 'rgba(255,255,255,0.25)' }} />
          </div>
          {stats.todayClasses?.length > 0
            ? stats.todayClasses.map((c, i) => (
                <ListRow key={i}
                  icon={Calendar} iconBg="rgba(16,185,129,0.12)" iconColor="#34d399"
                  title={c.batchName} subtitle={`${c.classDuration} · ${c.subject}`}
                  divider={i < stats.todayClasses.length - 1}
                />
              ))
            : <EmptyState text="No classes scheduled today" />
          }
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick actions */}
        <Panel className="p-5" data-testid="teacher-quick-actions">
          <SectionTitle>Quick Actions</SectionTitle>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { label: 'Mark Attendance', path: '/attendance', icon: ClipboardCheck, color: '#6C3CF4' },
              { label: 'Create Test',     path: '/tests',      icon: FileText,       color: '#3b82f6' },
              { label: 'View Students',   path: '/students',   icon: GraduationCap,  color: '#10b981' },
              { label: 'My Batches',      path: '/batches',    icon: BookOpen,       color: '#a855f7' },
            ].map((a, i) => (
              <QuickAction key={i} to={a.path} icon={a.icon} label={a.label} iconColor={a.color} />
            ))}
          </div>
        </Panel>

        {/* Recent tests */}
        <Panel className="p-5" data-testid="teacher-recent-tests">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Recent Tests</SectionTitle>
            <ViewAllLink to="/tests" />
          </div>
          {stats.recentTests?.length > 0
            ? stats.recentTests.map((t, i) => (
                <ListRow key={i}
                  icon={FileText} iconBg="rgba(168,85,247,0.12)" iconColor="#c084fc"
                  title={t.testName} subtitle={`${t.batchName} · ${t.testDate}`}
                  divider={i < stats.recentTests.length - 1}
                />
              ))
            : <EmptyState text="No tests yet" />
          }
        </Panel>
      </div>
    </div>
  );
}

// ─── STUDENT DASHBOARD ───────────────────────────────────────────────────────

function StudentDashboard({ stats }) {
  const attData = stats.attendanceSummary || {};
  const feeData = stats.feeSummary || {};
  const pieData = [
    { name: 'Present', value: attData.rate || 0 },
    { name: 'Absent',  value: Math.round((100 - (attData.rate || 0)) * 10) / 10 },
  ];
  const feePercent = feeData.totalFee ? (feeData.totalPaid / feeData.totalFee * 100) : 0;

  return (
    <div data-testid="student-dashboard">
      <div className="mb-7">
        <SectionLabel>Student Portal</SectionLabel>
        <h1 className="text-[1.3rem] font-bold text-white tracking-tight">
          Welcome, {stats.student?.name || 'Student'}
        </h1>
        <p className="text-xs text-white/35 mt-0.5">{stats.batch?.batchName || 'Your'} dashboard</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Attendance Rate',   value: `${attData.rate || 0}%`,                                         icon: ClipboardCheck, color: attData.rate >= 75 ? '#10b981' : '#ef4444' },
          { label: 'Classes Attended',  value: `${attData.present || 0}/${attData.total || 0}`,                  icon: Calendar,      color: '#3b82f6' },
          { label: 'Fee Paid',          value: `Rs.${((feeData.totalPaid || 0) / 1000).toFixed(0)}K`,           icon: CreditCard,    color: '#10b981' },
          { label: 'Fee Pending',       value: `Rs.${((feeData.totalPending || 0) / 1000).toFixed(0)}K`,        icon: AlertCircle,   color: feeData.totalPending > 0 ? '#ef4444' : '#10b981' },
        ].map((card, i) => (
          <MetricCard key={i} {...card} testId={`student-stat-${i}`} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        {/* Attendance pie */}
        <Panel className="p-5" data-testid="student-attendance-chart">
          <SectionTitle>My Attendance</SectionTitle>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">
            {[
              { label: `Present: ${attData.present || 0}`, color: '#6C3CF4' },
              { label: `Absent: ${attData.absent || 0}`,   color: 'rgba(108,60,244,0.25)' },
            ].map(({ label, color }) => (
              <span key={label} className="text-[10px] text-white/40 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
          <Link to="/my-attendance"
            className="block text-center text-[11px] font-semibold mt-3 transition-colors"
            style={{ color: '#a78bfa' }}
            onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
            onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
          >View Details →</Link>
        </Panel>

        {/* Fee status */}
        <Panel className="p-5" data-testid="student-fee-status">
          <SectionTitle>Fee Status</SectionTitle>
          <div className="space-y-3 mt-4">
            {[
              { label: 'Total Fee', val: (feeData.totalFee || 0).toLocaleString(), color: 'text-white/80' },
              { label: 'Paid',      val: (feeData.totalPaid || 0).toLocaleString(), color: 'text-emerald-400' },
              { label: 'Pending',   val: (feeData.totalPending || 0).toLocaleString(), color: 'text-red-400' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between text-xs" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span className="text-white/35">{label}</span>
                <span className={`font-semibold ${color}`}>Rs.{val}</span>
              </div>
            ))}
            <div className="w-full h-1.5 rounded-full overflow-hidden mt-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${feePercent}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
            </div>
            {feeData.nextDue && (
              <div className="p-3 rounded-xl mt-1"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-[10px] font-semibold text-red-400">
                  Next Due: Rs.{feeData.nextDue.amount?.toLocaleString()} by {feeData.nextDue.dueDate}
                </p>
              </div>
            )}
          </div>
          <Link to="/my-fees"
            className="block text-center text-[11px] font-semibold mt-3.5 transition-colors"
            style={{ color: '#a78bfa' }}
            onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
            onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
          >View Details →</Link>
        </Panel>

        {/* Notifications */}
        <Panel className="p-5" data-testid="student-notifications">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Notifications</SectionTitle>
            <Bell size={15} style={{ color: 'rgba(255,255,255,0.25)' }} />
          </div>
          {stats.notifications?.length > 0
            ? stats.notifications.map((n, i) => (
                <NotifRow key={i} n={n} divider={i < stats.notifications.length - 1} />
              ))
            : <EmptyState text="No notifications" />
          }
        </Panel>
      </div>

      {/* Test results table */}
      <Panel className="p-5" data-testid="student-test-results">
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Recent Test Results</SectionTitle>
          <ViewAllLink to="/my-tests" />
        </div>
        {stats.testResults?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Test', 'Subject', 'Marks', '%'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-[9.5px] font-bold uppercase tracking-wider"
                      style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.testResults.map((r, i) => (
                  <tr key={i}
                    className="transition-colors duration-150"
                    style={{ borderBottom: i < stats.testResults.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-3 py-2.5 text-xs font-semibold text-white/80">{r.testName}</td>
                    <td className="px-3 py-2.5 text-xs text-white/40">{r.subject}</td>
                    <td className="px-3 py-2.5 text-xs font-medium text-white/60">{r.marksObtained}/{r.maximumMarks}</td>
                    <td className="px-3 py-2.5"><ScoreBadge pct={r.percentage} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState text="No test results yet" />}
      </Panel>

      {/* Student Announcements */}
      {stats.announcements?.length > 0 && (
        <Panel className="p-5 mt-4" data-testid="student-announcements">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Announcements</SectionTitle>
            <ViewAllLink to="/announcements" />
          </div>
          <div className="space-y-2">
            {stats.announcements.slice(0, 5).map((ann, i) => (
              <AnnouncementCard key={i} ann={ann} />
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

// ─── PENDING REMINDERS WIDGET ─────────────────────────────────────────────────

function PendingRemindersWidget() {
  const [data, setData]       = useState(null);
  const [sending, setSending] = useState({});

  useEffect(() => {
    API.get('/dashboard/pending-reminders').then(r => setData(r.data)).catch(() => {});
  }, []);

  const sendReminder = async (item) => {
    setSending(p => ({ ...p, [item.studentId + item.dueDate]: true }));
    try {
      await API.post('/reminders/send-now', {
        studentId: item.studentId, amount: item.amount,
        dueDate: item.dueDate, type: item.type,
      });
      setSending(p => ({ ...p, [item.studentId + item.dueDate]: 'done' }));
    } catch {
      setSending(p => ({ ...p, [item.studentId + item.dueDate]: 'error' }));
    }
  };

  if (!data || (data.totalUpcoming === 0 && data.totalOverdue === 0)) return null;

  const items = [...(data.upcoming || []), ...(data.overdue || [])].slice(0, 8);

  return (
    <Panel className="p-5 mt-5" data-testid="pending-reminders-widget">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.22)' }}>
            <BellRing size={14} style={{ color: '#fbbf24' }} />
          </div>
          <SectionTitle>Pending Fee Reminders</SectionTitle>
        </div>
        <div className="flex items-center gap-2">
          {data.totalOverdue > 0 && (
            <span className="text-[9.5px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.22)' }}>
              {data.totalOverdue} overdue
            </span>
          )}
          {data.totalUpcoming > 0 && (
            <span className="text-[9.5px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.22)' }}>
              {data.totalUpcoming} upcoming
            </span>
          )}
          <ViewAllLink to="/settings" label="Settings" />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => {
          const key       = item.studentId + item.dueDate;
          const sendState = sending[key];
          const isOverdue = item.type === 'overdue';
          const [rowBg, rowBorder, iconBg, iconColor] = isOverdue
            ? ['rgba(239,68,68,0.06)', 'rgba(239,68,68,0.18)', 'rgba(239,68,68,0.12)', '#f87171']
            : ['rgba(245,158,11,0.05)', 'rgba(245,158,11,0.15)', 'rgba(245,158,11,0.12)', '#fbbf24'];

          return (
            <div key={i}
              className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-150"
              style={{ background: rowBg, border: `1px solid ${rowBorder}` }}
              data-testid={`reminder-item-${i}`}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: iconBg }}>
                <AlertCircle size={14} style={{ color: iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/85">{item.studentName}</p>
                <p className="text-[10px] text-white/35">
                  Rs.{item.amount?.toLocaleString()} · Due: {item.dueDate}
                  {isOverdue && <span className="font-bold ml-1.5" style={{ color: '#f87171' }}>OVERDUE</span>}
                </p>
              </div>
              <button
                data-testid={`send-reminder-${i}`}
                onClick={() => sendReminder(item)}
                disabled={sendState === true || sendState === 'done'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 shrink-0 disabled:opacity-50 active:scale-[0.96]"
                style={
                  sendState === 'done'  ? { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' } :
                  sendState === 'error' ? { background: 'rgba(239,68,68,0.15)',  color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' } :
                                         { background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)', color: '#fff', boxShadow: '0 2px 8px rgba(108,60,244,0.30)' }
                }
              >
                {sendState === true
                  ? <div className="w-3 h-3 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff' }} />
                  : sendState === 'done'  ? 'Sent ✓'
                  : sendState === 'error' ? 'Failed'
                  : <><Send size={10} /> Remind</>
                }
              </button>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ─── UPCOMING CLASSES WIDGET ──────────────────────────────────────────────────

function UpcomingClassesWidget() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    API.get('/dashboard/upcoming-classes').then(r => setClasses(r.data)).catch(() => {});
  }, []);

  if (!classes.length) return null;

  return (
    <Panel className="p-5 mt-5" data-testid="upcoming-classes-widget">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(108,60,244,0.15)', border: '1px solid rgba(108,60,244,0.22)' }}>
            <Video size={14} style={{ color: '#a78bfa' }} />
          </div>
          <SectionTitle>Upcoming Live Classes</SectionTitle>
        </div>
        <ViewAllLink to="/live-classes" />
      </div>

      <div className="space-y-2">
        {classes.slice(0, 3).map(c => {
          const start  = new Date(c.startTime);
          const now    = new Date();
          const isLive = now >= start && now <= new Date(c.endTime);

          return (
            <div key={c.id}
              className="flex items-center justify-between p-3.5 rounded-2xl transition-all duration-150"
              style={{
                background: isLive ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.04)',
                border: isLive ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.07)',
              }}
              data-testid={`upcoming-class-${c.id}`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
                  <p className="text-xs font-semibold text-white/85 truncate">{c.title}</p>
                </div>
                <p className="text-[10px] text-white/35 mt-0.5">
                  {c.batchName} · {start.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <a href={c.meetLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 shrink-0 disabled:opacity-50 active:scale-[0.96]"
                style={isLive
                  ? { background: 'linear-gradient(135deg,#10b981,#34d399)', color: '#fff', boxShadow: '0 2px 8px rgba(16,185,129,0.35)' }
                  : { background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',  color: '#fff', boxShadow: '0 2px 8px rgba(108,60,244,0.30)' }
                }
                data-testid={`join-upcoming-${c.id}`}
              >
                <ExternalLink size={10} />
                {isLive ? 'Join Now' : 'Join'}
              </a>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
