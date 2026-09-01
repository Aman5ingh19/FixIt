import { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Bell, Smartphone, Mail, Lock, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Card, Button, Badge, ThemeToggle } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    pushAlerts: true,
    soundAlerts: false,
  });

  const toggleNotif = (key) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      toast.success('Notification preference saved');
      return updated;
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">App Settings &amp; Preferences</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Manage your display appearance, notification channels, and platform preferences.
          </p>
        </div>

        {/* Section 1: Appearance & Theme */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-surface-200 dark:border-surface-300">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-surface-900">Appearance Mode</h3>
              <p className="text-xs text-surface-500">Switch between light and dark visual modes.</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-50 dark:bg-surface-200/50 border border-surface-200 dark:border-surface-300">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-surface-900">
                {isDark ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'}
              </span>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        {/* Section 2: Notification Preferences */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-surface-200 dark:border-surface-300">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-surface-900">Notification Alerts</h3>
              <p className="text-xs text-surface-500">Choose how FixIt communicates critical updates to you.</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: 'pushAlerts', label: 'Push Notifications', desc: 'Real-time job updates, messages, and alerts in your browser', icon: Smartphone },
              { key: 'emailAlerts', label: 'Email Summaries', desc: 'Service receipts, completed job summaries, and monthly reports', icon: Mail },
              { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Technician arrival alerts and urgent job status notifications', icon: Bell },
            ].map((item) => {
              const Icon = item.icon;
              const isChecked = notifications[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => toggleNotif(item.key)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-200/50 border border-surface-200 dark:border-surface-300 hover:border-primary-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-200/80 dark:bg-surface-300 flex items-center justify-center text-surface-600">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-surface-900">{item.label}</p>
                      <p className="text-[11px] text-surface-500 truncate">{item.desc}</p>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-1 ${isChecked ? 'bg-primary-600' : 'bg-surface-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isChecked ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
