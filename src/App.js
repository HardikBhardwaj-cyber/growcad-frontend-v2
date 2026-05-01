import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import StudentsPage from "@/pages/StudentsPage";
import TeachersPage from "@/pages/TeachersPage";
import BatchesPage from "@/pages/BatchesPage";
import AttendancePage from "@/pages/AttendancePage";
import FeesPage from "@/pages/FeesPage";
import TestsPage from "@/pages/TestsPage";
import ReportsPage from "@/pages/ReportsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SettingsPage from "@/pages/SettingsPage";
import MyAttendancePage from "@/pages/MyAttendancePage";
import MyFeesPage from "@/pages/MyFeesPage";
import MyTestsPage from "@/pages/MyTestsPage";
import StudentProfilePage from "@/pages/StudentProfilePage";
import AnnouncementsPage from "@/pages/AnnouncementsPage";
import CommunicationPage from "@/pages/CommunicationPage";
import LiveClassesPage from "@/pages/LiveClassesPage";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f5fb]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-[3px] border-[#6C3CF4] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-medium">Loading...</span>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f5fb]">
        <div className="w-9 h-9 border-[3px] border-[#6C3CF4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />

      {/* All roles */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />

      {/* Admin only */}
      <Route path="/teachers" element={<ProtectedRoute allowedRoles={['admin']}><TeachersPage /></ProtectedRoute>} />
      <Route path="/fees" element={<ProtectedRoute allowedRoles={['admin']}><FeesPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><ReportsPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><SettingsPage /></ProtectedRoute>} />
      <Route path="/communication" element={<ProtectedRoute allowedRoles={['admin']}><CommunicationPage /></ProtectedRoute>} />
      <Route path="/live-classes" element={<ProtectedRoute><LiveClassesPage /></ProtectedRoute>} />

      {/* Admin + Teacher */}
      <Route path="/students" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><StudentsPage /></ProtectedRoute>} />
      <Route path="/students/:id" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><StudentProfilePage /></ProtectedRoute>} />
      <Route path="/batches" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><BatchesPage /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><AttendancePage /></ProtectedRoute>} />
      <Route path="/tests" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><TestsPage /></ProtectedRoute>} />

      {/* Student only */}
      <Route path="/my-attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendancePage /></ProtectedRoute>} />
      <Route path="/my-fees" element={<ProtectedRoute allowedRoles={['student']}><MyFeesPage /></ProtectedRoute>} />
      <Route path="/my-tests" element={<ProtectedRoute allowedRoles={['student']}><MyTestsPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
