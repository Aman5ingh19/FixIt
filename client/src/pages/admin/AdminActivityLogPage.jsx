import { useState, useEffect } from 'react';
import { Activity, Search, User, Clock, Server } from 'lucide-react';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Card, Badge, EmptyState, Pagination, Input } from '../../components/common';
import { TableSkeleton } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import api from '../../services/api';

export default function AdminActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/activity-logs', { params: { page, limit: 20 } });
      setLogs(res.data?.data || []);
      setPagination(res.data?.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page]);

  const getMethodBadge = (action) => {
    if (action.startsWith('POST')) return 'accent';
    if (action.startsWith('PUT') || action.startsWith('PATCH')) return 'warning';
    if (action.startsWith('DELETE')) return 'error';
    return 'info';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Activity Log</h1>
          <p className="text-surface-500 mt-1">Audit trail of all platform actions</p>
        </div>

        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchLogs} />
        ) : logs.length === 0 ? (
          <EmptyState icon={Activity} title="No activity recorded" description="Actions will appear here as users interact with the platform." />
        ) : (
          <div className="bg-white dark:bg-[#151F32] rounded-2xl border border-surface-200 dark:border-surface-300 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-50 dark:bg-[#111827] text-surface-600 dark:text-surface-700 text-left border-b border-surface-200 dark:border-surface-300">
                    <th className="px-4 py-3 font-semibold">Timestamp</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                    <th className="px-4 py-3 font-semibold">Resource</th>
                    <th className="px-4 py-3 font-semibold">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-300">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-50 dark:hover:bg-surface-200/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-surface-500 whitespace-nowrap">
                        {format(new Date(log.createdAt), 'PP HH:mm:ss')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-surface-200 flex items-center justify-center">
                            <User className="w-3 h-3 text-surface-500" />
                          </div>
                          <div>
                            <p className="font-medium text-surface-800 text-xs">
                              {log.user?.firstName} {log.user?.lastName}
                            </p>
                            <p className="text-[10px] text-surface-400">{log.user?.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getMethodBadge(log.action)} size="sm">
                          {log.action.split(' ')[0]}
                        </Badge>
                        <span className="ml-1.5 text-xs text-surface-500 font-mono">
                          {log.action.split(' ').slice(1).join(' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-surface-600">{log.resource || '—'}</td>
                      <td className="px-4 py-3 text-xs text-surface-400 font-mono">{log.ipAddress || '—'}</td>
                    </tr>
                  ))}
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
