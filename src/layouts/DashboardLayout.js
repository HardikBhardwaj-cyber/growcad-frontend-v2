import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, GraduationCap, Users, BookOpen,
  ClipboardCheck, CreditCard, FileText, BarChart3,
  Bell, Settings, LogOut, Menu, X, Megaphone, MessageSquare, Video
} from 'lucide-react';

const adminNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/students', label: 'Students', icon: GraduationCap },
  { path: '/teachers', label: 'Teachers', icon: Users },
  { path: '/batches', label: 'Batches', icon: BookOpen },
  { path: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { path: '/live-classes', label: 'Live Classes', icon: Video },
  { path: '/fees', label: 'Fees', icon: CreditCard },
  { path: '/tests', label: 'Tests', icon: FileText },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/announcements', label: 'Announcements', icon: Megaphone },
  { path: '/communication', label: 'Communication', icon: MessageSquare },
];

const teacherNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/batches', label: 'My Batches', icon: BookOpen },
  { path: '/students', label: 'Students', icon: GraduationCap },
  { path: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { path: '/live-classes', label: 'Live Classes', icon: Video },
  { path: '/tests', label: 'Tests', icon: FileText },
];

const studentNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/my-attendance', label: 'My Attendance', icon: ClipboardCheck },
  { path: '/my-fees', label: 'My Fees', icon: CreditCard },
  { path: '/my-tests', label: 'My Tests', icon: FileText },
  { path: '/live-classes', label: 'Live Classes', icon: Video },
  { path: '/announcements', label: 'Announcements', icon: Megaphone },
];

const adminBottom = [
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const otherBottom = [
  { path: '/notifications', label: 'Notifications', icon: Bell },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role || 'admin';
  const navItems = role === 'teacher' ? teacherNav : role === 'student' ? studentNav : adminNav;
  const bottomItems = role === 'admin' ? adminBottom : otherBottom;

  const NavLink = ({ item }) => {
    const active = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-[13px] font-medium transition-all duration-200 ${
          active
            ? 'bg-[#6C3CF4] text-white shadow-lg shadow-[#6C3CF4]/25'
            : 'text-[#8b85a0] hover:text-white hover:bg-white/[0.06]'
        }`}
      >
        <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
        {item.label}
      </Link>
    );
  };

  const roleLabel = role === 'admin' ? 'Administrator' : role === 'teacher' ? 'Teacher' : 'Student';
  const roleColor = role === 'admin' ? 'from-[#6C3CF4] to-[#a855f7]' : role === 'teacher' ? 'from-[#3b82f6] to-[#60a5fa]' : 'from-[#10b981] to-[#34d399]';

  return (
    <div className="flex h-screen overflow-hidden" data-testid="dashboard-layout">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#13111c] flex flex-col transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleColor} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <div>
              <span className="text-[15px] font-bold text-white tracking-tight block leading-tight">Growcad</span>
              <span className="text-[9px] text-white/30 font-medium uppercase tracking-widest">{roleLabel}</span>
            </div>
          </div>
          <button className="ml-auto lg:hidden text-white/60" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="px-3 mt-5 text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2 pl-4">
          {role === 'admin' ? 'Main Menu' : role === 'teacher' ? 'Teacher Panel' : 'Student Panel'}
        </div>
        <nav className="flex-1 px-3 overflow-y-auto scrollbar-thin">
          {navItems.map(item => <NavLink key={item.path} item={item} />)}
        </nav>

        <div className="px-3 pb-2">
          <div className="border-t border-white/[0.06] pt-2 mb-2">
            {bottomItems.map(item => <NavLink key={item.path} item={item} />)}
          </div>
          <button
            onClick={logout}
            data-testid="nav-logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#8b85a0] hover:text-red-400 hover:bg-red-500/[0.08] w-full transition-colors"
          >
            <LogOut size={18} strokeWidth={1.8} /> Logout
          </button>

          <div className="flex items-center gap-3 px-3 py-3 mt-1 rounded-lg bg-white/[0.04]">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-white/40 truncate capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#f6f5fb]">
        <header className="h-14 bg-white border-b border-gray-200/80 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shrink-0">
          <button
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg"
            data-testid="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-sm font-semibold text-[#1a1625] capitalize">
              {location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Link
              to="/notifications"
              data-testid="header-notifications"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={18} className="text-gray-500" />
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-[11px] font-bold`}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-medium text-gray-700 block leading-tight">{user?.name}</span>
                <span className="text-[9px] text-gray-400 capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="animate-fade-in">{children}</div>
        </div>
      </main>
    </div>
  );
}
