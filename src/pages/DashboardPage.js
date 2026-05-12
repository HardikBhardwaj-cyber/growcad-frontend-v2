import { useState, useEffect, useRef, useCallback } from 'react';
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

// ─── Global CSS injected once ─────────────────────────────────────────────────

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
.gc-dash * { font-family:'DM Sans',sans-serif; }
@keyframes gc-orb1 { 0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(45px,-35px) scale(1.09);} }
@keyframes gc-orb2 { 0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(-38px,45px) scale(1.06);} }
@keyframes gc-orb3 { 0%,100%{transform:translate(0,0);}50%{transform:translate(25px,22px);} }
@keyframes gc-particle { 0%{transform:translateY(0) scale(1);opacity:.5;}100%{transform:translateY(-110px) translateX(12px) scale(0);opacity:0;} }
@keyframes gc-fadeUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
@keyframes gc-pulseRing { 0%,100%{box-shadow:0 0 0 0 rgba(108,60,244,.45);}50%{box-shadow:0 0 0 8px rgba(108,60,244,0);} }
.gc-orb1{animation:gc-orb1 12s ease-in-out infinite;}
.gc-orb2{animation:gc-orb2 15s ease-in-out infinite;}
.gc-orb3{animation:gc-orb3 9s ease-in-out infinite;}
.gc-particle{position:absolute;width:2.5px;height:2.5px;border-radius:50%;background:rgba(167,139,250,.4);animation:gc-particle linear infinite;pointer-events:none;}
.gc-anim-1{animation:gc-fadeUp .5s ease-out .05s both;}
.gc-anim-2{animation:gc-fadeUp .5s ease-out .12s both;}
.gc-anim-3{animation:gc-fadeUp .5s ease-out .20s both;}
.gc-anim-4{animation:gc-fadeUp .5s ease-out .28s both;}
.gc-anim-5{animation:gc-fadeUp .5s ease-out .36s both;}
.gc-anim-6{animation:gc-fadeUp .5s ease-out .44s both;}
.gc-card{
  background:linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03));
  border:1px solid rgba(255,255,255,0.10);border-radius:20px;
  box-shadow:0 4px 24px rgba(0,0,0,0.30),0 1px 0 rgba(255,255,255,0.07) inset,0 0 60px rgba(108,60,244,0.05);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  transition:transform .22s ease-out,box-shadow .22s ease-out,border-color .22s ease-out;
}
.gc-card:hover{
  transform:translateY(-4px);
  box-shadow:0 14px 50px rgba(0,0,0,0.44),0 1px 0 rgba(255,255,255,0.09) inset,0 0 80px rgba(108,60,244,0.13);
  border-color:rgba(255,255,255,0.15);
}
.gc-metric-icon:hover{animation:gc-pulseRing .9s ease-out 1;}
.gc-btn-grad{background:linear-gradient(135deg,#6C3CF4,#8b5cf6,#a855f7);box-shadow:0 3px 14px rgba(108,60,244,0.40),0 0 40px rgba(108,60,244,0.12);transition:all .2s ease-out;}
.gc-btn-grad:hover:not(:disabled){box-shadow:0 5px 24px rgba(108,60,244,0.58),0 0 60px rgba(108,60,244,0.20);transform:translateY(-1px) scale(1.02);}
.gc-btn-grad:active:not(:disabled){transform:scale(.97);}
.gc-cursor-glow{position:fixed;width:300px;height:300px;border-radius:50%;pointer-events:none;z-index:0;background:radial-gradient(circle,rgba(108,60,244,0.09) 0%,transparent 70%);transform:translate(-50%,-50%);transition:left .12s ease-out,top .12s ease-out;mix-blend-mode:screen;}
`;

function CursorGlow() {
  const ref = useRef(null);
  const rafRef = useRef(null);

  const onMove = useCallback((e) => {
    if (window.innerWidth < 768) return;
    if (e.clientX < 260) return;

    cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      if (ref.current) {
        const x = e.clientX;
        const y = e.clientY;
        ref.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onMove]);

  return <div ref={ref} className="gc-cursor-glow" />;
}
// ─── Shared primitives ───────────────────────────────────────────────────────

function Panel({ className = '', style = {}, ...props }) {
  return <div className={`gc-card ${className}`} style={style} {...props} />;
}

function SectionLabel({ children }) {
  return <p style={{ fontSize:'9.5px', letterSpacing:'0.20em', color:'rgba(255,255,255,0.30)', fontWeight:700 }} className="uppercase mb-0.5">{children}</p>;
}

function SectionTitle({ children }) {
  return <h3 className="text-[13.5px] font-semibold text-white/90 tracking-tight">{children}</h3>;
}

function ViewAllLink({ to, label = 'View All' }) {
  return (
    <Link to={to} className="text-[10px] font-bold transition-all duration-150 hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.7)]"
      style={{ color:'#a78bfa' }}
      onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
      onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
    >{label}</Link>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-10 text-center flex flex-col items-center gap-2">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          background: 'rgba(108,60,244,0.15)',
          border: '1px solid rgba(108,60,244,0.25)'
        }}>
        <BookOpen size={18} style={{ color: '#a78bfa' }} />
      </div>
      <p className="text-[12px] text-white/40">{text}</p>
      <p className="text-[10px] text-white/25">
        Nothing here yet — but it’s coming ✨
      </p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'rgba(12,9,28,0.96)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.13)', borderRadius:'12px', padding:'10px 14px', fontSize:'11px', color:'#fff', boxShadow:'0 8px 32px rgba(0,0,0,0.50),0 0 20px rgba(108,60,244,0.15)' }}>
      <p style={{ color:'rgba(255,255,255,0.48)', marginBottom:3, fontSize:'10px', letterSpacing:'0.05em' }}>{label}</p>
      <p style={{ fontWeight:700, color:'#c4b5fd' }}>{payload[0].name}: {payload[0].value?.toLocaleString?.() ?? payload[0].value}</p>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, testId, animClass }) {
  return (
    <div
  data-testid={testId}
  className={`gc-card p-5 cursor-default ${animClass || ''}`}
  style={{
    background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
  }}
>
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>{label}</SectionLabel>
        <div className="gc-metric-icon w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background:`linear-gradient(145deg,${color}28,${color}12)`, border:`1px solid ${color}35`, boxShadow:`0 0 18px ${color}28` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="text-[1.75rem] font-bold text-white leading-none tracking-tight flex items-center gap-2">
  {value}
  <span className="text-[10px] text-emerald-400 font-semibold">↑ 12%</span>
</p>
      <div className="mt-2 h-[2px] rounded-full" style={{ background:`linear-gradient(90deg,${color}60,transparent)`, width:'40%' }} />
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, iconColor = '#6C3CF4', testId }) {
  return (
    <Link to={to} data-testid={testId}
      className="flex flex-col items-center gap-2.5 p-4 rounded-2xl text-center transition-all duration-200 hover:-translate-y-[3px] group"
      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${iconColor}55`; e.currentTarget.style.background = `${iconColor}12`; e.currentTarget.style.boxShadow = `0 0 24px ${iconColor}20`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
        style={{ background:`${iconColor}20`, border:`1px solid ${iconColor}30`, boxShadow:`0 0 12px ${iconColor}18` }}>
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      <span className="text-[11px] font-semibold text-white/55 leading-tight group-hover:text-white/80 transition-colors duration-150">{label}</span>
    </Link>
  );
}

