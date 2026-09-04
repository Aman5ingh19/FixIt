import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Laptop,
  Wind,
  Zap,
  Droplets,
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  ClipboardList,
  Users,
  Package,
  Settings,
  Paintbrush,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, ThemeToggle } from '../../components/common';

const servicesList = [
  {
    id: 'electronics',
    icon: Laptop,
    name: 'Electronics',
    desc: 'Laptop, phone, TV, and computer diagnostic & repair',
    badge: 'Popular',
    price: 'From ₹499',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=900&auto=format&fit=crop&q=85',
    iconColor: 'text-blue-600',
  },
  {
    id: 'hvac',
    icon: Wind,
    name: 'HVAC',
    desc: 'AC servicing, installation, and maintenance services',
    badge: 'Seasonal',
    price: 'From ₹399',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&auto=format&fit=crop&q=85',
    iconColor: 'text-cyan-600',
  },
  {
    id: 'electrical',
    icon: Zap,
    name: 'Electrical',
    desc: 'Wiring, switches, circuit panels, and lighting fixes',
    badge: '24/7 Support',
    price: 'From ₹249',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&auto=format&fit=crop&q=85',
    iconColor: 'text-amber-500',
  },
  {
    id: 'plumbing',
    icon: Droplets,
    name: 'Plumbing',
    desc: 'Pipes, taps, leak repair, and drainage cleaning',
    badge: '',
    price: 'From ₹249',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=900&auto=format&fit=crop&q=85',
    iconColor: 'text-blue-500',
  },
  {
    id: 'appliances',
    icon: Package,
    name: 'Appliances',
    desc: 'Washing machine, fridge, microwave & more',
    badge: '',
    price: 'From ₹299',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=900&auto=format&fit=crop&q=85',
    iconColor: 'text-purple-600',
  },
  {
    id: 'painting',
    icon: Paintbrush,
    name: 'Painting',
    desc: 'Interior, exterior wall painting & texture waterproofing',
    badge: 'Trending',
    price: 'From ₹499',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=900&auto=format&fit=crop&q=85',
    iconColor: 'text-amber-600',
  },
];

const steps = [
  {
    step: '01',
    title: 'Describe Your Problem',
    desc: 'Tell us what needs fixing and upload photos.',
    icon: ClipboardList,
  },
  {
    step: '02',
    title: 'Get Matched',
    desc: 'We find the best available technician in your area.',
    icon: Users,
  },
  {
    step: '03',
    title: 'Track & Chat',
    desc: 'Real-time updates and direct messaging with technician.',
    icon: MessageSquare,
  },
  {
    step: '04',
    title: 'Done & Review',
    desc: 'Confirm completion and rate your technician.',
    icon: CheckCircle2,
  },
];

const keyFeatures = [
  {
    icon: ShieldCheck,
    title: '100% Verified Technicians',
    desc: 'Rigorous background checks and skill assessments for complete peace of mind.',
  },
  {
    icon: Clock,
    title: 'Live Arrival Tracking',
    desc: 'Know exactly where your technician is and receive accurate arrival countdowns.',
  },
  {
    icon: MessageSquare,
    title: 'Secure In-App Chat',
    desc: 'Direct communication with your technician for updates and photo sharing.',
  },
  {
    icon: CheckCircle2,
    title: 'Upfront Transparent Pricing',
    desc: 'No surprise charges or hidden fees. Standardized rates with guaranteed quality.',
  },
];

