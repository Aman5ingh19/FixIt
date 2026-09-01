import { useState, useEffect } from 'react';
import { Users, Shield, CheckCircle2, XCircle, Search, ChevronRight, Star, MapPin, Briefcase } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Card, Badge, Button, EmptyState, Pagination, Input, Avatar, ConfirmDialog } from '../../components/common';
import { TableSkeleton } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import technicianApi from '../../services/technician.api';
import toast from 'react-hot-toast';

const VERIFICATION_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

export default function AdminTechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null); // { id, status, name }

  const fetchTechnicians = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 15 };
      if (filter !== 'ALL') params.verificationStatus = filter;
      const res = await technicianApi.getAll(params);
      setTechnicians(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load technicians');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTechnicians(); }, [page, filter]);

  const handleVerify = async () => {
    if (!confirmAction) return;
    try {
      await technicianApi.verify(confirmAction.id, confirmAction.status);
      toast.success(`Technician ${confirmAction.status === 'APPROVED' ? 'approved' : 'rejected'}`);
      setConfirmAction(null);
      fetchTechnicians();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Technician Management</h1>
          <p className="text-surface-500 mt-1">Verify, manage, and monitor technicians.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {VERIFICATION_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === f ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {f === 'ALL' ? 'All Technicians' : f}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchTechnicians} />
        ) : technicians.length === 0 ? (
          <EmptyState icon={Shield} title="No technicians found" description="No technicians match the current filter." />
        ) : (
          <div className="space-y-3">
            {technicians.map((tech) => (
              <Card key={tech.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar src={tech.user?.avatarUrl} name={`${tech.user?.firstName} ${tech.user?.lastName}`} size="lg" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-surface-900">{tech.user?.firstName} {tech.user?.lastName}</h3>
                    <Badge variant={tech.verificationStatus} size="sm">{tech.verificationStatus}</Badge>
                    <Badge variant={tech.availability} size="sm" dot>{tech.availability}</Badge>
                  </div>
                  <p className="text-sm text-surface-500">{tech.user?.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-surface-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-warning-500" /> {tech.averageRating?.toFixed(1) || 'N/A'} ({tech.totalReviews || 0} reviews)
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> {tech.totalJobsCompleted || 0} jobs
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {tech.serviceAreas?.map((a) => a.city).join(', ') || 'N/A'}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {tech.technicianServices?.map((ts) => (
                      <Badge key={ts.service?.name} variant="info" size="sm">{ts.service?.name}</Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  {tech.verificationStatus === 'PENDING' && (
                    <>
                      <Button
                        variant="accent"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => setConfirmAction({ id: tech.id, status: 'APPROVED', name: `${tech.user?.firstName} ${tech.user?.lastName}` })}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={XCircle}
                        onClick={() => setConfirmAction({ id: tech.id, status: 'REJECTED', name: `${tech.user?.firstName} ${tech.user?.lastName}` })}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleVerify}
          title={confirmAction?.status === 'APPROVED' ? 'Approve Technician' : 'Reject Technician'}
          message={`Are you sure you want to ${confirmAction?.status === 'APPROVED' ? 'approve' : 'reject'} ${confirmAction?.name}?`}
          confirmLabel={confirmAction?.status === 'APPROVED' ? 'Approve' : 'Reject'}
          variant={confirmAction?.status === 'APPROVED' ? 'accent' : 'danger'}
        />
      </div>
    </DashboardLayout>
  );
}
