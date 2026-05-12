import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, GraduationCap, Users, BookOpen,
  ClipboardCheck, CreditCard, FileText, BarChart3,
  Bell, Settings, LogOut, Menu, X, Megaphone, MessageSquare, Video,
  ShieldCheck, Building2,
} from 'lucide-react';

// ─── Nav definitions (unchanged — same routes/logic) ──────────

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

const superadminNav = [
  { path: '/dashboard',   label: 'Command Center', icon: ShieldCheck },
  { path: '/super-admin', label: 'Approvals',      icon: Building2 },
];

const adminBottom = [
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/settings',      label: 'Settings',      icon: Settings },
];
const otherBottom = [
  { path: '/notifications', label: 'Notifications', icon: Bell },
];

// ─── Role metadata ─────────────────────────────────────────────

const ROLE_META = {
  admin:      { label: 'Administrator', section: 'Main Menu',     gradient: 'linear-gradient(135deg,#6C3CF4,#a855f7)', glow: 'rgba(108,60,244,0.45)' },
  teacher:    { label: 'Teacher',       section: 'Teacher Panel', gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', glow: 'rgba(59,130,246,0.40)'  },
  student:    { label: 'Student',       section: 'Student Panel', gradient: 'linear-gradient(135deg,#10b981,#34d399)', glow: 'rgba(16,185,129,0.40)'  },
  superadmin: { label: 'Super Admin',   section: 'Platform',      gradient: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)', glow: 'rgba(14,165,233,0.38)'  },
};

// ─── Page title helper ─────────────────────────────────────────

function pageTitle(pathname) {
  return pathname.replace('/', '').replace(/-/g, ' ') || 'Dashboard';
}

// ─── NavLink ───────────────────────────────────────────────────

function NavLink({ item, onNavigate }) {
  const { pathname } = useLocation();
  const active = pathname === item.path;

  return (
    <Link
      to={item.path}
      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onNavigate}
      className="flex items-center gap-3 pr-3 py-2 rounded-[10px] mb-[1px] text-[13px] font-medium select-none"
      style={
        active
          ? {
              background: 'linear-gradient(135deg, rgba(108,60,244,0.22), rgba(168,85,247,0.14))',
              borderLeft:  '2.5px solid #7c4ff5',
              paddingLeft: '13.5px',
              color:       'rgba(255,255,255,0.96)',
              boxShadow:   '0 2px 12px rgba(108,60,244,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
              transition:  'none',
            }
          : {
              borderLeft:  '2.5px solid transparent',
              paddingLeft: '13.5px',
              color:       'rgba(255,255,255,0.62)',    /* ← was 0.45, now readable */
              transition:  'color 0.15s ease, background 0.15s ease, border-color 0.15s ease',
            }
      }
      onMouseEnter={e => {
        if (active) return;
        e.currentTarget.style.color           = 'rgba(255,255,255,0.92)';
        e.currentTarget.style.background      = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.borderLeftColor = 'rgba(108,60,244,0.55)';
      }}
      onMouseLeave={e => {
        if (active) return;
        e.currentTarget.style.color           = 'rgba(255,255,255,0.62)';
        e.currentTarget.style.background      = 'transparent';
        e.currentTarget.style.borderLeftColor = 'transparent';
      }}
    >
      <item.icon
        size={16}
        strokeWidth={active ? 2.2 : 1.8}
        style={{ color: active ? '#c4b5fd' : 'currentColor', flexShrink: 0 }}
      />
      {item.label}
    </Link>
  );
}

// ─── Layout ────────────────────────────────────────────────────

