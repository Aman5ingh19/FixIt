import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, Wrench, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/layouts/AuthLayout';
import { Button } from '../../components/common';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register, continueAsGuest } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: searchParams.get('role') === 'TECHNICIAN' ? 'TECHNICIAN' : 'CUSTOMER',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'TECHNICIAN' || roleParam === 'CUSTOMER') {
      setForm((prev) => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = 'Must contain uppercase, lowercase & number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(form);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.message === 'Network Error' || !error.response
          ? 'Cannot connect to server. Please check your network or server connection.'
          : 'Registration failed. Please try again.');
      toast.error(message);
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-5 sm:space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-900 tracking-tight">Create your account</h2>
        <p className="text-sm text-surface-500 dark:text-surface-600">Get started with FixIt in just a minute.</p>
      </div>

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-surface-600 dark:text-surface-600 uppercase tracking-wider">Account Type</label>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'CUSTOMER' })}
                className={`
                  p-3.5 rounded-xl border text-left transition-all duration-150
                  ${
                    form.role === 'CUSTOMER'
                      ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-900/20 ring-2 ring-primary-500/20'
                      : 'border-surface-200 dark:border-surface-300 hover:border-surface-300 bg-white dark:bg-surface-200'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <UserCheck className={`w-4 h-4 ${form.role === 'CUSTOMER' ? 'text-primary-600' : 'text-surface-400'}`} />
                  <span className={`w-2 h-2 rounded-full transition-colors ${form.role === 'CUSTOMER' ? 'bg-primary-600' : 'bg-surface-200'}`} />
                </div>
                <p className={`text-xs font-bold ${form.role === 'CUSTOMER' ? 'text-primary-700 dark:text-primary-400' : 'text-surface-800 dark:text-surface-800'}`}>Customer</p>
                <p className="text-[11px] text-surface-500 dark:text-surface-600 mt-0.5">I need services</p>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'TECHNICIAN' })}
                className={`
                  p-3.5 rounded-xl border text-left transition-all duration-150
                  ${
                    form.role === 'TECHNICIAN'
                      ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-900/20 ring-2 ring-primary-500/20'
                      : 'border-surface-200 dark:border-surface-300 hover:border-surface-300 bg-white dark:bg-surface-200'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Wrench className={`w-4 h-4 ${form.role === 'TECHNICIAN' ? 'text-primary-600' : 'text-surface-400'}`} />
                  <span className={`w-2 h-2 rounded-full transition-colors ${form.role === 'TECHNICIAN' ? 'bg-primary-600' : 'bg-surface-200'}`} />
                </div>
                <p className={`text-xs font-bold ${form.role === 'TECHNICIAN' ? 'text-primary-700 dark:text-primary-400' : 'text-surface-800 dark:text-surface-800'}`}>Technician</p>
                <p className="text-[11px] text-surface-500 dark:text-surface-600 mt-0.5">I provide services</p>
              </button>
            </div>
          </div>

          {/* First & Last Name Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label htmlFor="firstName" className="block text-xs font-semibold text-surface-600 dark:text-surface-600 uppercase tracking-wider">First Name</label>
              <div className="relative">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  autoComplete="given-name"
                  className={`
                    w-full px-3 h-11 rounded-xl border bg-white dark:bg-surface-200 text-sm text-surface-900 dark:text-surface-900 placeholder:text-surface-400
                    transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    ${errors.firstName ? 'border-danger-400 focus:ring-danger-400' : 'border-surface-200 dark:border-surface-300 hover:border-surface-300'}
                  `}
                />
              </div>
              {errors.firstName && (
                <p className="text-[11px] text-danger-600 animate-slide-up break-words">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="lastName" className="block text-xs font-semibold text-surface-600 dark:text-surface-600 uppercase tracking-wider">Last Name</label>
              <div className="relative">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  autoComplete="family-name"
                  className={`
                    w-full px-3 h-11 rounded-xl border bg-white dark:bg-surface-200 text-sm text-surface-900 dark:text-surface-900 placeholder:text-surface-400
                    transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    ${errors.lastName ? 'border-danger-400 focus:ring-danger-400' : 'border-surface-200 dark:border-surface-300 hover:border-surface-300'}
                  `}
                />
              </div>
              {errors.lastName && (
                <p className="text-[11px] text-danger-600 animate-slide-up break-words">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-xs font-semibold text-surface-600 dark:text-surface-600 uppercase tracking-wider">Email Address</label>
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
                  w-full pl-9 pr-3 h-11 rounded-xl border bg-white dark:bg-surface-200 text-sm text-surface-900 dark:text-surface-900 placeholder:text-surface-400
                  transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                  ${errors.email ? 'border-danger-400 focus:ring-danger-400' : 'border-surface-200 dark:border-surface-300 hover:border-surface-300'}
                `}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-danger-600 animate-slide-up break-words">{errors.email}</p>
            )}
          </div>

          {/* Phone field (optional) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="phone" className="block text-xs font-semibold text-surface-600 dark:text-surface-600 uppercase tracking-wider">Phone Number</label>
              <span className="text-[11px] text-surface-400 dark:text-surface-500">Optional</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                className="w-full pl-9 pr-3 h-11 rounded-xl border border-surface-200 dark:border-surface-300 hover:border-surface-300 bg-white dark:bg-surface-200 text-sm text-surface-900 dark:text-surface-900 placeholder:text-surface-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-xs font-semibold text-surface-600 dark:text-surface-600 uppercase tracking-wider">Password</label>
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
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className={`
                  w-full pl-9 pr-9 h-11 rounded-xl border bg-white dark:bg-surface-200 text-sm text-surface-900 dark:text-surface-900 placeholder:text-surface-400
                  transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                  ${errors.password ? 'border-danger-400 focus:ring-danger-400' : 'border-surface-200 dark:border-surface-300 hover:border-surface-300'}
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-400 hover:text-surface-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-danger-600 animate-slide-up break-words">{errors.password}</p>
            )}
          </div>

          {/* Primary Submit Button */}
          <Button
            type="submit"
            loading={loading}
            fullWidth
            size="lg"
            className="h-11 font-semibold shadow-sm mt-3"
          >
            Create Account
          </Button>

          {/* Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#151F32] px-2 text-surface-400 dark:text-surface-500 font-medium">or</span>
            </div>
          </div>

          {/* Continue as Guest Button */}
          <button
            type="button"
            onClick={continueAsGuest}
            className="w-full h-10 rounded-xl border border-surface-200 dark:border-surface-300 bg-surface-50 dark:bg-surface-200 hover:bg-surface-100 dark:hover:bg-surface-300 text-surface-800 dark:text-surface-900 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            Continue as Guest
          </button>
        </form>

        {/* Sign in footer link */}
        <p className="text-center text-xs text-surface-500 dark:text-surface-400 pt-0.5">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>

        {/* ── Built by - Aman Singh Signature ── */}
        <div className="pt-3 border-t border-surface-200/80 dark:border-surface-300/60 flex items-center justify-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
          <span>Built by —</span>
          <span className="font-black text-surface-900 dark:text-surface-900 tracking-wide">Aman Singh</span>
        </div>
      </div>
    </AuthLayout>
  );
}
