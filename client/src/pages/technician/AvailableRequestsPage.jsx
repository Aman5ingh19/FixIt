import { useState, useEffect } from 'react';
import { MapPin, Clock, ChevronRight, CheckCircle2, XCircle, Wrench } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Card, Badge, Button, EmptyState } from '../../components/common';
import { CardSkeleton } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import technicianApi from '../../services/technician.api';
import toast from 'react-hot-toast';

export default function AvailableRequestsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await technicianApi.getAvailableRequests();
      setAssignments(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAccept = async (requestId) => {
    setActionLoading((p) => ({ ...p, [requestId]: 'accept' }));
    try {
      await technicianApi.acceptRequest(requestId);
      toast.success('Request accepted! Check your assigned jobs.');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    } finally {
      setActionLoading((p) => ({ ...p, [requestId]: null }));
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading((p) => ({ ...p, [requestId]: 'reject' }));
    try {
      await technicianApi.rejectRequest(requestId);
      toast.success('Request declined');
      setAssignments((prev) => prev.filter((a) => a.request?.id !== requestId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading((p) => ({ ...p, [requestId]: null }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Available Requests</h1>
          <p className="text-surface-500 mt-1">New requests matching your skills and service area</p>
        </div>

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchRequests} />
        ) : assignments.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No available requests"
            description="New matching requests will appear here. Make sure your availability is set to Online."
          />
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const req = assignment.request;
              if (!req) return null;
              const rid = req.id;

              return (
                <Card key={assignment.id || rid} className="animate-slide-up">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-xl bg-surface-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {req.images?.[0] ? (
                        <img src={req.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Wrench className="w-8 h-8 text-surface-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-surface-900">{req.title}</h3>
                          <p className="text-sm text-surface-500 mt-0.5">
                            {req.service?.name} • {req.service?.category?.name}
                          </p>
                        </div>
                        <Badge variant={req.priority === 2 ? 'error' : req.priority === 1 ? 'warning' : 'info'} size="sm" className="shrink-0">
                          {['Normal', 'High', 'Urgent'][req.priority]}
                        </Badge>
                      </div>

                      <p className="text-sm text-surface-600 mt-2 line-clamp-2">{req.description}</p>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs text-surface-400">
                        {req.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {req.location.city}, {req.location.state}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          by {req.customer?.firstName} {req.customer?.lastName}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={CheckCircle2}
                          onClick={() => handleAccept(rid)}
                          loading={actionLoading[rid] === 'accept'}
                          disabled={!!actionLoading[rid]}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={XCircle}
                          onClick={() => handleReject(rid)}
                          loading={actionLoading[rid] === 'reject'}
                          disabled={!!actionLoading[rid]}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
