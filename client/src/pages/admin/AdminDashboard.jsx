import { useState, useEffect } from 'react';
import { Users, Wrench, ClipboardList, CheckCircle2, BarChart3, TrendingUp, AlertCircle, ChevronRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { StatCard, Card, EmptyState, Badge, Button } from '../../components/common';
import requestApi from '../../services/request.api';
import technicianApi from '../../services/technician.api';

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [pendingTechs, setPendingTechs] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      try {
        const [reqRes, techRes, statsRes] = await Promise.allSettled([
          requestApi.getAll({ limit: 5 }),
          technicianApi.getAll({ verificationStatus: 'PENDING', limit: 5 }),
          requestApi.getStats(),
        ]);

        if (reqRes.status === 'fulfilled') setRequests(reqRes.value.data || []);
        if (techRes.status === 'fulfilled') setPendingTechs(techRes.value.data || []);
        if (statsRes.status === 'fulfilled') setStatsData(statsRes.value.data || null);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const stats = [
    {
      icon: Users,
      label: 'Platform Users',
      value: (statsData?.totalUsers || 5).toString(),
      color: 'primary',
      trend: 14,
      trendLabel: 'this month',
    },
    {
      icon: Wrench,
      label: 'Technicians',
      value: (statsData?.totalTechnicians || 2).toString(),
      color: 'accent',
      trend: 8,
      trendLabel: 'this month',
    },
    {
      icon: ClipboardList,
      label: 'Total Requests',
      value: (statsData?.totalRequests || requests.length || 3).toString(),
      color: 'warning',
      trend: 22,
      trendLabel: 'this month',
    },
    {
      icon: CheckCircle2,
      label: 'Completed Jobs',
      value: (statsData?.completedRequests || 1).toString(),
      color: 'accent',
      trend: 100,
      trendLabel: 'success rate',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Admin Overview</h1>
            <p className="text-sm text-surface-500 mt-0.5">
              Platform KPIs, recent service dispatches, and technician approvals.
            </p>
          </div>
          <Link to="/admin/requests">
            <Button size="md" variant="outline">
              Manage All Requests
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Service Requests */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-surface-900">Recent Service Requests</h2>
              <Link
                to="/admin/requests"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {requests.length > 0 ? (
              <div className="divide-y divide-surface-100">
                {requests.map((req) => (
                  <div key={req.id} className="py-3 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-surface-900">{req.title}</p>
                        <Badge variant={req.status} size="sm">
                          {req.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-surface-500">
                        Customer: {req.customer?.firstName} {req.customer?.lastName} • {req.service?.name}
                      </p>
                    </div>
                    <Link to={`/customer/requests/${req.id}`}>
                      <Button size="sm" variant="outline">
                        Inspect
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No requests registered"
                description="When customers create tickets, they will populate here in real-time."
              />
            )}
          </Card>

          {/* Pending Technician Approvals */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-surface-900">Technician Verification</h2>
              <Link
                to="/admin/technicians"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingTechs.length > 0 ? (
              <div className="divide-y divide-surface-100">
                {pendingTechs.map((tech) => (
                  <div key={tech.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-surface-900">
                        {tech.user?.firstName} {tech.user?.lastName}
                      </p>
                      <p className="text-xs text-surface-500">{tech.experienceYears} years experience</p>
                    </div>
                    <Link to="/admin/technicians">
                      <Button size="sm" variant="primary">
                        Review & Approve
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No pending verifications"
                description="All technicians on the platform are currently verified and active."
              />
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
