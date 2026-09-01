import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Search, RefreshCw, CheckCircle2, Clock,
  AlertTriangle, ShieldCheck, ArrowUpRight, TrendingUp, IndianRupee
} from 'lucide-react';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Card, Badge, Button, Input } from '../../components/common';
import { PageSpinner } from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import paymentApi from '../../services/payment.api';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'];

export default function AdminPaymentsPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchPaymentsAndStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        paymentApi.getAllPayments({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          search: search || undefined,
        }),
        paymentApi.getAdminStats(),
      ]);

      setPayments(paymentsRes.data?.data || paymentsRes.data || []);
      setStats(statsRes.data || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsAndStats();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPaymentsAndStats();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-surface-900 tracking-tight">Payment Administration</h1>
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                Razorpay Enterprise
              </span>
            </div>
            <p className="text-sm text-surface-500 mt-1">
              Global overview of transactions, platform revenue, and Razorpay settlements
            </p>
          </div>

          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchPaymentsAndStats}
            loading={loading}
            size="sm"
          >
            Refresh Data
          </Button>
        </div>

        {/* KPI Summary Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-primary-500/20 bg-gradient-to-br from-primary-50/40 to-transparent dark:from-primary-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Total Revenue</p>
                  <h3 className="text-2xl font-black text-surface-900 mt-1">
                    ₹{(stats.totalRevenue || 0).toLocaleString()}
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-glow">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-50/40 to-transparent dark:from-emerald-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Successful (PAID)</p>
                  <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {stats.PAID || 0}
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="border-amber-500/20 bg-gradient-to-br from-amber-50/40 to-transparent dark:from-amber-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Pending Orders</p>
                  <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                    {stats.PENDING || 0}
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="border-rose-500/20 bg-gradient-to-br from-rose-50/40 to-transparent dark:from-rose-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Failed / Refunded</p>
                  <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                    {(stats.FAILED || 0) + (stats.REFUNDED || 0)}
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 rounded-2xl bg-surface-100 dark:bg-surface-200/60 border border-surface-200 dark:border-surface-300">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`
                  px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap
                  ${statusFilter === s
                    ? 'bg-white dark:bg-surface-300 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-surface-600 hover:text-surface-900'}
                `}
              >
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-72">
            <Input
              placeholder="Search request or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-1.5 text-xs"
            />
            <Button type="submit" size="sm" variant="secondary" icon={Search}>
              Filter
            </Button>
          </form>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <PageSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchPaymentsAndStats} />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No transactions recorded"
            description="No payments matching your query are currently logged."
          />
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-50 dark:bg-surface-200/50 border-b border-surface-200 dark:border-surface-300 text-xs font-bold text-surface-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Customer & Request</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Gateway / Method</th>
                    <th className="px-5 py-3.5">Transaction ID</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-300/60 font-medium">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-200/20 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-surface-900 text-sm">
                            {p.request?.customer?.firstName} {p.request?.customer?.lastName}
                          </p>
                          <p className="text-xs text-surface-500 truncate max-w-xs">
                            {p.request?.title || 'Service Booking'}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-extrabold text-surface-900 text-base">₹{p.amount}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={p.status} size="sm">{p.status}</Badge>
                      </td>
                      <td className="px-5 py-4 text-xs text-surface-600">
                        <span className="px-2 py-0.5 rounded-lg bg-surface-100 dark:bg-surface-200 font-bold">
                          {p.method || 'Razorpay'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-surface-500">
                        {p.transactionId ? (
                          <span className="truncate max-w-[130px] block" title={p.transactionId}>
                            {p.transactionId}
                          </span>
                        ) : (
                          <span className="text-surface-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-surface-500 whitespace-nowrap">
                        {format(new Date(p.createdAt), 'dd MMM yyyy, HH:mm')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/admin/requests`)}
                        >
                          View Request
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
