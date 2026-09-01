import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Save, Shield, Key, Wrench, Briefcase, Award, MapPin, CheckCircle2, Camera, Trash2, Upload, Sparkles, Image } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Card, Button, Input, Avatar, Badge } from '../../components/common';
import { PageSpinner } from '../../components/common/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/auth.service';
import technicianApi from '../../services/technician.api';
import toast from 'react-hot-toast';

const PRESET_AVATARS = [
  { id: '1', label: 'Electrician', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=250&auto=format&fit=crop&q=80' },
  { id: '2', label: 'Plumber', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=250&auto=format&fit=crop&q=80' },
  { id: '3', label: 'HVAC Expert', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=250&auto=format&fit=crop&q=80' },
  { id: '4', label: 'Appliance Tech', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=250&auto=format&fit=crop&q=80' },
  { id: '5', label: 'Electronics Pro', url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=250&auto=format&fit=crop&q=80' },
  { id: '6', label: 'Lead Technician', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=250&auto=format&fit=crop&q=80' },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'technician' | 'security'
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [techLoading, setTechLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Personal Info Form
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Technician Specific Form
  const [techForm, setTechForm] = useState({
    bio: '',
    experienceYears: 1,
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });

      if (user.role === 'TECHNICIAN') {
        fetchTechnicianProfile();
      }
    }
  }, [user]);

  const fetchTechnicianProfile = async () => {
    try {
      const res = await technicianApi.getProfile();
      const tech = res.data?.profile || res.data || {};
      setTechForm({
        bio: tech.bio || '',
        experienceYears: tech.experienceYears || 1,
      });
    } catch (err) {
      console.error('Failed to load technician profile:', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleTechChange = (e) => {
    setTechForm({ ...techForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  // Profile Picture Upload Handler
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setAvatarLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Url = reader.result;
        try {
          const res = await authService.updateProfile({ avatarUrl: base64Url });
          const updatedUser = res.data?.user || res.user || { ...user, avatarUrl: base64Url };
          updateUser(updatedUser);
          toast.success('Profile picture updated successfully!');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update profile picture');
        } finally {
          setAvatarLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setAvatarLoading(false);
      toast.error('Error reading image file');
    }
  };

  // Select Preset Avatar
  const handleSelectPreset = async (presetUrl) => {
    setAvatarLoading(true);
    try {
      const res = await authService.updateProfile({ avatarUrl: presetUrl });
      const updatedUser = res.data?.user || res.user || { ...user, avatarUrl: presetUrl };
      updateUser(updatedUser);
      setShowPresets(false);
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile picture');
    } finally {
      setAvatarLoading(false);
    }
  };

  // Remove Profile Picture
  const handleRemoveAvatar = async () => {
    if (!user?.avatarUrl) return;
    setAvatarLoading(true);
    try {
      const res = await authService.updateProfile({ avatarUrl: '' });
      const updatedUser = res.data?.user || res.user || { ...user, avatarUrl: '' };
      updateUser(updatedUser);
      toast.success('Profile picture removed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove picture');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await authService.updateProfile(form);
      const updated = res.data?.user || res.user || { ...user, ...form };
      updateUser(updated);
      toast.success('Profile information saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTechSubmit = async (e) => {
    e.preventDefault();
    setTechLoading(true);
    try {
      await technicianApi.updateProfile({
        bio: techForm.bio || '',
        experienceYears: Number(techForm.experienceYears) || 0,
      });
      toast.success('Technician profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update technician details');
    } finally {
      setTechLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!passwordForm.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) newErrors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 8) newErrors.newPassword = 'Must be at least 8 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return <DashboardLayout><PageSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Hidden File Input for Avatar */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Account Profile</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Manage your personal information, role details, profile photo, and security credentials.
          </p>
        </div>

        {/* Profile Card Header with Avatar Editor */}
        <Card className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 sm:gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar with Hover Camera Button */}
            <div className="relative group shrink-0">
              <Avatar
                src={user.avatarUrl}
                name={`${user.firstName} ${user.lastName}`}
                size="xl"
                className="w-24 h-24 text-2xl font-bold border-2 border-primary-500/30 shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-2xs"
                title="Click to change photo"
              >
                <Camera className="w-6 h-6 mb-0.5" />
                <span className="text-[10px] font-bold">Edit Photo</span>
              </button>
            </div>

            {/* User Info & Quick Photo Actions */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-extrabold text-surface-900 truncate">
                  {user.firstName} {user.lastName}
                </h2>
                <Badge variant={user.role === 'ADMIN' ? 'error' : user.role === 'TECHNICIAN' ? 'ACCEPTED' : 'info'} size="sm">
                  {user.role}
                </Badge>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Active Account
                </span>
              </div>
              <p className="text-sm text-surface-500 truncate flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-4 h-4 text-surface-400 shrink-0" />
                <span>{user.email}</span>
              </p>
              {user.phone && (
                <p className="text-xs text-surface-400 flex items-center justify-center sm:justify-start gap-1.5">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{user.phone}</span>
                </p>
              )}

              {/* Photo Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={Upload}
                  onClick={() => fileInputRef.current?.click()}
                  loading={avatarLoading}
                  className="font-bold text-xs"
                >
                  Upload Photo
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Sparkles}
                  onClick={() => setShowPresets(!showPresets)}
                  className="font-bold text-xs"
                >
                  Choose Avatar
                </Button>
                {user.avatarUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    onClick={handleRemoveAvatar}
                    className="font-bold text-xs text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-950/30"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Preset Avatars Drawer (Optional selection) */}
        {showPresets && (
          <Card className="animate-slide-down space-y-3 bg-surface-50 dark:bg-surface-200/50 border border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-surface-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary-600" />
                Select a Preset Avatar
              </p>
              <button
                type="button"
                onClick={() => setShowPresets(false)}
                className="text-xs font-semibold text-surface-500 hover:text-surface-900 cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-1">
              {PRESET_AVATARS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white dark:bg-surface-200 border border-surface-200 dark:border-surface-300 hover:border-primary-500 hover:scale-105 transition-all cursor-pointer group"
                >
                  <img src={preset.url} alt={preset.label} className="w-12 h-12 rounded-full object-cover shadow-2xs" />
                  <span className="text-[10px] font-semibold text-surface-600 group-hover:text-primary-600 truncate max-w-full">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-surface-200 dark:border-surface-300 gap-2 sm:gap-4 overflow-x-auto touch-scroll-x">
          <button
            onClick={() => setActiveTab('personal')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'personal'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-surface-500 hover:text-surface-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Information</span>
          </button>

          {user.role === 'TECHNICIAN' && (
            <button
              onClick={() => setActiveTab('technician')}
              className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'technician'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-surface-500 hover:text-surface-900'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Technician Details</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-surface-500 hover:text-surface-900'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Security &amp; Password</span>
          </button>
        </div>

        {/* Tab 1: Personal Details */}
        {activeTab === 'personal' && (
          <Card className="animate-slide-up space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-surface-200 dark:border-surface-300">
              <div>
                <h3 className="text-base font-bold text-surface-900">Edit Personal Information</h3>
                <p className="text-xs text-surface-500 mt-0.5">Click on First Name, Last Name or Phone below to edit your details.</p>
              </div>
              <Button
                onClick={handleProfileSubmit}
                loading={loading}
                icon={Save}
                size="md"
                className="shadow-xs font-bold shrink-0 self-start sm:self-auto"
              >
                Save Changes
              </Button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  icon={User}
                  value={form.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  placeholder="Enter first name"
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  placeholder="Enter last name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full h-11 rounded-xl border border-surface-200 dark:border-surface-300 bg-surface-100 dark:bg-surface-300 pl-10 pr-24 text-sm text-surface-600 dark:text-surface-700 cursor-not-allowed"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-surface-400 mt-1">Email address is permanently associated with your account.</p>
              </div>

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                icon={Phone}
                value={form.phone}
                onChange={handleChange}
                placeholder="+91-9876543210"
              />

              <div className="pt-2">
                <Button type="submit" loading={loading} icon={Save} size="lg" className="w-full sm:w-auto shadow-xs font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tab 2: Technician Details (Only for Technicians) */}
        {activeTab === 'technician' && user.role === 'TECHNICIAN' && (
          <Card className="animate-slide-up space-y-6">
            <div>
              <h3 className="text-base font-bold text-surface-900">Professional Technician Information</h3>
              <p className="text-xs text-surface-500 mt-0.5">Customize your public bio and experience.</p>
            </div>

            <form onSubmit={handleTechSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider">
                  Professional Bio / Summary
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  value={techForm.bio}
                  onChange={handleTechChange}
                  placeholder="Tell customers about your expertise, experience, and certifications..."
                  className="w-full rounded-xl border border-surface-200 dark:border-surface-300 bg-white dark:bg-surface-200 text-surface-900 placeholder:text-surface-400 dark:placeholder:text-surface-500 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Experience (Years)"
                  name="experienceYears"
                  type="number"
                  min="0"
                  max="50"
                  icon={Award}
                  value={techForm.experienceYears}
                  onChange={handleTechChange}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" loading={techLoading} icon={Save} size="lg" className="w-full sm:w-auto shadow-xs font-bold">
                  Save Technician Details
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tab 3: Security & Password */}
        {activeTab === 'security' && (
          <Card className="animate-slide-up space-y-6">
            <div>
              <h3 className="text-base font-bold text-surface-900">Change Account Password</h3>
              <p className="text-xs text-surface-500 mt-0.5">Ensure your account uses a strong, unique password.</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Current Password"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                error={errors.currentPassword}
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                error={errors.newPassword}
                placeholder="Min 8 characters"
              />
              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                error={errors.confirmPassword}
                placeholder="Re-enter new password"
              />

              <div className="pt-2">
                <Button type="submit" variant="secondary" loading={passwordLoading} icon={Key} size="lg" className="w-full sm:w-auto font-bold">
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
