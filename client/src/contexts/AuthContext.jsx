import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('isGuest') === 'true';
  });
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    title: 'Sign in required',
    message: 'Create an account or sign in to continue with this action.',
    returnUrl: null,
  });
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await authService.getMe();
          const payload = response.data || response;
          setUser(payload.user || payload);
          setIsGuest(false);
          localStorage.removeItem('isGuest');
        } catch {
          localStorage.removeItem('accessToken');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Listen for forced logout from API interceptor
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setIsGuest(false);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('isGuest');
      navigate('/login');
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [navigate]);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    const payload = response.data || response;
    const userData = payload.user || payload;
    const accessToken = payload.accessToken || response.accessToken;
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    localStorage.removeItem('isGuest');
    setUser(userData);
    setIsGuest(false);

    // Navigate based on role
    const roleRoutes = {
      CUSTOMER: '/customer/dashboard',
      TECHNICIAN: '/technician/dashboard',
      ADMIN: '/admin/dashboard',
    };
    navigate(roleRoutes[userData?.role] || '/');
    toast.success(`Welcome back, ${userData?.firstName || 'User'}!`);
    return response;
  }, [navigate]);

  const register = useCallback(async (userDataInput) => {
    const response = await authService.register(userDataInput);
    const payload = response.data || response;
    const newUser = payload.user || payload;
    const accessToken = payload.accessToken || response.accessToken;
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    localStorage.removeItem('isGuest');
    setUser(newUser);
    setIsGuest(false);

    const roleRoutes = {
      CUSTOMER: '/customer/dashboard',
      TECHNICIAN: '/technician/dashboard',
      ADMIN: '/admin/dashboard',
    };
    navigate(roleRoutes[newUser?.role] || '/');
    toast.success('Account created successfully!');
    return response;
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Continue with local cleanup even if API fails
    }
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('isGuest');
    navigate('/login');
    toast.success('Logged out successfully');
  }, [navigate]);

  const continueAsGuest = useCallback(() => {
    setUser(null);
    setIsGuest(true);
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem('accessToken');
    toast('Browsing in Guest Mode', { icon: '👀' });
    navigate('/');
  }, [navigate]);

  const exitGuestMode = useCallback(() => {
    setIsGuest(false);
    localStorage.removeItem('isGuest');
  }, []);

  const openAuthModal = useCallback((options = {}) => {
    setAuthModal({
      isOpen: true,
      title: options.title || 'Sign in required',
      message: options.message || 'Create an account or sign in to continue with this action.',
      returnUrl: options.returnUrl || null,
    });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isGuest,
    continueAsGuest,
    exitGuestMode,
    authModal,
    openAuthModal,
    closeAuthModal,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'CUSTOMER',
    isTechnician: user?.role === 'TECHNICIAN',
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
