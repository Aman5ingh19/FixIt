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
