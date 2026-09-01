import { useState, useEffect } from 'react';
import { MapPin, Clock, ChevronRight, Briefcase, DollarSign, MessageSquare } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Card, Badge, Button, EmptyState, Modal } from '../../components/common';
import { CardSkeleton } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import ChatPanel from '../../components/chat/ChatPanel';
import technicianApi from '../../services/technician.api';
import toast from 'react-hot-toast';

export default function AssignedJobsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});
  const [chatTarget, setChatTarget] = useState(null); // { requestId, customer }

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await technicianApi.getAssignedJobs();
      setAssignments(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleStartJob = async (requestId) => {
    setStatusLoading((p) => ({ ...p, [requestId]: 'start' }));
    try {
      await technicianApi.updateJobStatus(requestId, 'IN_PROGRESS');
      toast.success('Job started!');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start');
    } finally {
      setStatusLoading((p) => ({ ...p, [requestId]: null }));
    }
  };

  const handleCompleteJob = async (requestId) => {
    setStatusLoading((p) => ({ ...p, [requestId]: 'complete' }));
    try {
      await technicianApi.updateJobStatus(requestId, 'COMPLETED');
      toast.success('Job completed!');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete');
    } finally {
      setStatusLoading((p) => ({ ...p, [requestId]: null }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in pb-12">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Assigned Jobs</h1>
          <p className="text-surface-500 mt-1">Jobs you've accepted — manage progress and live chat with customers</p>
        </div>

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchJobs} />
        ) : assignments.length === 0 ? (
          <EmptyState icon={Briefcase} title="No assigned jobs" description="Accept available requests to see them here." />
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const req = assignment.request;
              if (!req) return null;

              return (
                <Card key={assignment.id} className="animate-slide-up">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-16 h-16 rounded-xl bg-surface-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {req.images?.[0] ? (
                        <img src={req.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Briefcase className="w-6 h-6 text-surface-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-surface-900 truncate">{req.title}</h3>
                        <Badge variant={req.status} size="sm" className="shrink-0">{req.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-surface-500">{req.service?.name}</p>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-surface-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {req.location?.address}, {req.location?.city}
                        </span>
                        <span className="flex items-center gap-1">
                          👤 {req.customer?.firstName} {req.customer?.lastName}
                        </span>
                        {req.customer?.phone && (
                          <a href={`tel:${req.customer.phone}`} className="text-primary-600 hover:text-primary-700">
                            📞 {req.customer.phone}
                          </a>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        {/* Live Chat Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          icon={MessageSquare}
                          onClick={() => setChatTarget({ requestId: req.id, customer: req.customer })}
                          className="border-primary-200 dark:border-primary-800 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40"
                        >
                          Chat with Customer
                        </Button>

                        {req.status === 'ACCEPTED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStartJob(req.id)}
                            loading={statusLoading[req.id] === 'start'}
                          >
                            Start Job
                          </Button>
                        )}
                        {req.status === 'IN_PROGRESS' && (
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={() => handleCompleteJob(req.id)}
                            loading={statusLoading[req.id] === 'complete'}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Live Chat Modal for Technician */}
        {chatTarget && (
          <Modal isOpen={!!chatTarget} onClose={() => setChatTarget(null)} size="md">
            <div className="h-[460px] -m-6 rounded-2xl overflow-hidden">
              <ChatPanel
                requestId={chatTarget.requestId}
                otherUser={chatTarget.customer}
                onClose={() => setChatTarget(null)}
              />
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
