import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import AuthLayout from '../../components/layouts/AuthLayout';
import authService from '../../services/auth.service';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // If no token in URL, show error immediately
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const validate = () => {
    const newErrors = {};
    if (!form.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword)) {
      newErrors.newPassword = 'Must contain uppercase, lowercase, and a number';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMessage('');
    try {
      await authService.resetPassword(token, form.newPassword);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err.response?.data?.message ||
        'Failed to reset password. The link may have expired or already been used.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-surface-900 tracking-tight">
                Reset Password
              </h2>
              <p className="text-xs text-surface-500">Set your new FixIt account password</p>
            </div>
          </div>
        </div>

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center py-6 space-y-4">
            <div className="flex justify-center">
              <div className="w-18 h-18 rounded-2xl bg-green-50 dark:bg-green-950/40 p-5 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                Password Reset Successful!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your password has been updated. You'll be automatically signed out of all other devices.
                Please log in with your new password.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors cursor-pointer"
            >
              Go to Sign In
            </button>
          </div>
        )}

        {/* Error State (invalid token) */}
        {status === 'error' && (
          <div className="text-center py-6 space-y-4">
            <div className="flex justify-center">
              <div className="w-18 h-18 rounded-2xl bg-red-50 dark:bg-red-950/40 p-5 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                Link Invalid or Expired
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <Link
              to="/login"
              className="block w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors cursor-pointer flex items-center justify-center"
            >
              Back to Sign In
            </Link>
          </div>
        )}

        {/* Form State */}
        {status === 'idle' && token && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter and confirm your new password below.
              Password must be at least 8 characters and include uppercase, lowercase, and a number.
            </p>

            {/* New Password */}
            <div className="space-y-1">
              <label htmlFor="newPassword" className="block text-[11px] font-bold text-surface-700 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPw ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoFocus
                  autoComplete="new-password"
                  className={`w-full pl-9 pr-9 h-10 rounded-xl border bg-white dark:bg-surface-200 text-sm text-surface-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.newPassword ? 'border-red-400 focus:ring-red-400' : 'border-surface-200 dark:border-surface-300 hover:border-surface-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-[11px] text-red-500 animate-slide-up">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-[11px] font-bold text-surface-700 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPw ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`w-full pl-9 pr-9 h-10 rounded-xl border bg-white dark:bg-surface-200 text-sm text-surface-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-surface-200 dark:border-surface-300 hover:border-surface-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-500 animate-slide-up">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting Password…
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                ← Back to Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
