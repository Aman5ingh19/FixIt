import {
  Shield,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  HeartHandshake,
  PhoneCall,
  Zap,
  Star,
  Lock,
  Code2,
  Database,
  Server,
  Cpu,
  Layers,
  Terminal,
  KeyRound,
  Workflow,
  Boxes,
  Activity,
  GitBranch,
  Radio,
  Share2,
  CreditCard,
  Check,
} from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Card, Badge, Button } from '../../components/common';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AboutPage() {
  const { user } = useAuth();

  const values = [
    {
      icon: Shield,
      title: 'Verified Professionals Only',
      desc: 'Every technician undergoes government ID verification, background checks, and trade skill assessments before taking jobs.',
      color: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    },
    {
      icon: Zap,
      title: 'Rapid Response & Instant Booking',
      desc: 'Smart geolocation matching pairs you with top-rated local experts within minutes, ensuring minimal downtime for your appliances.',
      color: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
    {
      icon: HeartHandshake,
      title: 'FixIt 30-Day Guarantee',
      desc: 'All repairs completed through our platform include a 30-day service guarantee. If the issue reoccurs, we fix it free of charge.',
      color: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    {
      icon: CreditCard,
      title: 'Razorpay Secured Transactions',
      desc: 'End-to-end cryptographic HMAC-SHA256 signature verification with transparent upfront pricing and instant invoice receipts.',
      color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    },
  ];

  const stats = [
    { value: '6+', label: 'Service Domains & Categories', icon: Award },
    { value: '4.9 ★', label: 'Average Customer Rating', icon: Star },
    { value: '100%', label: 'Verified Skilled Technicians', icon: Users },
    { value: 'Real-Time', label: 'Live Dispatch & Chat Tracking', icon: Clock },
  ];

  const techCategories = [
    {
      title: 'Frontend & UI Framework',
      icon: Layers,
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-900/60',
      iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50',
      items: [
        { name: 'React 18', tag: 'UI Library', desc: 'Component-driven reactive single page application architecture.' },
        { name: 'Vite 5', tag: 'Build Engine', desc: 'Lightning-fast HMR and optimized production asset bundling.' },
        { name: 'TailwindCSS v4', tag: 'Styling', desc: 'Design system with seamless high-contrast dark & light themes.' },
        { name: 'React Router v6', tag: 'Routing', desc: 'Protected client routing with role-based access guards.' },
        { name: 'Lucide Icons', tag: 'Visuals', desc: 'Crisp, lightweight SVG icon system across all interfaces.' },
      ],
    },
    {
      title: 'Backend & Server Runtime',
      icon: Server,
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-900/60',
      iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
      items: [
        { name: 'Node.js 20+', tag: 'Runtime', desc: 'Asynchronous event-driven JavaScript server environment.' },
        { name: 'Express.js', tag: 'REST API', desc: 'Robust middleware pipeline and modular controller routes.' },
        { name: 'Prisma ORM', tag: 'Database Layer', desc: 'Type-safe database modeling, transactions, and connection pooling.' },
        { name: 'PostgreSQL (Neon)', tag: 'Cloud DB', desc: 'Serverless cloud relational database for persistent storage.' },
        { name: 'Zod Validation', tag: 'Validation', desc: 'Strict runtime request body & query parameter schema validation.' },
      ],
    },
    {
      title: 'Payments & Gateway Engine',
      icon: CreditCard,
      color: 'from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-900/60',
      iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50',
      items: [
        { name: 'Razorpay Gateway', tag: 'Payments', desc: 'Seamless online checkout with Sandbox & Live mode capability.' },
        { name: 'HMAC-SHA256', tag: 'Cryptography', desc: 'Cryptographic signature verification preventing payment spoofing.' },
        { name: 'Webhook Engine', tag: 'Event Handlers', desc: 'Asynchronous event processing for payments, captures & refunds.' },
        { name: 'State Machine', tag: 'Lifecycle', desc: 'Strict transitions across PENDING, PAID, FAILED, and REFUNDED.' },
        { name: 'Financial History', tag: 'Audit Logs', desc: 'Searchable customer transaction receipts & admin revenue analytics.' },
      ],
    },
    {
      title: 'Security & Core Pipeline',
      icon: KeyRound,
      color: 'from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-900/60',
      iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50',
      items: [
        { name: 'JWT Authentication', tag: 'Tokens', desc: 'Access & refresh token rotation with secure cookie support.' },
        { name: 'Bcryptjs (12 rounds)', tag: 'Cryptography', desc: 'Strong adaptive salted password hashing algorithms.' },
        { name: 'Rate Limiting', tag: 'Protection', desc: 'DDoS and brute-force prevention on authentication endpoints.' },
        { name: 'Cloudinary Media', tag: 'Image Storage', desc: 'Multi-source photo upload pipeline (Camera, URL, Device).' },
        { name: 'Winston & Morgan', tag: 'Observability', desc: 'Structured server logging and HTTP request telemetry.' },
      ],
    },
  ];

  const advancedInfrastructure = [
    {
      category: 'Containerization & Orchestration',
      badge: 'DevOps & Scaling',
      icon: Boxes,
      color: 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
      techs: [
        {
          name: 'Docker & Docker Compose',
          role: 'Containerization',
          desc: 'Multi-stage container packaging for reproducible, zero-config local development and production services.',
        },
        {
          name: 'Kubernetes (K8s)',
          role: 'Orchestration',
          desc: 'Cloud-agnostic deployment with declarative autoscaling, self-healing pods, and load balancing.',
        },
      ],
    },
    {
      category: 'Event Streaming & Message Queues',
      badge: 'High Throughput',
      icon: Radio,
      color: 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
      techs: [
        {
          name: 'Apache Kafka (KRaft / Upstash)',
          role: 'Event Streaming',
          desc: 'Distributed event pipeline for asynchronous job status streaming, telemetry, and audit logging.',
        },
        {
          name: 'RabbitMQ',
          role: 'Task Queue & Workers',
          desc: 'Reliable background worker processing for transactional emails, PDF invoices, and retry queues.',
        },
      ],
    },
    {
      category: 'CI/CD & Workflow Automation',
      badge: 'Automated Pipeline',
      icon: GitBranch,
      color: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
      techs: [
        {
          name: 'GitHub Actions',
          role: 'CI/CD Pipeline',
          desc: 'Automated linting, integration testing, Docker container image pushes, and production deploy gates.',
        },
        {
          name: 'n8n Automation Engine',
          role: 'Workflow Integration',
          desc: 'Low-code orchestration connecting FixIt events with external CRMs, messaging bots, and customer analytics.',
        },
      ],
    },
    {
      category: 'Real-time & Distributed Caching',
      badge: 'Sub-Millisecond Speed',
      icon: Zap,
      color: 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
      techs: [
        {
          name: 'Redis Cache Cluster',
          role: 'In-Memory Store',
          desc: 'High-speed caching for technician geolocation queries, session tokens, and request rate-limiting.',
        },
        {
          name: 'Socket.IO Engine',
          role: 'Bidirectional Sockets',
          desc: 'Real-time WebSocket protocol for live chat messaging, instant dispatch notifications, and technician status toggles.',
        },
      ],
    },
  ];

  const content = (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-12">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <Badge variant="info" size="md" dot className="mx-auto">
          About FixIt Platform
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
          India's Most Trusted On-Demand <br className="hidden sm:inline" />
          <span className="text-primary-600 dark:text-primary-400">Home &amp; Appliance Repair Network</span>
        </h1>
        <p className="text-surface-600 dark:text-surface-400 text-sm sm:text-base max-w-2xl mx-auto">
          FixIt connects homeowners and businesses with background-verified, skilled technicians for electrical, plumbing, HVAC, carpentry, electronics, and home appliance services.
        </p>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Card key={idx} className="text-center p-4">
              <div className="w-10 h-10 mx-auto rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800 flex items-center justify-center mb-2">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-surface-900">{s.value}</p>
              <p className="text-xs font-semibold text-surface-500 mt-0.5">{s.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-surface-900">Our Mission</h3>
          </div>
          <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
            To eliminate the stress of home maintenance by delivering rapid, reliable, and transparent repair services at standard fair rates, while empowering skilled tradespeople with sustainable livelihoods.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-surface-900">Safety &amp; Standards</h3>
          </div>
          <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
            We hold our service partners to the highest safety and ethical guidelines. All technicians carry verified ID badges, adhere to transparent billing guidelines, and use genuine replacement parts.
          </p>
        </Card>
      </div>

      {/* Core Platform Pillars */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-surface-900">Why Customers &amp; Technicians Choose FixIt</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <Card key={idx} className="flex gap-4 items-start p-5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${v.color}`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold text-surface-900">{v.title}</h4>
                  <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">{v.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Technology Stack & Tools Section ── */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 text-xs font-bold border border-primary-100 dark:border-primary-800 mb-1">
              <Code2 className="w-3.5 h-3.5" /> Core Tech Stack
            </div>
            <h2 className="text-xl font-bold text-surface-900">Full-Stack Application Architecture</h2>
          </div>
          <span className="text-xs font-medium text-surface-500">Modular &amp; Scalable</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {techCategories.map((cat, idx) => {
            const CatIcon = cat.icon;
            return (
              <Card key={idx} className="p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2.5 border-b border-surface-200 dark:border-surface-300">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.iconColor}`}>
                      <CatIcon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-surface-900">{cat.title}</h3>
                  </div>

                  <div className="space-y-2.5 pt-2.5">
                    {cat.items.map((tech) => (
                      <div key={tech.name} className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-surface-900">{tech.name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-surface-100 dark:bg-surface-200 text-surface-600 border border-surface-200 dark:border-surface-300">
                            {tech.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-surface-500 leading-snug">{tech.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-surface-100 dark:border-surface-300/50">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Active &amp; Verified
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Advanced Infrastructure & Scaling Architecture Section ── */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-800 mb-1">
              <Cpu className="w-3.5 h-3.5" /> Advanced Infrastructure
            </div>
            <h2 className="text-xl font-bold text-surface-900">Distributed &amp; Cloud-Native Systems</h2>
          </div>
          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-2.5 py-1 rounded-full border border-primary-200 dark:border-primary-800">
            Enterprise Infrastructure
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {advancedInfrastructure.map((infra, idx) => {
            const Icon = infra.icon;
            return (
              <Card key={idx} className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-surface-200 dark:border-surface-300">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${infra.color}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-sm font-bold text-surface-900">{infra.category}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-200 text-surface-600 border border-surface-200 dark:border-surface-300">
                    {infra.badge}
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {infra.techs.map((t) => (
                    <div key={t.name} className="p-3 rounded-2xl bg-surface-50 dark:bg-surface-200/50 border border-surface-200 dark:border-surface-300 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-surface-900">{t.name}</span>
                        <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400">
                          {t.role}
                        </span>
                      </div>
                      <p className="text-xs text-surface-500 leading-relaxed">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Creator Signature ── */}
      <div className="pt-2 pb-1 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-surface-200 border border-surface-200 dark:border-surface-300 shadow-sm">
          <span className="text-xs text-surface-600 dark:text-surface-400 font-medium">Platform Architect &amp; Developer:</span>
          <span className="text-xs font-black text-primary-700 dark:text-white bg-primary-50 dark:bg-primary-950/80 px-3.5 py-1 rounded-xl border border-primary-200 dark:border-primary-700 shadow-2xs">
            Built by - Aman Singh
          </span>
        </div>
      </div>

      {/* Support / Contact Section */}
      <Card className="bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl border-0 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-white">Need Help or Have Questions?</h3>
            <p className="text-xs sm:text-sm text-primary-100 max-w-md">
              Our 24/7 dedicated support team is here to assist with bookings, warranties, technician inquiries, and emergency repairs.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-primary-200">
              <span className="flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5" /> +91-1800-FIXIT-PRO</span>
              <span>•</span>
              <span>support@fixit.com</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to={user ? (user.role === 'TECHNICIAN' ? '/technician/dashboard' : '/customer/dashboard') : '/register'}>
              <button
                type="button"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-2xl bg-white text-blue-950 dark:text-blue-950 font-black text-xs sm:text-sm hover:bg-blue-50 hover:shadow-lg transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {user ? 'Back to Dashboard' : 'Get Started Now'}
              </button>
            </Link>
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
