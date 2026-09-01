import { NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Wrench,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  History,
  Bell,
  User,
  Briefcase,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  ListChecks,
  Key,
  Settings,
  Sparkles,
  BookOpen,
  Info,
  HelpCircle,
  CreditCard,
} from 'lucide-react';

const adminNavSections = [
  {
    title: 'Management',
    items: [
      { label: 'Dashboard',    path: '/admin/dashboard',    icon: LayoutDashboard, badge: null },
      { label: 'Technicians',  path: '/admin/technicians',  icon: Shield, badge: 'Verified' },
      { label: 'Requests',     path: '/admin/requests',     icon: ClipboardList, badge: null },
      { label: 'Payments',     path: '/admin/payments',     icon: CreditCard, badge: 'Razorpay' },
      { label: 'Activity Log', path: '/admin/activity-log', icon: FileText, badge: null },
    ],
  },
  {
    title: 'Account & Preferences',
    items: [
      { label: 'Update Profile',  path: '/admin/profile',       icon: User, badge: 'Edit' },
      { label: 'Notifications',   path: '/admin/notifications', icon: Bell, badge: null },
      { label: 'Settings',        path: '/admin/settings',      icon: Settings, badge: null },
    ],
  },
  {
    title: 'Guide & Platform',
    items: [
      { label: 'How to Use',      path: '/admin/how-to-use',    icon: BookOpen, badge: null },
      { label: 'About FixIt',     path: '/admin/about',         icon: Info, badge: null },
    ],
  },
];

const technicianNavSections = [
  {
    title: 'Job Center',
    items: [
      { label: 'Dashboard',      path: '/technician/dashboard',          icon: LayoutDashboard },
      { label: 'Available Jobs', path: '/technician/requests/available', icon: ListChecks },
      { label: 'Assigned Jobs',  path: '/technician/jobs/assigned',      icon: Briefcase },
    ],
  },
  {
    title: 'Account & Preferences',
    items: [
      { label: 'Update Profile', path: '/technician/profile',       icon: User, badge: 'Edit' },
      { label: 'Notifications', path: '/technician/notifications', icon: Bell },
      { label: 'Settings',       path: '/technician/settings',      icon: Settings },
    ],
  },
  {
    title: 'Guide & Platform',
    items: [
      { label: 'How to Use',     path: '/technician/how-to-use',    icon: BookOpen },
      { label: 'About FixIt',    path: '/technician/about',         icon: Info },
    ],
  },
];

const customerNavSections = [
  {
    title: 'Services',
    items: [
      { label: 'Overview',        path: '/customer/dashboard',        icon: LayoutDashboard },
      { label: 'New Request',     path: '/customer/requests/new',     icon: PlusCircle },
      { label: 'Active Requests', path: '/customer/requests/active',  icon: ClipboardList },
      { label: 'History',         path: '/customer/requests/history', icon: History },
      { label: 'Payments',        path: '/customer/payments',         icon: CreditCard },
    ],
  },
  {
    title: 'Account & Preferences',
    items: [
      { label: 'Update Profile', path: '/customer/profile',       icon: User, badge: 'Edit' },
      { label: 'Notifications', path: '/customer/notifications', icon: Bell },
      { label: 'Settings',       path: '/customer/settings',      icon: Settings },
    ],
  },
  {
    title: 'Guide & Platform',
    items: [
      { label: 'How to Use',     path: '/customer/how-to-use',    icon: BookOpen },
      { label: 'About FixIt',    path: '/customer/about',         icon: Info },
    ],
  },
];

export default function Sidebar({ isOpen, collapsed, onClose, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const navSections =
    user?.role === 'ADMIN'
      ? adminNavSections
      : user?.role === 'TECHNICIAN'
      ? technicianNavSections
      : customerNavSections;

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-50
        bg-white dark:bg-[#111827]
        border-r border-surface-200 dark:border-surface-300
        flex flex-col transition-all duration-300
        ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}
        lg:translate-x-0
        ${collapsed ? 'lg:w-20' : 'lg:w-64'}
        w-72 max-w-[85vw] shadow-sm
      `}
    >
      {/* ── Brand Header ── */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-surface-200 dark:border-surface-300 shrink-0">
        <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shrink-0 shadow-xs group-hover:bg-primary-700 transition-colors">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl font-bold text-surface-900 tracking-tight truncate">FixIt</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800 uppercase tracking-wide">
                {user?.role === 'ADMIN' ? 'Admin' : 'Pro'}
              </span>
            </div>
          )}
        </Link>

        {/* Mobile close */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-200 lg:hidden shrink-0 transition-colors cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors shrink-0 cursor-pointer"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section) => {
          const sectionKey = section.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
          const translatedSectionTitle = t(sectionKey, section.title);

          return (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[11px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">
                  {translatedSectionTitle}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const itemKey = item.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
                const translatedLabel = t(itemKey, item.label);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold
                      transition-all duration-150 group
                      ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-200/80 hover:text-surface-900'
                      }
                      ${collapsed ? 'lg:justify-center lg:px-2' : ''}
                    `}
                    title={collapsed ? translatedLabel : undefined}
                  >
                    <Icon
                      className={`w-4.5 h-4.5 shrink-0 ${
                        isActive ? 'text-white' : 'text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-300'
                      }`}
                    />
                    {!collapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{translatedLabel}</span>
                        {item.badge && !isActive && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* ── Footer Profile & Logout ── */}
      <div className="border-t border-surface-200 dark:border-surface-300 p-3 shrink-0">
        <button
          onClick={logout}
          className={`
            flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold
            text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/30
            border border-transparent hover:border-danger-100 dark:hover:border-danger-900/40
            transition-all duration-150 cursor-pointer
            ${collapsed ? 'lg:justify-center lg:px-2' : ''}
          `}
          title={collapsed ? t('sign_out', 'Sign Out') : undefined}
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          {!collapsed && <span>{t('sign_out', 'Sign Out')}</span>}
        </button>
      </div>
    </aside>
  );
}
