/**
 * src/App.js
 *
 * CHANGES vs previous version:
 *   + /payment-success  → PaymentSuccessPage  (Razorpay success)
 *   + /pending-approval → PendingApprovalPage (cash awaiting approval)
 *
 * All other routes unchanged.
 */

import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, detectSubdomain } from '@/contexts/AuthContext';

import DashboardLayout      from '@/layouts/DashboardLayout';
import LoginPage            from '@/pages/LoginPage';
import SubdomainLoginPage   from '@/pages/SubDomainLoginPage';
import SignupPage           from '@/pages/SignupPage';
import OTPVerificationPage  from '@/pages/OTPVerificationPage';
import OnboardingPage       from '@/pages/OnboardingPage';
import PlanSelectionPage    from '@/pages/PlanSelectionPage';
import PaymentSuccessPage   from '@/pages/PaymentSuccessPage';
import PendingApprovalPage  from '@/pages/PendingApprovalPage';
import SuperAdminDashboardPage from '@/pages/SuperAdminDashboardPage';

import DashboardPage        from '@/pages/DashboardPage';
import StudentsPage         from '@/pages/StudentsPage';
import TeachersPage         from '@/pages/TeachersPage';
import BatchesPage          from '@/pages/BatchesPage';
import AttendancePage       from '@/pages/AttendancePage';
import FeesPage             from '@/pages/FeesPage';
import TestsPage            from '@/pages/TestsPage';
import QuestionBankPage     from '@/pages/QuestionBankPage';
import StudyMaterialPage    from '@/pages/StudyMaterialPage';
import ReportsPage          from '@/pages/ReportsPage';
import NotificationsPage    from '@/pages/NotificationsPage';
import SettingsPage         from '@/pages/SettingsPage';
import MyAttendancePage     from '@/pages/MyAttendancePage';
import MyFeesPage           from '@/pages/MyFeesPage';
import MyTestsPage          from '@/pages/MyTestsPage';
import StudentProfilePage   from '@/pages/StudentProfilePage';
import AnnouncementsPage    from '@/pages/AnnouncementsPage';
import CommunicationPage    from '@/pages/CommunicationPage';
import LiveClassesPage      from '@/pages/LiveClassesPage';

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f5fb]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-[3px] border-[#6C3CF4] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-400 font-medium">Loading…</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const slug = detectSubdomain();
  if (loading) return <Spinner />;
  if (!user)   return <Navigate to={slug ? '/' : '/login'} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/dashboard" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function OnboardingRoute({ children }) {
  const { user, loading, institute } = useAuth();
  const slug = detectSubdomain();
  if (loading) return <Spinner />;
  if (slug) return <Navigate to="/" replace />;
  if (!user) return children;
  if (!institute) return children;

  const status = institute?.subscriptionStatus;
  if (status === 'pending' || status === 'pending_approval' || status === 'rejected') {
    return children;
  }
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const slug = detectSubdomain();
  if (loading) return <Spinner />;

  return (
    <Routes>
      {/* ── Auth ─────────────────────────────────────────────────────────── */}
      <Route path="/login" element={
        user ? <Navigate to="/dashboard" replace />
             : slug ? <Navigate to="/" replace />
             : <LoginPage />
      } />
      <Route path="/" element={
        user ? <Navigate to="/dashboard" replace />
             : slug ? <SubdomainLoginPage />
             : <Navigate to="/login" replace />
      } />

      {/* ── Onboarding flow ──────────────────────────────────────────────── */}
      <Route path="/signup" element={<OnboardingRoute><SignupPage /></OnboardingRoute>} />
      <Route path="/verify-otp" element={<OnboardingRoute><OTPVerificationPage /></OnboardingRoute>} />
      <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />
      <Route path="/pricing" element={<OnboardingRoute><PlanSelectionPage /></OnboardingRoute>} />
      <Route path="/payment-success" element={<OnboardingRoute><PaymentSuccessPage /></OnboardingRoute>} />
      <Route path="/pending-approval" element={<OnboardingRoute><PendingApprovalPage /></OnboardingRoute>} />

      {/* ── Authenticated — all roles ─────────────────────────────────────── */}
      <Route path="/dashboard"     element={<ProtectedRoute>{user?.role === 'superadmin' ? <SuperAdminDashboardPage /> : <DashboardPage />}</ProtectedRoute>} />
      <Route path="/super-admin"   element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboardPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />
      <Route path="/live-classes"  element={<ProtectedRoute><LiveClassesPage /></ProtectedRoute>} />
      <Route path="/study-material" element={<ProtectedRoute allowedRoles={['admin','teacher','student']}><StudyMaterialPage /></ProtectedRoute>} />

      {/* ── Admin only ───────────────────────────────────────────────────── */}
      <Route path="/teachers"      element={<ProtectedRoute allowedRoles={['admin']}><TeachersPage /></ProtectedRoute>} />
      <Route path="/fees"          element={<ProtectedRoute allowedRoles={['admin']}><FeesPage /></ProtectedRoute>} />
      <Route path="/reports"       element={<ProtectedRoute allowedRoles={['admin']}><ReportsPage /></ProtectedRoute>} />
      <Route path="/settings"      element={<ProtectedRoute allowedRoles={['admin']}><SettingsPage /></ProtectedRoute>} />
      <Route path="/communication" element={<ProtectedRoute allowedRoles={['admin']}><CommunicationPage /></ProtectedRoute>} />

      {/* ── Admin + Teacher ──────────────────────────────────────────────── */}
      <Route path="/students"     element={<ProtectedRoute allowedRoles={['admin','teacher']}><StudentsPage /></ProtectedRoute>} />
      <Route path="/students/:id" element={<ProtectedRoute allowedRoles={['admin','teacher']}><StudentProfilePage /></ProtectedRoute>} />
      <Route path="/batches"      element={<ProtectedRoute allowedRoles={['admin','teacher']}><BatchesPage /></ProtectedRoute>} />
      <Route path="/attendance"   element={<ProtectedRoute allowedRoles={['admin','teacher']}><AttendancePage /></ProtectedRoute>} />
      <Route path="/tests"        element={<ProtectedRoute allowedRoles={['admin','teacher']}><TestsPage /></ProtectedRoute>} />
      <Route path="/question-bank" element={<ProtectedRoute allowedRoles={['admin','teacher']}><QuestionBankPage /></ProtectedRoute>} />

      {/* ── Student only ─────────────────────────────────────────────────── */}
      <Route path="/my-attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendancePage /></ProtectedRoute>} />
      <Route path="/my-fees"       element={<ProtectedRoute allowedRoles={['student']}><MyFeesPage /></ProtectedRoute>} />
      <Route path="/my-tests"      element={<ProtectedRoute allowedRoles={['student']}><MyTestsPage /></ProtectedRoute>} />

      {/* ── Catch-all ────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : (slug ? '/' : '/login')} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
