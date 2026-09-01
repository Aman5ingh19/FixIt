import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RoleGuard({ roles, children }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    // Redirect to the correct dashboard for the user's role
    const roleRoutes = {
      CUSTOMER: '/customer/dashboard',
      TECHNICIAN: '/technician/dashboard',
      ADMIN: '/admin/dashboard',
    };
    return <Navigate to={roleRoutes[user?.role] || '/login'} replace />;
  }

  return children;
}
