import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { PageSpinner } from './components/common/Spinner';
import ProtectedRoute from './components/guards/ProtectedRoute';
import RoleGuard from './components/guards/RoleGuard';

// Public
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Customer
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const CreateRequestPage = lazy(() => import('./pages/customer/CreateRequestPage'));
const ActiveRequestsPage = lazy(() => import('./pages/customer/ActiveRequestsPage'));
const RequestDetailPage = lazy(() => import('./pages/customer/RequestDetailPage'));
const RequestHistoryPage = lazy(() => import('./pages/customer/RequestHistoryPage'));

// Technician
const TechnicianDashboard = lazy(() => import('./pages/technician/TechnicianDashboard'));
const AvailableRequestsPage = lazy(() => import('./pages/technician/AvailableRequestsPage'));
const AssignedJobsPage = lazy(() => import('./pages/technician/AssignedJobsPage'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTechniciansPage = lazy(() => import('./pages/admin/AdminTechniciansPage'));
const AdminRequestsPage = lazy(() => import('./pages/admin/AdminRequestsPage'));
const AdminActivityLogPage = lazy(() => import('./pages/admin/AdminActivityLogPage'));

// Shared
const NotificationsPage = lazy(() => import('./pages/shared/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/shared/ProfilePage'));
const AboutPage = lazy(() => import('./pages/shared/AboutPage'));
const HowToUsePage = lazy(() => import('./pages/shared/HowToUsePage'));
const SettingsPage = lazy(() => import('./pages/shared/SettingsPage'));

import { AuthRequiredModal } from './components/common';

function AppRoutes() {
  const { isAuthenticated, isGuest, user } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return '/';
    const routes = { CUSTOMER: '/customer/dashboard', TECHNICIAN: '/technician/dashboard', ADMIN: '/admin/dashboard' };
    return routes[user.role] || '/';
  };

  const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

  return (
    <>
      <AuthRequiredModal />
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : isGuest ? <LandingPage /> : <LoginPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <RegisterPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-to-use" element={<HowToUsePage />} />

          {/* Customer */}
          <Route path="/customer/dashboard" element={<P><RoleGuard roles={['CUSTOMER']}><CustomerDashboard /></RoleGuard></P>} />
          <Route path="/customer/requests/new" element={<P><RoleGuard roles={['CUSTOMER']}><CreateRequestPage /></RoleGuard></P>} />
          <Route path="/customer/requests/active" element={<P><RoleGuard roles={['CUSTOMER']}><ActiveRequestsPage /></RoleGuard></P>} />
          <Route path="/customer/requests/history" element={<P><RoleGuard roles={['CUSTOMER']}><RequestHistoryPage /></RoleGuard></P>} />
          <Route path="/customer/requests/:id" element={<P><RoleGuard roles={['CUSTOMER']}><RequestDetailPage /></RoleGuard></P>} />
          <Route path="/customer/notifications" element={<P><RoleGuard roles={['CUSTOMER']}><NotificationsPage /></RoleGuard></P>} />
          <Route path="/customer/profile" element={<P><RoleGuard roles={['CUSTOMER']}><ProfilePage /></RoleGuard></P>} />
          <Route path="/customer/about" element={<P><RoleGuard roles={['CUSTOMER']}><AboutPage /></RoleGuard></P>} />
          <Route path="/customer/how-to-use" element={<P><RoleGuard roles={['CUSTOMER']}><HowToUsePage /></RoleGuard></P>} />
          <Route path="/customer/settings" element={<P><RoleGuard roles={['CUSTOMER']}><SettingsPage /></RoleGuard></P>} />

          {/* Technician */}
          <Route path="/technician/dashboard" element={<P><RoleGuard roles={['TECHNICIAN']}><TechnicianDashboard /></RoleGuard></P>} />
          <Route path="/technician/requests/available" element={<P><RoleGuard roles={['TECHNICIAN']}><AvailableRequestsPage /></RoleGuard></P>} />
          <Route path="/technician/jobs/assigned" element={<P><RoleGuard roles={['TECHNICIAN']}><AssignedJobsPage /></RoleGuard></P>} />
          <Route path="/technician/notifications" element={<P><RoleGuard roles={['TECHNICIAN']}><NotificationsPage /></RoleGuard></P>} />
          <Route path="/technician/profile" element={<P><RoleGuard roles={['TECHNICIAN']}><ProfilePage /></RoleGuard></P>} />
          <Route path="/technician/about" element={<P><RoleGuard roles={['TECHNICIAN']}><AboutPage /></RoleGuard></P>} />
          <Route path="/technician/how-to-use" element={<P><RoleGuard roles={['TECHNICIAN']}><HowToUsePage /></RoleGuard></P>} />
          <Route path="/technician/settings" element={<P><RoleGuard roles={['TECHNICIAN']}><SettingsPage /></RoleGuard></P>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<P><RoleGuard roles={['ADMIN']}><AdminDashboard /></RoleGuard></P>} />
          <Route path="/admin/technicians" element={<P><RoleGuard roles={['ADMIN']}><AdminTechniciansPage /></RoleGuard></P>} />
          <Route path="/admin/requests" element={<P><RoleGuard roles={['ADMIN']}><AdminRequestsPage /></RoleGuard></P>} />
          <Route path="/admin/activity-log" element={<P><RoleGuard roles={['ADMIN']}><AdminActivityLogPage /></RoleGuard></P>} />
          <Route path="/admin/notifications" element={<P><RoleGuard roles={['ADMIN']}><NotificationsPage /></RoleGuard></P>} />
          <Route path="/admin/profile" element={<P><RoleGuard roles={['ADMIN']}><ProfilePage /></RoleGuard></P>} />
          <Route path="/admin/about" element={<P><RoleGuard roles={['ADMIN']}><AboutPage /></RoleGuard></P>} />
          <Route path="/admin/how-to-use" element={<P><RoleGuard roles={['ADMIN']}><HowToUsePage /></RoleGuard></P>} />
          <Route path="/admin/settings" element={<P><RoleGuard roles={['ADMIN']}><SettingsPage /></RoleGuard></P>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return <AppRoutes />;
}