function ListRow({ icon: Icon, iconBg, iconColor, title, subtitle, right, divider = true }) {
  return (
    <div className="flex items-center gap-3 py-2.5 transition-all duration-150 rounded-xl px-2 -mx-2 cursor-default"
      style={divider ? { borderBottom:'1px solid rgba(255,255,255,0.05)' } : {}}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,60,244,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:iconBg, border:`1px solid ${iconColor}30` }}>
        <Icon size={15} style={{ color:iconColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-semibold text-white/85 truncate">{title}</p>
        <p className="text-[10px] text-white/35 mt-0.5">{subtitle}</p>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

function NotifRow({ n, divider }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 transition-all duration-150 rounded-xl px-2 -mx-2"
      style={divider ? { borderBottom:'1px solid rgba(255,255,255,0.05)' } : {}}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,60,244,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background:'rgba(108,60,244,0.18)', border:'1px solid rgba(108,60,244,0.28)' }}>
        <Bell size={11} style={{ color:'#a78bfa' }} />
      </div>
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold text-white/80 truncate">{n.title}</p>
        <p className="text-[10px] text-white/35 truncate mt-0.5">{n.message}</p>
      </div>
    </div>
  );
}

function AnnouncementCard({ ann }) {
  return (
    <div className="p-4 rounded-2xl transition-all duration-200 cursor-default"
      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(108,60,244,0.30)'; e.currentTarget.style.background='rgba(108,60,244,0.06)'; e.currentTarget.style.transform='translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.transform='none'; }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[12.5px] font-semibold text-white/85">{ann.title}</p>
        {ann.targetBatchName && (
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
            style={{ background:'rgba(59,130,246,0.15)', color:'#93c5fd', border:'1px solid rgba(59,130,246,0.22)' }}>
            {ann.targetBatchName}
          </span>
        )}
      </div>
      <p className="text-[11px] text-white/45 leading-relaxed">{ann.message}</p>
      <p className="text-[10px] text-white/20 mt-1.5">{ann.createdAt?.slice(0, 10)}</p>
    </div>
  );
}

