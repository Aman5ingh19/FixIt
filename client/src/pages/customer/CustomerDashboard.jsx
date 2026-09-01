import { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle2, PlusCircle, ArrowRight, ChevronRight, Wrench, AlertCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { StatCard, Card, Button, EmptyState, Badge } from '../../components/common';
import requestApi from '../../services/request.api';
import notificationApi from '../../services/notification.api';
import { useAuth } from '../../contexts/AuthContext';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [reqRes, notifRes] = await Promise.allSettled([
          requestApi.getMyRequests({ limit: 5 }),
          notificationApi.getNotifications({ limit: 5 }),
        ]);

        if (reqRes.status === 'fulfilled') {
          setRequests(reqRes.value.data || []);
        }
        if (notifRes.status === 'fulfilled') {
          setNotifications(notifRes.value.data || notifRes.value.notifications || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const activeCount = requests.filter((r) => !['COMPLETED', 'CANCELLED'].includes(r.status)).length;
  const inProgressCount = requests.filter((r) => r.status === 'IN_PROGRESS').length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;

  const stats = [
    { icon: PlusCircle, label: 'Total Requests', value: requests.length.toString(), color: 'primary' },
    { icon: ClipboardList, label: 'Active Requests', value: activeCount.toString(), color: 'warning' },
    { icon: Clock, label: 'In Progress', value: inProgressCount.toString(), color: 'primary' },
    { icon: CheckCircle2, label: 'Completed', value: completedCount.toString(), color: 'accent' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
              Welcome, {user?.firstName || 'Customer'}!
            </h1>
            <p className="text-sm text-surface-500 mt-0.5">
              Here is what’s happening with your service requests today.
            </p>
          </div>
          <Link to="/customer/requests/new">
            <Button icon={PlusCircle} size="lg" className="shadow-xs font-semibold">
              Book a Service
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Recent Requests & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Requests Card */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-surface-900">Recent Service Requests</h2>
              {requests.length > 0 && (
                <Link
                  to="/customer/requests/active"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {requests.length > 0 ? (
              <div className="divide-y divide-surface-100">
                {requests.slice(0, 4).map((req) => (
                  <Link
                    key={req.id}
                    to={`/customer/requests/${req.id}`}
                    className="py-3 flex items-center justify-between hover:bg-surface-50 -mx-2 px-2 rounded-xl transition-colors group"
                  >
                    <div className="space-y-1 min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-surface-900 group-hover:text-primary-600 transition-colors truncate">
                          {req.title}
                        </p>
                        <Badge variant={req.status} size="sm" className="shrink-0">
                          {req.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-surface-500 truncate">
                        {req.service?.name} • {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-surface-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No service requests yet"
                description="Report an issue with appliances, plumbing, AC, or electronics."
                action={() => {}}
                actionLabel="Create First Request"
              />
            )}
          </Card>

          {/* Recent Notifications Card */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-surface-900">Notifications & Updates</h2>
              <Link
                to="/customer/notifications"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {notifications.length > 0 ? (
              <div className="divide-y divide-surface-100">
                {notifications.slice(0, 4).map((notif) => (
                  <div key={notif.id} className="py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <p className="text-xs font-semibold text-surface-900">{notif.title}</p>
                      <p className="text-xs text-surface-500 line-clamp-2">{notif.body}</p>
                      <span className="text-[10px] text-surface-400">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="All caught up"
                description="You will receive live notifications when technicians update your requests."
              />
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
