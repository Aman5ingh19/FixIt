import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageSpinner } from '../common/Spinner';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, isGuest, openAuthModal } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      openAuthModal({
        title: 'Sign in required',
        message: 'You need an active FixIt account to access this page or perform this action.',
        returnUrl: location.pathname + location.search,
      });
    }
  }, [loading, isAuthenticated, openAuthModal, location]);

  if (loading) {
    return <PageSpinner />;
  }

  if (!isAuthenticated) {
    if (isGuest) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
