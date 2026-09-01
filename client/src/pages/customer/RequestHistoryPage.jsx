import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Clock, ChevronRight, Star } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Card, Badge, EmptyState, Pagination } from '../../components/common';
import { CardSkeleton } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import Avatar from '../../components/common/Avatar';
import requestApi from '../../services/request.api';

export default function RequestHistoryPage() {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10, status: 'COMPLETED' };
      const res = await requestApi.getMyRequests(params);
      // Also get cancelled
      const res2 = await requestApi.getMyRequests({ page, limit: 10, status: 'CANCELLED' });
      const allData = [...(res.data || []), ...(res2.data || [])].sort(
        (a, b) => new Date(b.completedAt || b.cancelledAt || b.updatedAt) - new Date(a.completedAt || a.cancelledAt || a.updatedAt)
      );
      setRequests(allData);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [page]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Request History</h1>
          <p className="text-surface-500 mt-1">Your completed and cancelled service requests</p>
        </div>

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchHistory} />
        ) : requests.length === 0 ? (
          <EmptyState icon={HistoryIcon} title="No history yet" description="Your completed requests will appear here." />
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const tech = req.assignments?.[0]?.technician;
              return (
                <Link key={req.id} to={`/customer/requests/${req.id}`}>
                  <Card hover className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-surface-900 truncate">{req.title}</h3>
                        <Badge variant={req.status} size="sm" className="shrink-0">{req.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-xs text-surface-500">
                        {req.service?.name} • {req.location?.city}, {req.location?.state}
                      </p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {tech && (
                          <div className="flex items-center gap-1.5">
                            <Avatar src={tech.user?.avatarUrl} name={`${tech.user?.firstName} ${tech.user?.lastName}`} size="sm" />
                            <span className="text-xs text-surface-600">{tech.user?.firstName} {tech.user?.lastName}</span>
                          </div>
                        )}
                        <span className="text-xs text-surface-400">
                          {format(new Date(req.completedAt || req.cancelledAt || req.updatedAt), 'PP')}
                        </span>
                        {req.review && (
                          <div className="flex items-center gap-0.5 text-xs text-warning-600">
                            <Star className="w-3 h-3 fill-warning-500" />{req.review.rating}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-surface-300 hidden sm:block shrink-0" />
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
        {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
      </div>
    </DashboardLayout>
  );
}
