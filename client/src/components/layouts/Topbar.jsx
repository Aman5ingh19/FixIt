import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  Search,
  LogIn,
  Wrench,
  User as UserIcon,
  Settings,
  Key,
  Shield,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  X,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ThemeToggle } from '../common';
import notificationApi from '../../services/notification.api';

export default function Topbar({ onMenuClick }) {
  const { user, logout, isGuest } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!user || isGuest) {
      setUnreadCount(0);
      return;
    }

    const checkUnread = async () => {
      try {
        const res = await notificationApi.getUnreadCount();
        const count = res.data?.unreadCount ?? res.data?.count ?? 0;
        setUnreadCount(count);
      } catch {
        setUnreadCount(0);
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 15000);
    return () => clearInterval(interval);
  }, [user, isGuest, location.pathname]);

  // Search items definition based on role
  const getSearchItems = () => {
    const role = user?.role || 'ADMIN';
    const basePath = `/${role.toLowerCase()}`;

    const common = [
      { title: 'My Profile', category: 'Account', subtitle: 'View personal details', path: `${basePath}/profile`, icon: UserIcon },
      { title: 'Change Password', category: 'Security', subtitle: 'Update account credentials', path: `${basePath}/profile`, icon: Key },
      { title: 'Settings', category: 'Preferences', subtitle: 'System & preference controls', path: `${basePath}/profile`, icon: Settings },
      { title: 'Notifications', category: 'Activity', subtitle: 'Alerts and updates', path: `${basePath}/notifications`, icon: Bell },
    ];

    if (role === 'ADMIN') {
      return [
        { title: 'Admin Dashboard', category: 'Page', subtitle: 'Overview & key metrics', path: '/admin/dashboard', icon: LayoutDashboard },
        { title: 'Manage Technicians', category: 'Management', subtitle: 'Verify & view all technicians', path: '/admin/technicians', icon: Shield },
        { title: 'Service Requests', category: 'Management', subtitle: 'All customer service jobs', path: '/admin/requests', icon: ClipboardList },
        { title: 'Activity Log', category: 'System', subtitle: 'System audit and action logs', path: '/admin/activity-log', icon: FileText },
        ...common,
      ];
    }

    if (role === 'TECHNICIAN') {
      return [
        { title: 'Technician Dashboard', category: 'Page', subtitle: 'Jobs & performance stats', path: '/technician/dashboard', icon: LayoutDashboard },
        { title: 'Available Jobs', category: 'Jobs', subtitle: 'Explore and accept requests', path: '/technician/requests/available', icon: ClipboardList },
        { title: 'Assigned Jobs', category: 'Jobs', subtitle: 'Active in-progress repairs', path: '/technician/jobs/assigned', icon: Wrench },
        ...common,
      ];
    }

    return [
      { title: 'Customer Dashboard', category: 'Page', subtitle: 'Active services & status', path: '/customer/dashboard', icon: LayoutDashboard },
      { title: 'Create Service Request', category: 'Action', subtitle: 'Book a technician', path: '/customer/requests/new', icon: Wrench },
      { title: 'Active Requests', category: 'Services', subtitle: 'Live tracked requests', path: '/customer/requests/active', icon: ClipboardList },
      { title: 'Request History', category: 'History', subtitle: 'Completed repairs', path: '/customer/requests/history', icon: FileText },
      ...common,
    ];
  };

  const filteredSearchItems = searchQuery.trim()
    ? getSearchItems().filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : getSearchItems().slice(0, 5);

  const handleSelectSearchItem = (path) => {
    navigate(path);
    setSearchQuery('');
    setSearchFocused(false);
    setSearchOpen(false);
  };

  // Close dropdown & search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleBadge = user?.role === 'ADMIN' ? 'Super Administrator' : user?.role === 'TECHNICIAN' ? 'Certified Technician' : 'Verified Customer';

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-surface-200 dark:border-surface-300">
      <div className="flex items-center justify-between px-3 sm:px-5 h-14 sm:h-16 gap-3">

        {/* Left: Mobile menu button + Search Input */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-200 lg:hidden transition-colors shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Search Box with Autocomplete Dropdown */}
          <div className="hidden sm:block relative flex-1 max-w-xs md:max-w-sm lg:max-w-md" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-surface-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder={t('search_placeholder', 'Search employees, pages, features...')}
                className="w-full pl-10 pr-9 h-10 bg-surface-100 dark:bg-surface-200/90 border border-surface-200 dark:border-surface-300/80 rounded-2xl text-xs sm:text-sm text-surface-900 placeholder:text-surface-400 dark:placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-md text-surface-400 hover:text-surface-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchFocused && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#151F32] rounded-2xl shadow-xl border border-surface-200 dark:border-surface-300 p-2 z-50 animate-scale-in max-h-80 overflow-y-auto">
                <div className="px-3 py-1.5 text-[11px] font-bold text-surface-400 uppercase tracking-wider">
                  {searchQuery ? 'Matching Results' : 'Quick Navigation'}
                </div>
                {filteredSearchItems.length > 0 ? (
                  filteredSearchItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.title}
                        onClick={() => handleSelectSearchItem(item.path)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 border border-primary-100 dark:border-primary-900/50 group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-surface-900 truncate">{item.title}</p>
                            <span className="text-[10px] font-semibold text-surface-400 px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-300">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-surface-500 truncate">{item.subtitle}</p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-4 text-center text-xs text-surface-400">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="sm:hidden p-2 rounded-xl text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors shrink-0"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Actions / User Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sun / Moon Theme Toggle */}
          <ThemeToggle />

          {/* Guest Mode Badge & Sign In */}
          {isGuest ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Guest Mode
              </span>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-xl border border-primary-100 dark:border-primary-800 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          ) : user ? (
            <>
              {/* Notifications Link */}
              <Link
                to={`/${user.role.toLowerCase()}/notifications`}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:hover:bg-surface-200 transition-all"
                aria-label="View notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white dark:ring-[#111827] animate-pulse" />
                )}
              </Link>

              {/* Admin Profile Dropdown Trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-2xl border border-surface-200 dark:border-surface-300/80 bg-white/80 dark:bg-[#151F32]/80 hover:bg-surface-50 dark:hover:bg-surface-200 transition-all cursor-pointer shadow-xs group"
                >
                  {/* Purple-Blue Gradient Avatar */}
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xs shrink-0">
                    <UserIcon className="w-4.5 h-4.5" />
                  </div>

                  {/* Name + Subtitle Column */}
                  <div className="text-left hidden md:block max-w-[110px] lg:max-w-[150px]">
                    <p className="text-xs font-bold text-surface-900 leading-tight truncate">
                      {user?.role === 'ADMIN' ? (user?.firstName === 'Admin' ? 'Admin' : `${user?.firstName}`) : `${user?.firstName} ${user?.lastName}`}
                    </p>
                    <p className="text-[10px] font-medium text-surface-500 dark:text-surface-400 truncate">
                      {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'TECHNICIAN' ? 'Technician' : 'Customer'}
                    </p>
                  </div>

                  {/* Chevron Icon */}
                  <ChevronDown className={`w-3.5 h-3.5 text-surface-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Admin Profile Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2.5 w-72 sm:w-80 bg-white dark:bg-[#151F32] rounded-3xl shadow-2xl border border-surface-200 dark:border-surface-300 p-4 z-50 animate-scale-in"
                    style={{ maxWidth: 'calc(100vw - 1.5rem)' }}
                  >
                    {/* Header Profile Section */}
                    <div className="flex items-center gap-3.5 pb-4 border-b border-surface-200 dark:border-surface-300/70">
                      {/* Large Gradient Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shrink-0">
                        <UserIcon className="w-6 h-6" />
                      </div>

                      {/* Admin Info & Badge */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-extrabold text-surface-900 truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400 truncate mt-0.5">
                          {user?.email}
                        </p>
                        <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-50 dark:bg-primary-950/70 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
                          <Shield className="w-3 h-3" />
                          <span>{roleBadge}</span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Options Section */}
                    <div className="py-3 space-y-1">
                      {/* My Profile */}
                      <Link
                        to={`/${user.role.toLowerCase()}/profile`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-surface-100 dark:hover:bg-surface-200/80 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <UserIcon className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-surface-900">My Profile</p>
                          <p className="text-[11px] text-surface-500 dark:text-surface-400 truncate">View personal &amp; department info</p>
                        </div>
                      </Link>

                      {/* Change Password */}
                      <Link
                        to={`/${user.role.toLowerCase()}/profile`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-surface-100 dark:hover:bg-surface-200/80 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Key className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-surface-900">Change Password</p>
                          <p className="text-[11px] text-surface-500 dark:text-surface-400 truncate">Manage login credentials</p>
                        </div>
                      </Link>

                      {/* Settings */}
                      <Link
                        to={`/${user.role.toLowerCase()}/profile`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-surface-100 dark:hover:bg-surface-200/80 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Settings className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-surface-900">Settings</p>
                          <p className="text-[11px] text-surface-500 dark:text-surface-400 truncate">System &amp; preference controls</p>
                        </div>
                      </Link>
                    </div>

                    {/* Sign Out Button */}
                    <div className="pt-2 border-t border-surface-200 dark:border-surface-300/70">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full p-2.5 rounded-2xl bg-danger-50 dark:bg-danger-950/30 border border-danger-100 dark:border-danger-900/40 hover:bg-danger-100 dark:hover:bg-danger-900/60 text-danger-600 dark:text-danger-400 flex items-center gap-2.5 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Mobile search bar (expandable) */}
      {searchOpen && (
        <div className="sm:hidden px-3 pb-3 animate-slide-down">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees, pages, features..."
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 bg-surface-100 dark:bg-surface-200 border border-surface-200 dark:border-surface-300 rounded-xl text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {searchQuery && (
            <div className="mt-2 bg-white dark:bg-[#151F32] rounded-xl border border-surface-200 dark:border-surface-300 p-2 shadow-lg max-h-60 overflow-y-auto">
              {filteredSearchItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleSelectSearchItem(item.path)}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-surface-900 hover:bg-surface-100 dark:hover:bg-surface-200 rounded-lg flex items-center justify-between"
                >
                  <span>{item.title}</span>
                  <span className="text-[10px] text-surface-400">{item.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
