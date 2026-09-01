import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, ChevronRight, Search, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Card, Badge, EmptyState, Pagination, Input } from '../../components/common';
import { CardSkeleton } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import Avatar from '../../components/common/Avatar';
import requestApi from '../../services/request.api';

const STATUS_FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED'];

export default function ActiveRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search) params.search = search;
      const res = await requestApi.getMyRequests(params);
      setRequests(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Active Requests</h1>
          <p className="text-surface-500 mt-1">Track your ongoing service requests</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <Input placeholder="Search requests..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
          <div className="flex gap-2 overflow-x-auto touch-scroll-x pb-1">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-surface-100 dark:bg-surface-200 text-surface-600 dark:text-surface-700 hover:bg-surface-200 dark:hover:bg-surface-300'
                }`}
              >
                {status === 'ALL' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchRequests} />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No active requests"
            description={statusFilter !== 'ALL' ? `No requests with status "${statusFilter}".` : 'Create a service request to get started.'}
            actionLabel="New Request"
            action={() => window.location.href = '/customer/requests/new'}
          />
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const tech = req.assignments?.[0]?.technician;
              return (
                <Link key={req.id} to={`/customer/requests/${req.id}`}>
                  <Card hover className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                    {/* Left: Image or icon */}
                    <div className="w-16 h-16 rounded-xl bg-surface-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {req.images?.[0] ? (
                        <img src={req.images[0].imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Clock className="w-6 h-6 text-surface-400" />
                      )}
                    </div>

                    {/* Middle: Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-surface-900 truncate">{req.title}</h3>
                        <Badge variant={req.status} size="sm" className="shrink-0">{req.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-xs text-surface-500 mb-2">
                        {req.service?.name} • {req.location?.city}, {req.location?.state}
                      </p>
                      <div className="flex items-center gap-3">
                        {tech && (
                          <div className="flex items-center gap-1.5">
                            <Avatar src={tech.user?.avatarUrl} name={`${tech.user?.firstName} ${tech.user?.lastName}`} size="sm" />
                            <span className="text-xs text-surface-600">{tech.user?.firstName} {tech.user?.lastName}</span>
                          </div>
                        )}
                        <span className="text-xs text-surface-400">
                          {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {/* Right: Chevron */}
                    <ChevronRight className="w-5 h-5 text-surface-300 hidden sm:block shrink-0" />
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
      </div>
    </DashboardLayout>
  );
}
