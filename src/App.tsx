import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import EmergencyHotlines from './pages/EmergencyHotlines';
import Notifications from './pages/Notifications';
import Residence from './pages/Residence';
import CommunityStatus from './pages/CommunityStatus';
import './App.css';

import AdminRoute from './pages/admin/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCommunityStatus from './pages/admin/AdminCommunityStatus'; // ✅ ADD THIS

import EvacuationMap from './pages/EvacuationMap';

const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-spinner" />
    <p>Loading...</p>
  </div>
);

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

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* Root */}
      <Route
        path="/"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />

      {/* ADMIN ROUTES */}
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

      {/* PUBLIC */}
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

      {/* PROTECTED USER ROUTES */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hotlines"
        element={
          <ProtectedRoute>
            <EmergencyHotlines />
          </ProtectedRoute>
        }
      />

      <Route
        path="/residence"
        element={
          <ProtectedRoute>
            <Residence />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <EvacuationMap />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/community-status"
        element={
          <ProtectedRoute>
            <CommunityStatus />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

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
