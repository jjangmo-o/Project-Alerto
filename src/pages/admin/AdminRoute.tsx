import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { ReactNode } from 'react';

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Not logged in = block
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // temporary: allow any authenticated user
  return <>{children}</>;
};

export default AdminRoute;