function DayBadge({ d }) {
  return <span className="text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ background:'rgba(108,60,244,0.18)', color:'#a78bfa', border:'1px solid rgba(108,60,244,0.22)' }}>{d.slice(0,3)}</span>;
}

function ScoreBadge({ pct }) {
  const [bg, color] = pct>=80?['rgba(16,185,129,0.14)','#34d399']:pct>=50?['rgba(245,158,11,0.14)','#fbbf24']:['rgba(239,68,68,0.14)','#f87171'];
  return <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold" style={{ background:bg, color, border:`1px solid ${color}30` }}>{pct}%</span>;
}

// ─── Background ───────────────────────────────────────────────────────────────

const PARTICLES = [
  { left:'8%',  top:'72%', delay:'0s',   dur:'10s' },
  { left:'18%', top:'83%', delay:'2.2s', dur:'12s' },
  { left:'31%', top:'76%', delay:'4.5s', dur:'9s'  },
  { left:'65%', top:'80%', delay:'1.2s', dur:'11s' },
  { left:'78%', top:'68%', delay:'3.5s', dur:'13s' },
  { left:'52%', top:'88%', delay:'6s',   dur:'9.5s'},
  { left:'42%', top:'65%', delay:'7s',   dur:'11s' },
];

function BackgroundScene() {
  return (
    <>
      <div className="gc-orb1 absolute pointer-events-none" style={{ top:'-6%',left:'-4%',width:560,height:560,background:'radial-gradient(circle,rgba(108,60,244,.20) 0%,transparent 65%)',filter:'blur(48px)' }} />
      <div className="gc-orb2 absolute pointer-events-none" style={{ bottom:'-10%',right:'-5%',width:520,height:520,background:'radial-gradient(circle,rgba(168,85,247,.16) 0%,transparent 65%)',filter:'blur(48px)' }} />
      <div className="gc-orb3 absolute pointer-events-none" style={{ top:'38%',right:'18%',width:280,height:280,background:'radial-gradient(circle,rgba(59,130,246,.10) 0%,transparent 70%)',filter:'blur(32px)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,.020) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.020) 1px,transparent 1px)', backgroundSize:'48px 48px' }} />
      {PARTICLES.map((p, i) => <div key={i} className="gc-particle" style={{ left:p.left, top:p.top, animationDelay:p.delay, animationDuration:p.dur }} />)}
    </>
  );
}

