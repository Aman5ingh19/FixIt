import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, X, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/layouts/AuthLayout';
import { Button } from '../../components/common';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';

// ── Forgot Password Modal ──────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60">
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Forgot Password?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">We'll email you a reset link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {sent ? (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Check your inbox!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  If <span className="font-semibold text-blue-600 dark:text-blue-400">{email}</span> is registered,
                  you'll receive a password reset link within a minute.
                  <br /><br />
                  The link expires in <strong className="text-slate-700 dark:text-slate-200">15 minutes</strong>.
                  Check your spam folder if you don't see it.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Enter your registered email address and we'll send you a secure link to reset your password.
              </p>
              <div className="space-y-1.5">
                <label htmlFor="fp-email" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="fp-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    autoFocus
                    autoComplete="email"
                    className={`w-full pl-9 pr-3 h-10 rounded-xl border text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      error ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  />
                </div>
                {error && (
                  <p className="text-[11px] text-red-500 animate-slide-up">{error}</p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Login Page ─────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login, continueAsGuest } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.message === 'Network Error' || !error.response
          ? 'Cannot connect to server. Please check your network or server connection.'
          : 'Invalid email or password. Please try again.');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-0.5">
          <h2 className="text-xl font-extrabold text-surface-900 dark:text-surface-900 tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs text-surface-500 dark:text-surface-600">
            Sign in to manage service requests or technician jobs.
          </p>
        </div>

        {/* Compact Quick Demo Credentials */}
        <div className="p-2.5 rounded-xl bg-surface-100 dark:bg-surface-200/60 border border-surface-200 dark:border-surface-300">
          <p className="text-[10px] font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span>⚡</span> Quick Demo Logins
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setForm({ email: 'admin@fixit.com', password: 'Password123!', rememberMe: true })}
              className="px-1.5 py-1.5 rounded-lg bg-white dark:bg-surface-200 border border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-[11px] font-bold transition-all text-center cursor-pointer shadow-2xs truncate"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => setForm({ email: 'tech@fixit.com', password: 'Password123!', rememberMe: true })}
              className="px-1.5 py-1.5 rounded-lg bg-white dark:bg-surface-200 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] font-bold transition-all text-center cursor-pointer shadow-2xs truncate"
            >
              🔧 Technician
            </button>
            <button
              type="button"
              onClick={() => setForm({ email: 'customer@fixit.com', password: 'Password123!', rememberMe: true })}
              className="px-1.5 py-1.5 rounded-lg bg-white dark:bg-surface-200 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[11px] font-bold transition-all text-center cursor-pointer shadow-2xs truncate"
            >
              👤 Customer
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-[11px] font-bold text-surface-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={`
                  w-full pl-9 pr-3 h-10 rounded-xl border bg-white dark:bg-surface-200 text-xs sm:text-sm text-surface-900 placeholder:text-surface-400
                  transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                  ${errors.email ? 'border-danger-400 focus:ring-danger-400' : 'border-surface-200 dark:border-surface-300 hover:border-surface-300'}
                `}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-danger-600 animate-slide-up mt-0.5">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="password" className="block text-[11px] font-bold text-surface-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-medium text-primary-600 hover:text-primary-700 hover:underline shrink-0 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`
                  w-full pl-9 pr-9 h-10 rounded-xl border bg-white dark:bg-surface-200 text-xs sm:text-sm text-surface-900 placeholder:text-surface-400
                  transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                  ${errors.password ? 'border-danger-400 focus:ring-danger-400' : 'border-surface-200 dark:border-surface-300 hover:border-surface-300'}
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-400 hover:text-surface-600 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-danger-600 animate-slide-up mt-0.5">{errors.password}</p>
            )}
          </div>

          {/* Remember me */}
          <div className="flex items-center pt-0.5">
            <label className="flex items-center gap-2 text-xs text-surface-600 cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
                className="w-3.5 h-3.5 rounded text-primary-600 border-surface-300 focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-xs">Remember me on this device</span>
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            loading={loading}
            fullWidth
            size="md"
            className="h-10 font-bold shadow-xs mt-1 text-sm"
          >
            Sign In
          </Button>

          {/* Divider */}
          <div className="relative my-2.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200 dark:border-surface-300/80" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white dark:bg-[#151F32] px-2 text-surface-400 font-medium">or</span>
            </div>
          </div>

          {/* Guest */}
          <button
            type="button"
            onClick={continueAsGuest}
            className="w-full h-10 rounded-xl border border-surface-200 dark:border-surface-300 bg-surface-50 dark:bg-surface-200 hover:bg-surface-100 dark:hover:bg-surface-300 text-surface-800 dark:text-surface-900 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            Continue as Guest
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-surface-500 dark:text-surface-400 pt-0.5">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline transition-colors"
          >
            Create account
          </Link>
        </p>

        {/* ── Built by - Aman Singh Signature ── */}
        <div className="pt-3 border-t border-surface-200/80 dark:border-surface-300/60 flex items-center justify-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
          <span>Built by —</span>
          <span className="font-black text-surface-900 dark:text-surface-900 tracking-wide">Aman Singh</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
    </AuthLayout>
  );
}
