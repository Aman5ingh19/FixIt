import { useState, useEffect } from 'react';
import { ClipboardList, Search, ChevronRight, MapPin, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Card, Badge, EmptyState, Pagination, Input } from '../../components/common';
import { TableSkeleton } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import requestApi from '../../services/request.api';

const STATUSES = ['ALL', 'PENDING', 'MATCHING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 15 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search) params.search = search;
      const res = await requestApi.getAll(params);
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
          <h1 className="text-2xl font-bold text-surface-900">All Requests</h1>
          <p className="text-surface-500 mt-1">Manage all service requests across the platform</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <Input placeholder="Search by title or customer email..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
        </div>

        <div className="flex gap-2 overflow-x-auto touch-scroll-x pb-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === s ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchRequests} />
        ) : requests.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No requests found" description="No requests match your filters." />
        ) : (
          <div className="bg-white dark:bg-[#151F32] rounded-2xl border border-surface-200 dark:border-surface-300 overflow-hidden shadow-xs">
            <div className="table-responsive">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="bg-surface-50 dark:bg-[#111827] text-surface-600 dark:text-surface-700 text-left border-b border-surface-200 dark:border-surface-300">
                    <th className="px-4 py-3 font-semibold">Request</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Service</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Technician</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-300">
                  {requests.map((req) => {
                    const tech = req.assignments?.[0]?.technician;
                    return (
                      <tr key={req.id} className="hover:bg-surface-50 dark:hover:bg-surface-200/50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-surface-900 truncate max-w-[200px]">{req.title}</p>
                            <p className="text-xs text-surface-400">{req.location?.city}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-surface-600">
                          {req.customer?.firstName} {req.customer?.lastName}
                        </td>
                        <td className="px-4 py-3 text-surface-600">{req.service?.name}</td>
                        <td className="px-4 py-3">
                          <Badge variant={req.status} size="sm">{req.status.replace('_', ' ')}</Badge>
                        </td>
                        <td className="px-4 py-3 text-surface-600">
                          {tech ? `${tech.user?.firstName} ${tech.user?.lastName}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-surface-400 text-xs">
                          {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
      </div>
    </DashboardLayout>
  );
}
