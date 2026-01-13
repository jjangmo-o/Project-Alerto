import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AdminRouteProps {
  children: JSX.Element;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return null; // or spinner later
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but NOT admin
  if (!profile || !profile.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin confirmed
  return children;
};

export default AdminRoute;