function PageBackground({ children }) {
  return (
    <div className="gc-dash relative min-h-full" style={{ background:'linear-gradient(140deg,#090614 0%,#110a2c 28%,#0e1040 58%,#060612 100%)' }}>
      <BackgroundScene />
      <CursorGlow />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user }  = useAuth();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!document.getElementById('gc-dash-css')) {
      const tag = document.createElement('style');
      tag.id = 'gc-dash-css';
      tag.textContent = GLOBAL_CSS;
      document.head.appendChild(tag);
    }
  }, []);

  useEffect(() => {
    API.get('/dashboard/stats').then(res => setStats(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageBackground>
        <div className="flex flex-col items-center justify-center h-64 gap-4" data-testid="dashboard-loading">
          <div className="w-10 h-10 rounded-full animate-spin" style={{ border:'3px solid rgba(108,60,244,0.20)', borderTopColor:'#7c4ff5' }} />
          <p className="text-[11px] text-white/30 tracking-widest uppercase">Loading dashboard…</p>
        </div>
      </PageBackground>
    );
  }

  if (!stats) {
    return (
      <PageBackground>
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-white/30">Failed to load dashboard</p>
        </div>
      </PageBackground>
    );
  }

  const role = stats.role || user?.role || 'admin';
  return (
    <PageBackground>
      {role === 'student' ? <StudentDashboard stats={stats} /> :
       role === 'teacher' ? <TeacherDashboard stats={stats} /> :
                            <AdminDashboard   stats={stats} />}
    </PageBackground>
  );
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────

function AdminDashboard({ stats }) {
  const revenueData = Object.entries(stats.monthlyFees || {})
    .sort().slice(-6)
    .map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleDateString('en', { month:'short' }),
      collected: Math.round(amount),
    }));

  const attendanceData = [
    { name:'Present', value: stats.attendanceRate || 0 },
    { name:'Absent',  value: Math.round((100 - (stats.attendanceRate || 0)) * 10) / 10 },
  ];

  const metricCards = [
    { label:'Total Students',     value:stats.totalStudents,                                icon:GraduationCap,  color:'#7c4ff5' },
    { label:'Total Batches',      value:stats.totalBatches || 0,                            icon:BookOpen,       color:'#3b82f6' },
    { label:'Revenue Collected',  value:`Rs.${(stats.monthlyRevenue/1000).toFixed(0)}K`,   icon:IndianRupee,    color:'#10b981' },
    { label:"Today's Attendance", value:`${stats.todayAttendanceRate || 0}%`,               icon:ClipboardCheck, color:'#f59e0b' },
  ];

  return (
    <div data-testid="admin-dashboard" className="p-1">
      <div className="mb-8 gc-anim-1">
  <Panel className="p-6">
    <h1 className="text-[1.6rem] font-bold text-white tracking-tight flex items-center gap-2">
  Welcome back, Admin 👋
  <span className="text-[10px] text-emerald-400 animate-pulse">
    ● Live
  </span>
</h1>
    <p className="text-white/40 text-sm mt-1">
      Here’s what’s happening in your institute today
    </p>

    {/* micro hook */}
    <p className="text-xs text-white/25 mt-2">
      Stay sharp — your system is running smoothly 🚀
    </p>
  </Panel>
</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricCards.map((card, i) => <MetricCard key={i} {...card} testId={`stat-card-${i}`} animClass={`gc-anim-${i+2}`} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8 gc-anim-3">
        <Panel
  className="lg:col-span-2 p-6"
  data-testid="revenue-chart"
  style={{
    boxShadow: '0 25px 100px rgba(108,60,244,0.35)',
  border: '1px solid rgba(108,60,244,0.25)'
  }}
>
          <div className="mb-5">
            <SectionTitle>Revenue Overview</SectionTitle>
            <p className="text-[11px] text-white/35 mt-0.5">Monthly fee collection · last 6 months</p>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} barSize={28}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill:'rgba(255,255,255,0.32)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'rgba(255,255,255,0.32)', fontSize:11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="gcBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#a78bfa" />
                    <stop offset="60%"  stopColor="#7c4ff5" />
                    <stop offset="100%" stopColor="#6C3CF4" stopOpacity=".80" />
                  </linearGradient>
                </defs>
                <Bar dataKey="collected" radius={[10,10,0,0]} fill="url(#gcBarGrad)"
                  style={{ filter:'drop-shadow(0 6px 12px rgba(108,60,244,0.40))' }} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[220px] flex items-center justify-center"><EmptyState text="No revenue data yet" /></div>}
        </Panel>

        <Panel className="p-6" data-testid="attendance-chart">
          <div className="mb-3">
            <SectionTitle>Attendance Rate</SectionTitle>
            <p className="text-[11px] text-white/35 mt-0.5">Overall attendance</p>
          </div>
          <ResponsiveContainer width="100%" height={185}>
            <PieChart>
              <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={56} outerRadius={78} dataKey="value" strokeWidth={0}
                style={{ filter:'drop-shadow(0 0 16px rgba(108,60,244,0.55))' }}>
                {attendanceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 -mt-1">
            {[
              { label:`Present ${stats.attendanceRate}%`, color:'#7c4ff5' },
              { label:`Absent ${(100-stats.attendanceRate).toFixed(1)}%`, color:'rgba(108,60,244,0.30)' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background:color }} />
                <span className="text-[11px] text-white/42">{label}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 gc-anim-4">
        <Panel className="p-5" data-testid="quick-actions">
          <SectionTitle>Quick Actions</SectionTitle>
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {[
              { label:'Mark Attendance', path:'/attendance',    icon:ClipboardCheck, color:'#7c4ff5' },
              { label:'Send Reminder',   path:'/settings',      icon:Bell,           color:'#f59e0b' },
              { label:'Add Student',     path:'/students',      icon:GraduationCap,  color:'#10b981' },
              { label:'Announcements',   path:'/announcements', icon:FileText,       color:'#3b82f6' },
              { label:'Communication',   path:'/communication', icon:Users,          color:'#a855f7' },
              { label:'Collect Fees',    path:'/fees',          icon:CreditCard,     color:'#10b981' },
            ].map((a, i) => <QuickAction key={i} to={a.path} icon={a.icon} label={a.label} iconColor={a.color} testId={`quick-action-${i}`} />)}
          </div>
        </Panel>

        <Panel className="p-5" data-testid="today-classes">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Today's Classes</SectionTitle>
            <BookOpen size={15} style={{ color:'rgba(255,255,255,0.22)' }} />
          </div>
          {stats.todayClasses?.length > 0
            ? stats.todayClasses.map((c, i) => <ListRow key={i} icon={Calendar} iconBg="rgba(108,60,244,0.14)" iconColor="#7c4ff5" title={c.batchName} subtitle={`${c.classDuration} · ${c.subject}`} divider={i < stats.todayClasses.length - 1} />)
            : <EmptyState text="No classes scheduled today" />}
        </Panel>

        <Panel className="p-5" data-testid="recent-notifications">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Notifications</SectionTitle>
            <Bell size={15} style={{ color:'rgba(255,255,255,0.22)' }} />
          </div>
          {stats.notifications?.length > 0
            ? stats.notifications.map((n, i) => <NotifRow key={i} n={n} divider={i < stats.notifications.length - 1} />)
            : <EmptyState text="No notifications" />}
        </Panel>
      </div>

      <div className="gc-anim-5">
        <PendingRemindersWidget />
        <UpcomingClassesWidget />
      </div>

      {stats.announcements?.length > 0 && (
        <Panel className="p-5 mt-5 gc-anim-6" data-testid="dashboard-announcements">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Latest Announcements</SectionTitle>
            <ViewAllLink to="/announcements" />
          </div>
          <div className="space-y-2">
            {stats.announcements.slice(0, 5).map((ann, i) => <AnnouncementCard key={i} ann={ann} />)}
          </div>
        </Panel>
      )}
    </div>
  );
}

// ─── TEACHER DASHBOARD ───────────────────────────────────────────────────────

function TeacherDashboard({ stats }) {
  return (
    <div data-testid="teacher-dashboard" className="p-1">
      <div className="mb-8 gc-anim-1">
        <SectionLabel>Overview</SectionLabel>
        <h1 className="text-[1.45rem] font-bold text-white tracking-tight">Teacher Dashboard</h1>
        <p className="text-xs text-white/35 mt-0.5">Your classes and students overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label:'My Batches',      value:stats.totalBatches || 0,        icon:BookOpen,       color:'#7c4ff5' },
          { label:'My Students',     value:stats.totalStudents || 0,       icon:GraduationCap,  color:'#3b82f6' },
          { label:'Attendance Rate', value:`${stats.attendanceRate || 0}%`, icon:ClipboardCheck, color:'#10b981' },
        ].map((card, i) => <MetricCard key={i} {...card} testId={`teacher-stat-${i}`} animClass={`gc-anim-${i+2}`} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5 gc-anim-3">
        <Panel className="p-5" data-testid="teacher-batches">
          <div className="flex items-center justify-between mb-4"><SectionTitle>My Batches</SectionTitle><ViewAllLink to="/batches" /></div>
          {stats.myBatches?.map((b, i) => (
            <ListRow key={i} icon={BookOpen} iconBg="rgba(108,60,244,0.14)" iconColor="#7c4ff5"
              title={b.batchName} subtitle={`${b.subject} · ${b.studentCount || 0} students`}
              divider={i < stats.myBatches.length - 1}
              right={<div className="flex flex-wrap gap-1">{(b.scheduleDays || []).slice(0, 3).map(d => <DayBadge key={d} d={d} />)}</div>}
            />
          ))}
          {!stats.myBatches?.length && <EmptyState text="No batches assigned" />}
        </Panel>

        <Panel className="p-5" data-testid="teacher-today-classes">
          <div className="flex items-center justify-between mb-4"><SectionTitle>Today's Classes</SectionTitle><Calendar size={15} style={{ color:'rgba(255,255,255,0.22)' }} /></div>
          {stats.todayClasses?.length > 0
            ? stats.todayClasses.map((c, i) => <ListRow key={i} icon={Calendar} iconBg="rgba(16,185,129,0.13)" iconColor="#34d399" title={c.batchName} subtitle={`${c.classDuration} · ${c.subject}`} divider={i < stats.todayClasses.length - 1} />)
            : <EmptyState text="No classes scheduled today" />}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 gc-anim-4">
        <Panel className="p-5" data-testid="teacher-quick-actions">
          <SectionTitle>Quick Actions</SectionTitle>
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {[
              { label:'Mark Attendance', path:'/attendance', icon:ClipboardCheck, color:'#7c4ff5' },
              { label:'Create Test',     path:'/tests',      icon:FileText,       color:'#3b82f6' },
              { label:'View Students',   path:'/students',   icon:GraduationCap,  color:'#10b981' },
              { label:'My Batches',      path:'/batches',    icon:BookOpen,       color:'#a855f7' },
            ].map((a, i) => <QuickAction key={i} to={a.path} icon={a.icon} label={a.label} iconColor={a.color} />)}
          </div>
        </Panel>

        <Panel className="p-5" data-testid="teacher-recent-tests">
          <div className="flex items-center justify-between mb-4"><SectionTitle>Recent Tests</SectionTitle><ViewAllLink to="/tests" /></div>
          {stats.recentTests?.length > 0
            ? stats.recentTests.map((t, i) => <ListRow key={i} icon={FileText} iconBg="rgba(168,85,247,0.13)" iconColor="#c084fc" title={t.testName} subtitle={`${t.batchName} · ${t.testDate}`} divider={i < stats.recentTests.length - 1} />)
            : <EmptyState text="No tests yet" />}
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
    { name:'Present', value: attData.rate || 0 },
    { name:'Absent',  value: Math.round((100 - (attData.rate || 0)) * 10) / 10 },
  ];
  const feePercent = feeData.totalFee ? (feeData.totalPaid / feeData.totalFee * 100) : 0;

  return (
    <div data-testid="student-dashboard" className="p-1">
      <div className="mb-8 gc-anim-1">
        <SectionLabel>Student Portal</SectionLabel>
        <h1 className="text-[1.45rem] font-bold text-white tracking-tight">
          Welcome, {stats.student?.name || 'Student'}
        </h1>
        <p className="text-xs text-white/35 mt-0.5">{stats.batch?.batchName || 'Your'} dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Attendance Rate',  value:`${attData.rate || 0}%`,                                  icon:ClipboardCheck, color:attData.rate >= 75 ? '#10b981' : '#ef4444' },
          { label:'Classes Attended', value:`${attData.present || 0}/${attData.total || 0}`,           icon:Calendar,       color:'#3b82f6' },
          { label:'Fee Paid',         value:`Rs.${((feeData.totalPaid || 0)/1000).toFixed(0)}K`,      icon:CreditCard,     color:'#10b981' },
          { label:'Fee Pending',      value:`Rs.${((feeData.totalPending || 0)/1000).toFixed(0)}K`,   icon:AlertCircle,    color:feeData.totalPending > 0 ? '#ef4444' : '#10b981' },
        ].map((card, i) => <MetricCard key={i} {...card} testId={`student-stat-${i}`} animClass={`gc-anim-${i+2}`} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 gc-anim-3">
        <Panel className="p-5" data-testid="student-attendance-chart">
          <SectionTitle>My Attendance</SectionTitle>
          <ResponsiveContainer width="100%" height={165}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={46} outerRadius={66} dataKey="value" strokeWidth={0}
                style={{ filter:'drop-shadow(0 0 14px rgba(108,60,244,0.50))' }}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">
            {[
              { label:`Present: ${attData.present || 0}`, color:'#7c4ff5' },
              { label:`Absent: ${attData.absent || 0}`,   color:'rgba(108,60,244,0.28)' },
            ].map(({ label, color }) => (
              <span key={label} className="text-[10px] text-white/40 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background:color }} />{label}
              </span>
            ))}
          </div>
          <Link to="/my-attendance" className="block text-center text-[11px] font-semibold mt-3.5 transition-colors"
            style={{ color:'#a78bfa' }} onMouseEnter={e => e.currentTarget.style.color='#c4b5fd'} onMouseLeave={e => e.currentTarget.style.color='#a78bfa'}>
            View Details →
          </Link>
        </Panel>

        <Panel className="p-5" data-testid="student-fee-status">
          <SectionTitle>Fee Status</SectionTitle>
          <div className="space-y-3 mt-4">
            {[
              { label:'Total Fee', val:(feeData.totalFee || 0).toLocaleString(),     color:'text-white/80' },
              { label:'Paid',      val:(feeData.totalPaid || 0).toLocaleString(),    color:'text-emerald-400' },
              { label:'Pending',   val:(feeData.totalPending || 0).toLocaleString(), color:'text-red-400' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between text-xs" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:8 }}>
                <span className="text-white/35">{label}</span>
                <span className={`font-semibold ${color}`}>Rs.{val}</span>
              </div>
            ))}
            <div className="w-full h-2 rounded-full overflow-hidden mt-1" style={{ background:'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width:`${feePercent}%`, background:'linear-gradient(90deg,#10b981,#34d399)', boxShadow:'0 0 10px rgba(16,185,129,0.40)' }} />
            </div>
            {feeData.nextDue && (
              <div className="p-3 rounded-xl mt-1" style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.22)' }}>
                <p className="text-[10px] font-semibold text-red-400">
                  Next Due: Rs.{feeData.nextDue.amount?.toLocaleString()} by {feeData.nextDue.dueDate}
                </p>
              </div>
            )}
          </div>
          <Link to="/my-fees" className="block text-center text-[11px] font-semibold mt-4 transition-colors"
            style={{ color:'#a78bfa' }} onMouseEnter={e => e.currentTarget.style.color='#c4b5fd'} onMouseLeave={e => e.currentTarget.style.color='#a78bfa'}>
            View Details →
          </Link>
        </Panel>

        <Panel className="p-5" data-testid="student-notifications">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Notifications</SectionTitle>
            <Bell size={15} style={{ color:'rgba(255,255,255,0.22)' }} />
          </div>
          {stats.notifications?.length > 0
            ? stats.notifications.map((n, i) => <NotifRow key={i} n={n} divider={i < stats.notifications.length - 1} />)
            : <EmptyState text="No notifications" />}
        </Panel>
      </div>

      <Panel className="p-5 gc-anim-4" data-testid="student-test-results">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Recent Test Results</SectionTitle>
          <ViewAllLink to="/my-tests" />
        </div>
        {stats.testResults?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  {['Test','Subject','Marks','%'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5"
                      style={{ color:'rgba(255,255,255,0.25)', fontSize:'9.5px', fontWeight:700, letterSpacing:'0.13em', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.testResults.map((r, i) => (
                  <tr key={i} className="transition-all duration-150"
                    style={{ borderBottom:i < stats.testResults.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,60,244,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td className="px-3 py-2.5 text-xs font-semibold text-white/82">{r.testName}</td>
                    <td className="px-3 py-2.5 text-xs text-white/38">{r.subject}</td>
                    <td className="px-3 py-2.5 text-xs font-medium text-white/58">{r.marksObtained}/{r.maximumMarks}</td>
                    <td className="px-3 py-2.5"><ScoreBadge pct={r.percentage} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState text="No test results yet" />}
      </Panel>

      {stats.announcements?.length > 0 && (
        <Panel className="p-5 mt-4 gc-anim-5" data-testid="student-announcements">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Announcements</SectionTitle>
            <ViewAllLink to="/announcements" />
          </div>
          <div className="space-y-2">
            {stats.announcements.slice(0, 5).map((ann, i) => <AnnouncementCard key={i} ann={ann} />)}
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
      await API.post('/reminders/send-now', { studentId:item.studentId, amount:item.amount, dueDate:item.dueDate, type:item.type });
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
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:'rgba(245,158,11,0.16)', border:'1px solid rgba(245,158,11,0.26)', boxShadow:'0 0 14px rgba(245,158,11,0.18)' }}>
            <BellRing size={15} style={{ color:'#fbbf24' }} />
          </div>
          <SectionTitle>Pending Fee Reminders</SectionTitle>
        </div>
        <div className="flex items-center gap-2">
          {data.totalOverdue > 0 && <span className="text-[9.5px] px-2.5 py-0.5 rounded-full font-bold" style={{ background:'rgba(239,68,68,0.14)',color:'#f87171',border:'1px solid rgba(239,68,68,0.28)' }}>{data.totalOverdue} overdue</span>}
          {data.totalUpcoming > 0 && <span className="text-[9.5px] px-2.5 py-0.5 rounded-full font-bold" style={{ background:'rgba(245,158,11,0.14)',color:'#fbbf24',border:'1px solid rgba(245,158,11,0.28)' }}>{data.totalUpcoming} upcoming</span>}
          <ViewAllLink to="/settings" label="Settings" />
        </div>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => {
          const key = item.studentId + item.dueDate;
          const sendState = sending[key];
          const isOverdue = item.type === 'overdue';
          const [rowBg, rowBorder, iconBg, iconColor] = isOverdue
            ? ['rgba(239,68,68,0.07)','rgba(239,68,68,0.22)','rgba(239,68,68,0.14)','#f87171']
            : ['rgba(245,158,11,0.06)','rgba(245,158,11,0.18)','rgba(245,158,11,0.14)','#fbbf24'];
          return (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-150"
              style={{ background:rowBg, border:`1px solid ${rowBorder}` }} data-testid={`reminder-item-${i}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background:iconBg }}>
                <AlertCircle size={14} style={{ color:iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/85">{item.studentName}</p>
                <p className="text-[10px] text-white/35">
                  Rs.{item.amount?.toLocaleString()} · Due: {item.dueDate}
                  {isOverdue && <span className="font-bold ml-1.5" style={{ color:'#f87171' }}>OVERDUE</span>}
                </p>
              </div>
              <button data-testid={`send-reminder-${i}`} onClick={() => sendReminder(item)}
                disabled={sendState === true || sendState === 'done'}
                className="gc-btn-grad flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 shrink-0 disabled:opacity-50 active:scale-[0.96]"
                style={sendState==='done'?{background:'rgba(16,185,129,0.16)',color:'#34d399',border:'1px solid rgba(16,185,129,0.28)'}:sendState==='error'?{background:'rgba(239,68,68,0.16)',color:'#f87171',border:'1px solid rgba(239,68,68,0.28)'}:{background:'linear-gradient(135deg,#6C3CF4,#8b5cf6)',color:'#fff',boxShadow:'0 3px 12px rgba(108,60,244,0.38)'}}
              >
                {sendState === true ? <div className="w-3 h-3 rounded-full animate-spin" style={{ border:'2px solid rgba(255,255,255,0.25)',borderTopColor:'#fff' }} /> : sendState==='done' ? 'Sent ✓' : sendState==='error' ? 'Failed' : <><Send size={10} /> Remind</>}
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:'rgba(108,60,244,0.16)', border:'1px solid rgba(108,60,244,0.26)', boxShadow:'0 0 14px rgba(108,60,244,0.20)' }}>
            <Video size={15} style={{ color:'#a78bfa' }} />
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
            <div key={c.id} className="flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 hover:-translate-y-[2px]"
              style={{ background:isLive?'rgba(16,185,129,0.08)':'rgba(255,255,255,0.04)', border:isLive?'1px solid rgba(16,185,129,0.28)':'1px solid rgba(255,255,255,0.08)', boxShadow:isLive?'0 0 20px rgba(16,185,129,0.12)':'none' }}
              data-testid={`upcoming-class-${c.id}`}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
                  <p className="text-xs font-semibold text-white/85 truncate">{c.title}</p>
                </div>
                <p className="text-[10px] text-white/35 mt-0.5">
                  {c.batchName} · {start.toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                </p>
              </div>
              <a href={c.meetLink} target="_blank" rel="noopener noreferrer"
                className="gc-btn-grad flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold shrink-0 ml-3 text-white"
                style={isLive?{background:'linear-gradient(135deg,#10b981,#34d399)',boxShadow:'0 3px 12px rgba(16,185,129,0.40)'}:{background:'linear-gradient(135deg,#6C3CF4,#8b5cf6)',boxShadow:'0 3px 12px rgba(108,60,244,0.35)'}}
                data-testid={`join-upcoming-${c.id}`}>
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
