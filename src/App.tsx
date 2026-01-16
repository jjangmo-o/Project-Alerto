import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';

import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserLayout from './pages/UserLayout';
import Dashboard from './pages/Dashboard';
import EmergencyHotlines from './pages/EmergencyHotlines';
import Notifications from './pages/Notifications';
import Residence from './pages/Residence';
import CommunityStatus from './pages/CommunityStatus';
import './App.css';

import AdminRoute from './pages/admin/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCommunityStatus from './pages/admin/AdminCommunityStatus';
import AdminVerification from './pages/admin/AdminVerification'; // ✅ ADDED

/* ================= LOADING ================= */

const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-spinner" />
    <p>Loading...</p>
  </div>
);

/* ================= ROUTE GUARDS ================= */

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

/* ================= ROUTES ================= */

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* ROOT - Welcome/Landing Page */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <Welcome />}
      />

      {/* ================= ADMIN ROUTES ================= */}

      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/community-status"
        element={
          <AdminRoute>
            <AdminCommunityStatus />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/verification"
        element={
          <AdminRoute>
            <AdminVerification />
          </AdminRoute>
        }
      />

      {/* ================= PUBLIC ROUTES ================= */}

      {/* Welcome page - accessible anytime for testing */}
      <Route path="/welcome" element={<Welcome />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ================= USER ROUTES ================= */}
      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hotlines" element={<EmergencyHotlines />} />
        <Route path="/residence" element={<Residence />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/community-status" element={<CommunityStatus />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/* ================= APP ROOT ================= */

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;