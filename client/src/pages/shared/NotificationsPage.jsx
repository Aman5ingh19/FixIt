import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, Wrench, MessageSquare, Star, Shield, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Card, Button, Badge, EmptyState, Pagination } from '../../components/common';
import { CardSkeleton } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import notificationApi from '../../services/notification.api';
import toast from 'react-hot-toast';

const iconMap = {
  REQUEST_CREATED: Wrench,
  REQUEST_ASSIGNED: Wrench,
  REQUEST_ACCEPTED: Wrench,
  REQUEST_IN_PROGRESS: Clock,
  REQUEST_COMPLETED: Wrench,
  REQUEST_CANCELLED: AlertCircle,
  NEW_MESSAGE: MessageSquare,
  TECHNICIAN_VERIFIED: Shield,
  REVIEW_RECEIVED: Star,
  SYSTEM: Bell,
};

const colorMap = {
  REQUEST_CREATED: 'bg-primary-50 text-primary-600',
  REQUEST_ASSIGNED: 'bg-primary-50 text-primary-600',
  REQUEST_ACCEPTED: 'bg-accent-50 text-accent-600',
  REQUEST_IN_PROGRESS: 'bg-blue-50 text-blue-600',
  REQUEST_COMPLETED: 'bg-accent-50 text-accent-600',
  REQUEST_CANCELLED: 'bg-danger-50 text-danger-600',
  NEW_MESSAGE: 'bg-primary-50 text-primary-600',
  TECHNICIAN_VERIFIED: 'bg-accent-50 text-accent-600',
  REVIEW_RECEIVED: 'bg-warning-50 text-warning-600',
  SYSTEM: 'bg-surface-100 text-surface-600',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 20 };
      if (filter === 'unread') params.isRead = 'false';
      if (filter === 'read') params.isRead = 'true';
      const res = await notificationApi.getNotifications(params);
      setNotifications(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [page, filter]);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch {
      toast.error('Failed to mark notifications');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // silent
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Notifications</h1>
            <p className="text-surface-500 mt-1">Stay updated on your requests and activities</p>
          </div>
          <Button variant="ghost" icon={CheckCheck} onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchNotifications} />
        ) : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const Icon = iconMap[notif.type] || Bell;
              const colors = colorMap[notif.type] || colorMap.SYSTEM;
              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                    notif.isRead
                      ? 'bg-white dark:bg-[#151F32] border-surface-200 dark:border-surface-300'
                      : 'bg-primary-50/50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800 hover:bg-primary-50/70 dark:hover:bg-primary-950/60'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${colors}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold ${notif.isRead ? 'text-surface-700' : 'text-surface-900'}`}>
                        {notif.title}
                      </h3>
                      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                    </div>
                    <p className="text-sm text-surface-500 mt-0.5">{notif.body}</p>
                    <p className="text-xs text-surface-400 mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
      </div>
    </DashboardLayout>
  );
}
