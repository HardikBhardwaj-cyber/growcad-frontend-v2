import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, GraduationCap, Users, BookOpen,
  ClipboardCheck, CreditCard, FileText, BarChart3,
  Bell, Settings, LogOut, Menu, X, Megaphone, MessageSquare, Video,
} from 'lucide-react';

// ─── Nav definitions ──────────────────────────────────────────────────────────

const adminNav = [
  { path: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/students',      label: 'Students',       icon: GraduationCap },
  { path: '/teachers',      label: 'Teachers',       icon: Users },
  { path: '/batches',       label: 'Batches',        icon: BookOpen },
  { path: '/attendance',    label: 'Attendance',     icon: ClipboardCheck },
  { path: '/live-classes',  label: 'Live Classes',   icon: Video },
  { path: '/fees',          label: 'Fees',           icon: CreditCard },
  { path: '/tests',         label: 'Tests',          icon: FileText },
  { path: '/reports',       label: 'Reports',        icon: BarChart3 },
  { path: '/announcements', label: 'Announcements',  icon: Megaphone },
  { path: '/communication', label: 'Communication',  icon: MessageSquare },
];

const teacherNav = [
  { path: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/batches',      label: 'My Batches',   icon: BookOpen },
  { path: '/students',     label: 'Students',     icon: GraduationCap },
  { path: '/attendance',   label: 'Attendance',   icon: ClipboardCheck },
  { path: '/live-classes', label: 'Live Classes', icon: Video },
  { path: '/tests',        label: 'Tests',        icon: FileText },
];

const studentNav = [
  { path: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/my-attendance', label: 'My Attendance', icon: ClipboardCheck },
  { path: '/my-fees',       label: 'My Fees',       icon: CreditCard },
  { path: '/my-tests',      label: 'My Tests',      icon: FileText },
  { path: '/live-classes',  label: 'Live Classes',  icon: Video },
  { path: '/announcements', label: 'Announcements', icon: Megaphone },
];

const adminBottom = [
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/settings',      label: 'Settings',      icon: Settings },
];
const otherBottom = [
  { path: '/notifications', label: 'Notifications', icon: Bell },
];

// ─── Per-role meta ─────────────────────────────────────────────────────────────

const ROLE_META = {
  admin:   { label: 'Administrator', section: 'Main Menu',     gradient: 'linear-gradient(135deg,#6C3CF4,#a855f7)', glow: 'rgba(108,60,244,0.50)' },
  teacher: { label: 'Teacher',       section: 'Teacher Panel', gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', glow: 'rgba(59,130,246,0.45)'  },
  student: { label: 'Student',       section: 'Student Panel', gradient: 'linear-gradient(135deg,#10b981,#34d399)', glow: 'rgba(16,185,129,0.45)'  },
};

// ─── Page title ────────────────────────────────────────────────────────────────

function pageTitle(pathname) {
  return pathname.replace('/', '').replace(/-/g, ' ') || 'Dashboard';
}

// ─── NavLink ────────────────────────────────────────────────────────────────────

function NavLink({ item, onNavigate }) {
  const { pathname } = useLocation();
  const active = pathname === item.path;

  return (
    <Link
      to={item.path}
      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onNavigate}
      style={active ? {
        background:   'linear-gradient(135deg, rgba(108,60,244,0.22), rgba(168,85,247,0.14))',
        boxShadow:    '0 2px 10px rgba(108,60,244,0.18)',
        borderLeft:   '2.5px solid #7c4ff5',
        paddingLeft:  '13.5px',
        color:        '#fff',
        transition:   'all 0.2s ease-out',
      } : { borderLeft: '2.5px solid transparent' }}
      className={[
        'flex items-center gap-3 pr-3 py-2.5 rounded-r-[10px] mb-[2px]',
        'text-[13px] font-medium select-none',
        'transition-all duration-200 ease-out',
        active
          ? ''
          : 'pl-3.5 text-white/45 hover:text-white/85 hover:bg-white/[0.055] hover:translate-x-[2px]',
      ].join(' ')}
    >
      <item.icon
        size={17}
        strokeWidth={active ? 2.2 : 1.7}
        style={active ? { color: '#c4b5fd' } : {}}
      />
      {item.label}
    </Link>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }) {
  const { user, logout }  = useAuth();
  const location          = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role        = user?.role || 'admin';
  const meta        = ROLE_META[role] ?? ROLE_META.admin;
  const navItems    = role === 'teacher' ? teacherNav : role === 'student' ? studentNav : adminNav;
  const bottomItems = role === 'admin' ? adminBottom : otherBottom;
  const initials    = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#0e0c17', fontFamily: "'Inter', sans-serif" }}
      data-testid="dashboard-layout"
    >

      {/* ── Mobile overlay ───────────────────────────────────────── */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(5px)' }}
      />

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[252px] transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background:     'rgba(18,15,30,0.96)',
          backdropFilter: 'blur(24px)',
          borderRight:    '1px solid rgba(255,255,255,0.07)',
          boxShadow:      '6px 0 40px rgba(0,0,0,0.45), inset -1px 0 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Brand */}
        <div
          className="h-[62px] flex items-center px-5 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ background: meta.gradient, boxShadow: `0 4px 16px ${meta.glow}` }}
            >
              <span className="text-white font-bold text-[15px]">G</span>
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-white tracking-tight leading-tight">Growcad</p>
              <p style={{ fontSize: '9px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.28)' }} className="font-semibold uppercase mt-[1px]">
                {meta.label}
              </p>
            </div>
          </div>
          <button
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all duration-150 shrink-0"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Section label */}
        <p style={{ fontSize: '9.5px', letterSpacing: '0.20em', color: 'rgba(255,255,255,0.22)' }}
          className="px-5 mt-[22px] mb-1 font-bold uppercase">
          {meta.section}
        </p>

        {/* Primary nav */}
        <nav
          className="flex-1 pl-2.5 pr-2 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
        >
          {navItems.map(item => (
            <NavLink key={item.path} item={item} onNavigate={() => setSidebarOpen(false)} />
          ))}
        </nav>

        {/* Bottom utilities */}
        <div className="px-2.5 pb-4 shrink-0">
          <div
            className="pt-3 mb-1"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            {bottomItems.map(item => (
              <NavLink key={item.path} item={item} onNavigate={() => setSidebarOpen(false)} />
            ))}
          </div>

          <button
            onClick={logout}
            data-testid="nav-logout"
            className="flex items-center gap-3 pl-3.5 pr-3 py-2.5 rounded-[10px] text-[13px] font-medium w-full transition-all duration-200"
            style={{ color: 'rgba(255,255,255,0.38)', borderLeft: '2.5px solid transparent' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.09)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={17} strokeWidth={1.7} />
            Logout
          </button>

          {/* User card */}
          <div
            className="flex items-center gap-3 px-3 py-3 mt-2 rounded-[12px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: meta.gradient, boxShadow: `0 2px 8px ${meta.glow}` }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate leading-tight" style={{ color: 'rgba(255,255,255,0.88)' }}>{user?.name}</p>
              <p className="text-[10px] capitalize mt-[1px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header
          className="h-[54px] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shrink-0"
          style={{
            background:     'rgba(18,15,30,0.88)',
            backdropFilter: 'blur(18px)',
            borderBottom:   '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <button
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-[9px] transition-all duration-150"
            style={{ color: 'rgba(255,255,255,0.50)' }}
            data-testid="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.50)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <Menu size={18} />
          </button>

          <div className="hidden lg:flex items-center">
            <h2
              className="capitalize"
              style={{ fontSize: '13.5px', fontWeight: 600, color: 'rgba(255,255,255,0.82)', letterSpacing: '0.01em' }}
            >
              {pageTitle(location.pathname)}
            </h2>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <Link
              to="/notifications"
              data-testid="header-notifications"
              className="w-8 h-8 flex items-center justify-center rounded-[9px] transition-all duration-150"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Bell size={17} />
            </Link>

            <div
              className="flex items-center gap-2.5 pl-3 ml-1.5"
              style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ background: meta.gradient }}
              >
                {initials}
              </div>
              <div className="hidden sm:block">
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.84)', lineHeight: 1.25 }}>{user?.name}</p>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }} className="capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ background: '#0e0c17', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.09) transparent' }}
        >
          <div className="p-4 lg:p-7 max-w-[1380px] mx-auto w-full">
            <div className="animate-fade-in transition-all duration-300 ease-out">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
