import { useState } from 'react';
import {
  PlusCircle, Search, UserCheck, Wrench, CheckCircle2, Star,
  ShieldCheck, ToggleRight, DollarSign, Bell, ArrowRight, BookOpen,
  CreditCard, Activity, ShieldAlert, Users
} from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Card, Badge, Button } from '../../components/common';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function HowToUsePage() {
  const { user } = useAuth();
  const [roleTab, setRoleTab] = useState(
    user?.role === 'ADMIN' ? 'admin' : user?.role === 'TECHNICIAN' ? 'technician' : 'customer'
  );

  const customerSteps = [
    {
      step: '01',
      title: 'Choose a Service & Describe the Issue',
      desc: 'Select a category (Electrician, Plumber, AC Repair, Appliance, Carpenter) and write a brief description of the problem with your preferred time.',
      icon: PlusCircle,
      badge: 'Step 1',
    },
    {
      step: '02',
      title: 'Smart Instant Matching',
      desc: 'Our system instantly alerts the highest-rated verified technicians within your local service radius.',
      icon: Search,
      badge: 'Step 2',
    },
    {
      step: '03',
      title: 'Technician Arrives & Diagnoses',
      desc: 'Your assigned technician confirms arrival time, presents their FixIt badge, inspects the fault, and provides an upfront estimate.',
      icon: Wrench,
      badge: 'Step 3',
    },
    {
      step: '04',
      title: 'Online Payment & 30-Day Guarantee',
      desc: 'Pay securely using Razorpay Sandbox/Live checkout with instant receipts. All completed jobs include FixIt 30-day warranty.',
      icon: CheckCircle2,
      badge: 'Step 4',
    },
  ];

  const technicianSteps = [
    {
      step: '01',
      title: 'Toggle Online & Receive Work Alerts',
      desc: 'Switch your status to "Go Online" in your dashboard to start receiving incoming repair requests in your designated city & service radius.',
      icon: ToggleRight,
      badge: 'Step 1',
    },
    {
      step: '02',
      title: 'Review Job Details & Accept',
      desc: 'Inspect customer location, problem description, and category. Click Accept to take the job or Reject if unavailable.',
      icon: UserCheck,
      badge: 'Step 2',
    },
    {
      step: '03',
      title: 'Update Progress & Complete Job',
      desc: 'Change status to "In Progress" when you begin the repair. Mark "Completed" once the issue is tested and resolved.',
      icon: Wrench,
      badge: 'Step 3',
    },
    {
      step: '04',
      title: 'Earn & Grow Your Rating',
      desc: 'Track completed jobs and earned revenue directly. Higher customer ratings boost your matching priority for premium requests.',
      icon: DollarSign,
      badge: 'Step 4',
    },
  ];

  const adminSteps = [
    {
      step: '01',
      title: 'Platform Analytics & Revenue',
      desc: 'Inspect real-time KPI metrics, total revenue collected, active service request volumes, and system health status.',
      icon: DollarSign,
      badge: 'Step 1',
    },
    {
      step: '02',
      title: 'Technician Verification & KYC',
      desc: 'Review government ID cards, trade certificates, and technician credentials with one-click Approve or Reject actions.',
      icon: UserCheck,
      badge: 'Step 2',
    },
    {
      step: '03',
      title: 'Global Request & Dispatch Override',
      desc: 'Monitor and manage service tickets across all categories and cities with capabilities to inspect, reassign, or resolve issues.',
      icon: Wrench,
      badge: 'Step 3',
    },
    {
      step: '04',
      title: 'Security Audit & Activity Logs',
      desc: 'Inspect comprehensive audit logs capturing IP addresses, user agents, timestamps, and Razorpay transaction flows.',
      icon: ShieldCheck,
      badge: 'Step 4',
    },
  ];

  const currentSteps = roleTab === 'admin' ? adminSteps : roleTab === 'technician' ? technicianSteps : customerSteps;

  const content = (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="info" size="md" dot className="mx-auto">
          User Guide &amp; Instructions
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
          How to Use <span className="text-primary-600 dark:text-primary-400">FixIt Platform</span>
        </h1>
        <p className="text-surface-600 dark:text-surface-400 text-sm sm:text-base max-w-xl mx-auto">
          Learn how to book services, track technicians, manage service assignments, and administer the platform.
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex flex-wrap items-center justify-center p-1.5 rounded-2xl bg-surface-100 dark:bg-surface-200 border border-surface-200 dark:border-surface-300 gap-1">
          <button
            type="button"
            onClick={() => setRoleTab('customer')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              roleTab === 'customer'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            👤 For Customers
          </button>
          <button
            type="button"
            onClick={() => setRoleTab('technician')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              roleTab === 'technician'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            🔧 For Technicians
          </button>
          <button
            type="button"
            onClick={() => setRoleTab('admin')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              roleTab === 'admin'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            👑 For Admins
          </button>
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {currentSteps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <Card key={idx} className="relative p-6 space-y-4 hover:border-primary-300 dark:hover:border-primary-700 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800 flex items-center justify-center font-black text-lg">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-surface-200 dark:text-surface-400">
                  {step.step}
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-surface-900">{step.title}</h3>
                <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tips & Safety Section */}
      <Card className="bg-surface-50 dark:bg-surface-200/40 p-6 rounded-3xl border border-surface-200 dark:border-surface-300 space-y-4">
        <h3 className="text-base font-bold text-surface-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          FixIt Best Practices &amp; Security Standards
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-surface-600 dark:text-surface-400">
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Always check technician identity badges upon arrival.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Keep your notifications enabled to receive live status updates.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Use in-app chat for real-time instructions and queries.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Secure payments via Razorpay Sandbox with instant transaction invoices.</span>
          </div>
        </div>
      </Card>

      {/* ── Demo Login Guide ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-surface-900">⚡ Quick Demo Logins</h2>
            <p className="text-xs text-surface-500">Use these pre-seeded accounts to explore every role instantly</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Admin */}
          <Card className="border-purple-200 dark:border-purple-800/50 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👑</span>
              <div>
                <p className="font-bold text-surface-900 text-sm">Admin</p>
                <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider">Super Administrator</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-surface-500">Email</span>
                <code className="font-mono font-bold text-surface-800 dark:text-surface-200 bg-surface-100 dark:bg-surface-700 px-1.5 py-0.5 rounded select-all text-[11px]">admin@fixit.com</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-500">Password</span>
                <code className="font-mono font-bold text-surface-800 dark:text-surface-200 bg-surface-100 dark:bg-surface-700 px-1.5 py-0.5 rounded select-all text-[11px]">Password123!</code>
              </div>
            </div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 space-y-0.5">
              <p>✓ View all requests & revenue KPIs</p>
              <p>✓ Approve / reject technicians</p>
              <p>✓ Full audit log access</p>
            </div>
          </Card>

          {/* Technician */}
          <Card className="border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔧</span>
              <div>
                <p className="font-bold text-surface-900 text-sm">Technician</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">Verified Tech Pro</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-surface-500">Email</span>
                <code className="font-mono font-bold text-surface-800 dark:text-surface-200 bg-surface-100 dark:bg-surface-700 px-1.5 py-0.5 rounded select-all text-[11px]">tech@fixit.com</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-500">Password</span>
                <code className="font-mono font-bold text-surface-800 dark:text-surface-200 bg-surface-100 dark:bg-surface-700 px-1.5 py-0.5 rounded select-all text-[11px]">Password123!</code>
              </div>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 space-y-0.5">
              <p>✓ Accept / reject incoming jobs</p>
              <p>✓ Update job status live</p>
              <p>✓ View ratings & earnings</p>
            </div>
          </Card>

          {/* Customer */}
          <Card className="border-blue-200 dark:border-blue-800/50 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-bold text-surface-900 text-sm">Customer</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">Demo User</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-surface-500">Email</span>
                <code className="font-mono font-bold text-surface-800 dark:text-surface-200 bg-surface-100 dark:bg-surface-700 px-1.5 py-0.5 rounded select-all text-[11px]">customer@fixit.com</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-500">Password</span>
                <code className="font-mono font-bold text-surface-800 dark:text-surface-200 bg-surface-100 dark:bg-surface-700 px-1.5 py-0.5 rounded select-all text-[11px]">Password123!</code>
              </div>
            </div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 space-y-0.5">
              <p>✓ Create service requests</p>
              <p>✓ Live chat with technician</p>
              <p>✓ Pay & leave reviews</p>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Razorpay Test Mode Guide ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-surface-900">💳 How to Pay — Razorpay Test Mode</h2>
            <p className="text-xs text-surface-500">No real money charged — use these sandbox credentials in the popup</p>
          </div>
        </div>

        {/* Steps */}
        <Card className="border-amber-200 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-900/10 space-y-4">

          {/* Quick Steps */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">📋 Step-by-Step Payment Flow</p>
            <ol className="space-y-2 text-sm text-surface-700 dark:text-surface-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Login as <strong>Customer</strong> → go to <strong>Active Requests</strong> or <strong>History</strong></span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>Open any completed request → click <strong>⚡ Pay with Razorpay</strong></span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>In the Razorpay popup → choose <strong>Cards</strong> → enter test card below</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">4</span>
                <span>On the OTP screen → enter <code className="font-mono font-bold bg-amber-100 dark:bg-amber-800/60 px-1 rounded">1234</code> → Payment marked <strong className="text-emerald-600">PAID ✓</strong></span>
              </li>
            </ol>
          </div>

          <div className="border-t border-amber-200 dark:border-amber-800/50 pt-4 space-y-3">
            {/* Cards */}
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">✅ Test Card Credentials (Success)</p>
            <div className="overflow-x-auto rounded-xl border border-amber-200 dark:border-amber-800/50">
              <table className="w-full text-xs">
                <thead className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                  <tr>
                    <th className="text-left px-3 py-2 font-bold">Card Type</th>
                    <th className="text-left px-3 py-2 font-bold">Card Number</th>
                    <th className="text-left px-3 py-2 font-bold">Expiry</th>
                    <th className="text-left px-3 py-2 font-bold">CVV</th>
                    <th className="text-left px-3 py-2 font-bold">OTP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 dark:divide-amber-800/30 bg-white dark:bg-surface-800/40">
                  {[
                    { type: '💳 Visa', num: '4111 1111 1111 1111', exp: 'Any future', cvv: 'Any 3', otp: '1234' },
                    { type: '💳 Mastercard', num: '5267 3181 8797 5449', exp: 'Any future', cvv: 'Any 3', otp: '1234' },
                    { type: '💳 Rupay', num: '6073 8490 0000 0001', exp: 'Any future', cvv: 'Any 3', otp: '1234' },
                  ].map((row) => (
                    <tr key={row.num} className="text-surface-700 dark:text-surface-300">
                      <td className="px-3 py-2 font-semibold whitespace-nowrap">{row.type}</td>
                      <td className="px-3 py-2"><code className="font-mono font-bold select-all">{row.num}</code></td>
                      <td className="px-3 py-2 text-surface-500">{row.exp}</td>
                      <td className="px-3 py-2 text-surface-500">{row.cvv}</td>
                      <td className="px-3 py-2"><code className="font-mono font-bold text-emerald-600 select-all">{row.otp}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* UPI + Netbanking */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-surface-800/40 rounded-xl border border-amber-200 dark:border-amber-800/50 p-3 space-y-1.5">
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">📱 UPI (Success)</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-500">UPI ID</span>
                  <code className="font-mono font-bold text-surface-800 dark:text-surface-200 select-all bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded">success@razorpay</code>
                </div>
              </div>
              <div className="bg-white dark:bg-surface-800/40 rounded-xl border border-amber-200 dark:border-amber-800/50 p-3 space-y-1.5">
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">🏦 Netbanking</p>
                <p className="text-xs text-surface-600 dark:text-surface-400">Select any bank → Dummy bank page opens → Click <strong>"Success"</strong></p>
              </div>
            </div>

            {/* Failure cards */}
            <div className="bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800/40 p-3 space-y-1.5">
              <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">❌ Failure Simulation Cards</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between items-center">
                  <code className="font-mono text-red-700 dark:text-red-400 select-all">4000 0000 0000 0002</code>
                  <span className="text-surface-500">Payment Declined</span>
                </div>
                <div className="flex justify-between items-center">
                  <code className="font-mono text-red-700 dark:text-red-400 select-all">4000 0000 0000 9995</code>
                  <span className="text-surface-500">Insufficient Funds</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  if (user) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-[#0B1120] py-12 px-4 sm:px-6 lg:px-8">
      {content}
    </div>
  );
}