export default function LandingPage() {
  const { isAuthenticated, user, isGuest, continueAsGuest, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleBookService = (serviceName = '') => {
    const targetUrl = serviceName
      ? `/customer/requests/new?category=${encodeURIComponent(serviceName)}`
      : '/customer/requests/new';

    if (isAuthenticated) {
      navigate(targetUrl, { state: { prefillService: serviceName } });
    } else {
      openAuthModal({
        title: 'Sign in to book a service',
        message: 'Create a free account or sign in to submit a service request with verified technicians.',
        returnUrl: targetUrl,
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-surface-50 text-surface-900">
      {/* ── Left Sidebar Drawer (Opens on Menu Click) ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-surface-900/60 dark:bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar Panel */}
          <aside className="relative w-72 sm:w-80 max-w-[85vw] h-full bg-white dark:bg-[#111827] border-r border-surface-200 dark:border-surface-300 p-4 sm:p-5 flex flex-col justify-between z-50 shadow-2xl animate-slide-left">
            <div>
              {/* Header: Brand + Close */}
              <div className="flex items-center justify-between pb-4 border-b border-surface-200 dark:border-surface-300">
                <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5 group">
                  <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-xs group-hover:bg-primary-700 transition-colors">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-surface-900 tracking-tight">FixIt</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl text-surface-400 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors cursor-pointer"
                  aria-label="Close Sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="py-4 space-y-1">
                <p className="px-3 text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-2">Navigation</p>
                {[
                  { href: '#services', label: 'Services', icon: Wrench, isHash: true },
                  { href: '/how-to-use', label: 'How to Use', icon: ClipboardList, isHash: false },
                  { href: '/about', label: 'About FixIt', icon: ShieldCheck, isHash: false },
                  { href: '/register?role=TECHNICIAN', label: 'Join as Technician', icon: Users, isHash: false },
                  { href: isAuthenticated ? `/${user?.role?.toLowerCase() || 'customer'}/settings` : '/login', label: 'Settings', icon: Settings, isHash: false },
                ].map((item) => {
                  const Icon = item.icon;
                  return item.isHash ? (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-surface-700 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                    >
                      <Icon className="w-4.5 h-4.5 text-surface-400" />
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-surface-700 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                    >
                      <Icon className="w-4.5 h-4.5 text-surface-400" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Portals & Logins */}
              <div className="py-3 border-t border-surface-200 dark:border-surface-300 space-y-1">
                <p className="px-3 text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-2">Portals &amp; Logins</p>
                <Link
                  to="/login"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs font-bold text-surface-700 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all"
                >
                  <span className="flex items-center gap-2">🔧 Technician Portal</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold">Login</span>
                </Link>
                <Link
                  to="/login"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs font-bold text-surface-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 transition-all"
                >
                  <span className="flex items-center gap-2">👤 Customer Portal</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold">Login</span>
                </Link>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-surface-200 dark:border-surface-300 space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-surface-500">Theme</span>
                <ThemeToggle />
              </div>
              {isAuthenticated ? (
                <Link to={`/${user?.role?.toLowerCase() || 'customer'}/dashboard`} onClick={() => setSidebarOpen(false)}>
                  <button type="button" className="w-full py-2.5 px-4 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-sm">
                    Go to Dashboard →
                  </button>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setSidebarOpen(false)}>
                    <button type="button" className="w-full py-2 px-3 text-xs font-bold text-surface-900 bg-surface-100 dark:bg-surface-200 hover:bg-surface-200 dark:hover:bg-surface-300 rounded-xl transition-all">
                      Sign In
                    </button>
                  </Link>
                  <Link to="/register" onClick={() => setSidebarOpen(false)}>
                    <button type="button" className="w-full py-2 px-3 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-sm">
                      Get Started
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ── Top Guest Mode Banner (Left-aligned as in design) ── */}
      <div className="bg-[#070E20] text-slate-200 px-4 sm:px-6 lg:px-8 py-2 text-xs font-medium w-full border-b border-slate-800/70">
        <div className="max-w-7xl mx-auto flex items-center justify-start gap-2.5 text-left">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-xs text-slate-300">
            You're exploring <strong className="text-primary-400 font-bold">FixIt</strong> as a <strong className="text-white font-bold">Guest</strong>
          </span>
        </div>
      </div>

      {/* ── Header / Navbar (Improved for Light & Dark Mode) ── */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#0E1726] border-b border-surface-200/80 dark:border-slate-800/90 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* ── Left: Brand Logo & Name (Clicks to open Sidebar) + Nav Links ── */}
            <div className="flex items-center gap-6 lg:gap-8 min-w-0">
              {/* Brand Logo & Name Button (Direct left aligned, opens sidebar on click) */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2.5 group shrink-0 focus:outline-none cursor-pointer text-left -ml-1 sm:ml-0"
                aria-label="Open Navigation Sidebar"
                title="Click to open menu"
              >
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-xs group-hover:bg-blue-700 group-active:scale-95 transition-all shrink-0">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-extrabold text-surface-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  FixIt
                </span>
              </button>

              {/* Desktop Nav links */}
              <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
                <a
                  href="#services"
                  className="text-surface-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                >
                  Services
                </a>
                <Link
                  to="/how-to-use"
                  className="text-surface-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                >
                  How It Works
                </Link>
                <Link
                  to="/about"
                  className="text-surface-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                >
                  About
                </Link>
                <Link
                  to="/register?role=TECHNICIAN"
                  className="text-surface-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                >
                  Join as Technician
                </Link>
              </nav>
            </div>

            {/* ── Right: Sign In, Get Started, Theme Toggle, Settings ── */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              {/* Sign In */}
              <Link to="/login">
                <button
                  type="button"
                  className="px-3.5 py-2 text-sm font-semibold text-surface-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Sign In
                </button>
              </Link>

              {/* Get Started Button */}
              <Link to="/register">
                <button
                  type="button"
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs hover:shadow transition-all duration-150 cursor-pointer whitespace-nowrap"
                >
                  Get Started
                </button>
              </Link>

              {/* Theme Toggle Button */}
              <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-slate-800/90 border border-surface-200/80 dark:border-slate-700/80 flex items-center justify-center text-surface-700 dark:text-slate-200 hover:bg-surface-200 dark:hover:bg-slate-700 transition-colors">
                <ThemeToggle />
              </div>

              {/* Settings Button */}
              <Link
                to={isAuthenticated ? `/${user?.role?.toLowerCase() || 'customer'}/settings` : '/login'}
                className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-slate-800/90 border border-surface-200/80 dark:border-slate-700/80 flex items-center justify-center text-surface-700 dark:text-slate-200 hover:bg-surface-200 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Settings"
                aria-label="Settings"
              >
                <Settings className="w-4.5 h-4.5" />
              </Link>
            </div>

            {/* Mobile right side: theme toggle + hamburger */}
            <div className="lg:hidden flex items-center gap-1.5 ml-auto">
              <div className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-slate-800 flex items-center justify-center">
                <ThemeToggle />
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-surface-700 dark:text-slate-200 hover:bg-surface-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Toggle navigation"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-surface-200 dark:border-surface-300 bg-white dark:bg-surface-100 px-4 pt-3 pb-5 space-y-3 animate-slide-down shadow-lg">
            {/* Guest mode indicator */}
            {isGuest && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Browsing as Guest</span>
              </div>
            )}

            <nav className="flex flex-col space-y-0.5">
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-surface-700 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-200 hover:text-surface-900 transition-colors"
              >
                Services We Offer
              </a>
              <Link
                to="/how-to-use"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-surface-700 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-200 hover:text-surface-900 transition-colors"
              >
                How to Use
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-surface-700 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-200 hover:text-surface-900 transition-colors"
              >
                About FixIt
              </Link>
              <Link
                to="/register?role=TECHNICIAN"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-surface-700 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-200 hover:text-surface-900 transition-colors"
              >
                Join as Technician
              </Link>
            </nav>

            <div className="pt-2 border-t border-surface-200 dark:border-surface-300 flex flex-col gap-2">
              {!isGuest && !isAuthenticated && (
                <button
                  type="button"
                  className="w-full px-4 py-2.5 text-sm font-medium text-surface-600 bg-surface-100 dark:bg-surface-200 hover:bg-surface-200 dark:hover:bg-surface-300 rounded-xl transition-colors cursor-pointer text-center"
                  onClick={() => { setMobileMenuOpen(false); continueAsGuest(); }}
                >
                  Continue as Guest
                </button>
              )}
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <button type="button" className="w-full px-4 py-2.5 text-sm font-semibold text-surface-900 bg-surface-100 dark:bg-surface-200 hover:bg-surface-200 dark:hover:bg-surface-300 rounded-xl transition-colors cursor-pointer">
                  Sign In
                </button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <button type="button" className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors cursor-pointer shadow-sm">
                  Get Started Free
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Section (Compact & Responsive) ── */}
      <section className="relative w-full pt-6 pb-10 sm:pt-10 sm:pb-14 lg:pt-12 lg:pb-16 bg-gradient-to-b from-blue-50/70 dark:from-blue-950/40 via-surface-50 to-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-4 sm:space-y-4.5">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-surface-200 border border-blue-200 dark:border-blue-800 shadow-2xs text-xs font-semibold text-blue-700 dark:text-blue-300">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Trusted Local Service Professionals</span>
              </div>

              {/* Main Headline (Compact & Balanced) */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] xl:text-[2.85rem] font-extrabold text-surface-900 leading-[1.18] tracking-tight">
                Get Any Repair Done{' '}
                <span className="text-blue-600 dark:text-blue-400 block sm:inline">
                  Quickly &amp; Reliably
                </span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-xs sm:text-sm md:text-base text-surface-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
                From AC repair to laptop fixes — connect with verified technicians
                in your area. Real-time tracking, transparent pricing, and direct
                communication.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 pt-1">
                <Button
                  size="md"
                  icon={ArrowRight}
                  onClick={() => handleBookService()}
                  className="w-full sm:w-auto shadow-sm hover:shadow-md transition-all font-bold px-6 py-2.5 text-sm"
                >
                  Book a Service
                </Button>
                <Link to="/register?role=TECHNICIAN" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="md"
                    icon={Users}
                    fullWidth
                    className="font-bold px-5 py-2.5 text-sm"
                  >
                    Join as Technician
                  </Button>
                </Link>
              </div>

              {/* Trust Chips */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 text-xs sm:text-sm text-surface-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>100% Verified Experts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>No Hidden Fees</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Real-time Live Chat</span>
                </div>
              </div>
            </div>

            {/* Right — Visual Image */}
            <div className="w-full relative">
              <div className="relative mx-auto max-w-lg">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-surface-200 dark:ring-surface-300">
                  <div className="aspect-[4/3] relative">
                    <img 
                      src="/hero-technician.jpg" 
                      alt="FixIt Technician servicing AC unit" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Section ── */}
      <section id="services" className="py-14 sm:py-20 bg-surface-100/60 dark:bg-surface-50 border-t border-surface-200 dark:border-surface-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="inline-block text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase mb-3">
              OUR CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 mb-3">
              Services We Offer
            </h2>
            <p className="text-sm sm:text-base text-surface-600 leading-relaxed">
              Book certified and experienced professionals for all your repair, maintenance, and installation needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {servicesList.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  onClick={() => handleBookService(service.name)}
                  className="group bg-white dark:bg-[#151F32] rounded-3xl overflow-hidden border border-surface-200 dark:border-surface-300 hover:border-primary-400 dark:hover:border-primary-500 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleBookService(service.name)}
                  aria-label={`Book ${service.name} service`}
                >
                  {/* Top HD Image & Vector Overlay */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                    {/* Top Row: Crisp Icon & Pill Tag */}
                    <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none">
                      <div className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-slate-900/90 shadow-md backdrop-blur-md flex items-center justify-center shrink-0">
                        <Icon className={`w-5 h-5 ${service.iconColor}`} />
                      </div>
                      {service.badge && (
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 shadow-md backdrop-blur-md shrink-0">
                          {service.badge}
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Sharp Vector Title & Description */}
                    <div className="absolute bottom-3.5 inset-x-3.5 space-y-1 pointer-events-none">
                      <h3 className="text-xl font-extrabold text-white tracking-tight drop-shadow-sm">
                        {service.name}
                      </h3>
                      <p className="text-xs text-white/90 font-medium leading-relaxed drop-shadow-xs line-clamp-1">
                        {service.desc}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Price & Book Now */}
                  <div className="p-4 sm:p-5 flex items-center justify-between bg-white dark:bg-[#151F32]">
                    <span className="text-sm sm:text-base font-extrabold text-surface-900">
                      {service.price}
                    </span>
                    <span className="inline-flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                      Book Now <ChevronRight className="w-4 h-4 ml-0.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How to Use ── */}
      <section id="how-to-use" className="py-14 sm:py-20 bg-surface-50 border-t border-surface-200 dark:border-surface-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="inline-block text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase mb-3">
              EASY PROCESS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 mb-3">
              How to Use
            </h2>
            <p className="text-sm sm:text-base text-surface-600">
              Four simple steps to get your problem fixed
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-4 sm:mb-5 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center border border-primary-100 dark:border-primary-800">
                    <Icon className="w-7 h-7 sm:w-9 sm:h-9 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="mb-2 sm:mb-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-bold border border-primary-200 dark:border-primary-800">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-surface-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-surface-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why Choose FixIt ── */}
      <section id="why-fixit" className="py-14 sm:py-20 bg-surface-100/60 dark:bg-surface-50 border-t border-surface-200 dark:border-surface-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="inline-block text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full border border-primary-100 dark:border-primary-800 mb-3">
              Peace of Mind
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight mb-2">
              Why Choose FixIt
            </h2>
            <p className="text-sm sm:text-base text-surface-600">
              Built for speed, safety, and transparent marketplace trust.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {keyFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="p-5 rounded-2xl bg-white dark:bg-surface-200 border border-surface-200 dark:border-surface-300 space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center border border-primary-100 dark:border-primary-800">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ width: '1.125rem', height: '1.125rem' }} />
                  </div>
                  <h3 className="text-sm font-bold text-surface-900">{feat.title}</h3>
                  <p className="text-xs text-surface-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white dark:bg-surface-100 border-t border-surface-200 dark:border-surface-300 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-surface-900 text-base">FixIt</span>
          </div>
          <p className="text-xs text-surface-500 text-center">
            © {new Date().getFullYear()} FixIt Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-5 text-xs font-medium text-surface-600">
            <a href="#services" className="hover:text-primary-600 transition-colors">Services</a>
            <Link to="/how-to-use" className="hover:text-primary-600 transition-colors">How to Use</Link>
            <Link to="/about" className="hover:text-primary-600 transition-colors">About FixIt</Link>
            <Link to="/login" className="hover:text-primary-600 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