export default function DashboardLayout({ children }) {
  const { user, logout }  = useAuth();
  const location          = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role        = user?.role || 'admin';
  const meta        = ROLE_META[role] ?? ROLE_META.admin;
  const navItems    = role === 'superadmin' ? superadminNav : role === 'teacher' ? teacherNav : role === 'student' ? studentNav : adminNav;
  const bottomItems = role === 'admin' ? adminBottom : role === 'superadmin' ? [] : otherBottom;
  const initials    = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#0e0c17', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      data-testid="dashboard-layout"
    >
      {/* Mobile overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.68)', backdropFilter: 'blur(4px)' }}
      />

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[248px] transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'linear-gradient(180deg, #120f1e 0%, #100d1a 100%)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '4px 0 40px rgba(0,0,0,0.45)',
        }}
      >
        {/* Subtle ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 20% 0%, rgba(108,60,244,0.07), transparent 55%)' }}
        />

        <div className="relative flex flex-col h-full">

          {/* Brand header */}
          <div
            className="h-[60px] flex items-center justify-between px-5 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
                style={{ background: meta.gradient, boxShadow: `0 3px 14px ${meta.glow}` }}
              >
                <span className="text-white font-bold text-[14px]">G</span>
              </div>
              <div className="min-w-0">
                <p className="text-[14.5px] font-bold text-white tracking-tight leading-tight">Growcad</p>
                <p style={{ fontSize: '9px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.38)' }}
                  className="font-semibold uppercase">
                  {meta.label}
                </p>
              </div>
            </div>
            {/* Mobile close */}
            <button
              className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onClick={() => setSidebarOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          {/* Section label */}
          <p
            className="px-5 mt-5 mb-1.5 font-bold uppercase"
            style={{ fontSize: '9px', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.35)' }}
          >
            {meta.section}
          </p>

          {/* Primary nav */}
          <nav
            className="flex-1 pl-2.5 pr-2 overflow-y-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {navItems.map(item => (
              <NavLink key={item.path} item={item} onNavigate={() => setSidebarOpen(false)} />
            ))}
          </nav>

          {/* Bottom utilities */}
          <div className="px-2.5 pb-4 shrink-0">
            <div
              className="pt-3 mb-1"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              {bottomItems.map(item => (
                <NavLink key={item.path} item={item} onNavigate={() => setSidebarOpen(false)} />
              ))}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              data-testid="nav-logout"
              className="flex items-center gap-3 px-3.5 py-2 rounded-[10px] text-[13px] font-medium w-full mb-2"
              style={{
                color: 'rgba(255,255,255,0.45)',
                border: '2.5px solid transparent',
                transition: 'color 0.15s ease, background 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color      = '#f87171';
                e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color      = 'rgba(255,255,255,0.45)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogOut size={16} strokeWidth={1.8} />
              Logout
            </button>

            {/* User card */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-[12px]"
              style={{
                background:   'rgba(255,255,255,0.04)',
                border:       '1px solid rgba(255,255,255,0.08)',
                transition:   'background 0.15s ease, border-color 0.15s ease',
                cursor:       'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = 'rgba(108,60,244,0.08)';
                e.currentTarget.style.borderColor = 'rgba(108,60,244,0.24)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: meta.gradient, boxShadow: `0 2px 8px ${meta.glow}` }}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                {/* ↓ was 0.35 (hard to read) — now 0.78 */}
                <p className="text-[12px] font-semibold truncate leading-tight" style={{ color: 'rgba(255,255,255,0.88)' }}>
                  {user?.name}
                </p>
                <p className="text-[10px] capitalize mt-0.5" style={{ color: 'rgba(255,255,255,0.48)' }}>
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header
          className="h-[54px] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shrink-0"
          style={{
            background:           'rgba(16,13,26,0.92)',
            backdropFilter:       'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            borderBottom:         '1px solid rgba(255,255,255,0.07)',
            boxShadow:            '0 4px 20px rgba(0,0,0,0.22)',
          }}
        >
          {/* Mobile menu */}
          <button
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-[9px]"
            style={{ color: 'rgba(255,255,255,0.58)', transition: 'background 0.15s, color 0.15s' }}
            data-testid="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.58)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <Menu size={18} />
          </button>

          {/* Page title — was 0.82, now clear white */}
          <div className="hidden lg:flex items-center">
            <h2
              className="capitalize font-semibold"
              style={{ fontSize: '14px', color: 'rgba(255,255,255,0.90)', letterSpacing: '0.01em' }}
            >
              {pageTitle(location.pathname)}
            </h2>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1 ml-auto">
            <Link
              to="/notifications"
              data-testid="header-notifications"
              className="w-8 h-8 flex items-center justify-center rounded-[9px]"
              style={{ color: 'rgba(255,255,255,0.58)', transition: 'background 0.15s, color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.58)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Bell size={17} />
            </Link>

            <div
              className="flex items-center gap-2.5 pl-3 ml-1"
              style={{ borderLeft: '1px solid rgba(255,255,255,0.09)' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ background: meta.gradient, boxShadow: `0 2px 6px ${meta.glow}` }}
              >
                {initials}
              </div>
              <div className="hidden sm:block">
                {/* was 0.84 / 0.35 — boosted secondary */}
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.90)', lineHeight: 1.3 }}>
                  {user?.name}
                </p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.50)' }} className="capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div
          className="flex-1 overflow-y-auto relative"
          style={{
            background: '#0e0c17',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(108,60,244,0.20) transparent',
          }}
        >
          {/* Ambient gradient — subtle, not overpowering */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                'radial-gradient(ellipse 65% 45% at 25% 15%, rgba(108,60,244,0.06) 0%, transparent 70%), ' +
                'radial-gradient(ellipse 45% 35% at 80% 75%, rgba(168,85,247,0.04) 0%, transparent 65%)',
            }}
          />
          <div className="relative z-10 p-4 lg:p-7 max-w-[1380px] mx-auto w-full">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
