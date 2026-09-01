import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Search, Filter, ArrowUpRight, CheckCircle2,
  Clock, AlertCircle, RefreshCw, FileText, ChevronRight, ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Card, Badge, Button, Input } from '../../components/common';
import { PageSpinner } from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import paymentApi from '../../services/payment.api';
import { useAuth } from '../../contexts/AuthContext';
import { initiateRazorpayPayment } from '../../utils/razorpay';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'];

export default function PaymentHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [payingId, setPayingId] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentApi.getMyPaymentHistory({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search || undefined,
      });
      setPayments(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  const handlePayNow = async (payment) => {
    setPayingId(payment.id);
    await initiateRazorpayPayment({
      requestId: payment.requestId,
      user,
      onSuccess: () => {
        fetchPayments();
        setPayingId(null);
      },
      onFailure: () => {
        setPayingId(null);
      },
      onCancel: () => {
        setPayingId(null);
      },
    });
  };

  const totalSpent = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const paidCount = payments.filter((p) => p.status === 'PAID').length;
  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-surface-900 tracking-tight">Payment History</h1>
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                Razorpay Sandbox
              </span>
            </div>
            <p className="text-sm text-surface-500 mt-1">
              Track your service payments, transaction receipts, and pending invoices
            </p>
          </div>

          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchPayments}
            loading={loading}
            size="sm"
          >
            Refresh
          </Button>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-primary-500/20 bg-gradient-to-br from-primary-50/40 to-transparent dark:from-primary-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Total Spent</p>
                <h3 className="text-2xl font-black text-surface-900 mt-1">₹{totalSpent.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-glow">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-50/40 to-transparent dark:from-emerald-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Completed Payments</p>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{paidCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-50/40 to-transparent dark:from-amber-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Pending Invoices</p>
                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
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

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-72">
            <Input
              placeholder="Search service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-1.5 text-xs"
            />
            <Button type="submit" size="sm" variant="secondary" icon={Search}>
              Search
            </Button>
          </form>
        </div>

        {/* Content */}
        {loading ? (
          <PageSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchPayments} />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payment records found"
            description="You don't have any payment transactions matching the selected filters."
            action={
              <Button variant="primary" onClick={() => navigate('/customer/requests/new')}>
                Book a Service
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <Card
                key={p.id}
                className="hover:border-primary-500/30 transition-all p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`
                    w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0
                    ${p.status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' : p.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-600'}
                  `}>
                    {p.status === 'PAID' ? <CheckCircle2 className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-surface-900 text-sm">{p.request?.title || 'Service Booking'}</h4>
                      <Badge variant={p.status} size="sm">{p.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-surface-500 mt-1 flex-wrap">
                      <span>{p.request?.service?.name}</span>
                      <span>•</span>
                      <span>{format(new Date(p.createdAt), 'PPp')}</span>
                      {p.transactionId && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-surface-400">TXN: {p.transactionId}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-surface-100 dark:border-surface-300">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-surface-400">Amount</p>
                    <p className="text-lg font-black text-surface-900">₹{p.amount}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.status === 'PENDING' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        className="bg-blue-600 hover:bg-blue-700 font-bold"
                        onClick={() => handlePayNow(p)}
                        loading={payingId === p.id}
                      >
                        ⚡ Pay Now
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/customer/requests/${p.requestId}`)}
                      >
                        View Ticket
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
