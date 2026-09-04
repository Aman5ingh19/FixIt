import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, Star, Phone, MessageSquare,
  CheckCircle2, XCircle, User, Wrench, Image as ImageIcon,
  Calendar, AlertTriangle, CreditCard, ShieldCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Button, Badge, Card, Modal, Input, ConfirmDialog, Avatar } from '../../components/common';
import { PageSpinner } from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import ChatPanel from '../../components/chat/ChatPanel';
import requestApi from '../../services/request.api';
import { useAuth } from '../../contexts/AuthContext';
import { initiateRazorpayPayment } from '../../utils/razorpay';
import toast from 'react-hot-toast';

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [imageModal, setImageModal] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await requestApi.getById(id);
      setRequest(res.data?.request);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequest(); }, [id]);

  const handlePayNow = async () => {
    setPaying(true);
    await initiateRazorpayPayment({
      requestId: id,
      user,
      onSuccess: () => {
        fetchRequest();
        setPaying(false);
      },
      onFailure: () => {
        setPaying(false);
      },
      onCancel: () => {
        setPaying(false);
      },
    });
  };

  useEffect(() => { fetchRequest(); }, [id]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    setCancelLoading(true);
    try {
      await requestApi.cancel(id, cancelReason);
      toast.success('Request cancelled');
      fetchRequest();
      setCancelOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      await requestApi.confirmCompletion(id);
      toast.success('Completion confirmed!');
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm');
    }
  };

  if (loading) return <DashboardLayout><PageSpinner /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={fetchRequest} /></DashboardLayout>;
  if (!request) return <DashboardLayout><ErrorState title="Not found" message="This request does not exist." /></DashboardLayout>;

  const tech = request.assignments?.find((a) => a.status === 'ACCEPTED')?.technician;
  const canCancel = ['PENDING', 'MATCHING', 'ASSIGNED'].includes(request.status);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-surface-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-surface-500" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-surface-900 truncate max-w-full">{request.title}</h1>
              <Badge variant={request.status} size="lg" dot className="shrink-0">{request.status.replace('_', ' ')}</Badge>
            </div>
            <p className="text-sm text-surface-500 mt-1">
              {request.service?.name} • Created {format(new Date(request.createdAt), 'PPp')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <h3 className="text-sm font-semibold text-surface-900 mb-3">Problem Description</h3>
              <p className="text-sm text-surface-600 whitespace-pre-wrap">{request.description}</p>
              <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 pt-4 border-t border-surface-100">
                <div className="flex items-center gap-1.5 text-xs text-surface-500 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {['Normal', 'High', 'Urgent'][request.priority]} priority
                </div>
                {request.scheduledAt && (
                  <div className="flex items-center gap-1.5 text-xs text-surface-500">
                    <Calendar className="w-3.5 h-3.5" />
                    Scheduled: {format(new Date(request.scheduledAt), 'PPp')}
                  </div>
                )}
              </div>
            </Card>

            {/* Images */}
            {request.images?.length > 0 && (
              <Card>
                <h3 className="text-sm font-semibold text-surface-900 mb-3">Photos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {request.images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setImageModal(img.imageUrl)}
                      className="aspect-video rounded-lg overflow-hidden border border-surface-200 hover:shadow-md transition-shadow"
                    >
                      <img src={img.imageUrl} alt={img.caption || `Photo ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Location */}
            {request.location && (
              <Card>
                <h3 className="text-sm font-semibold text-surface-900 mb-3">Service Location</h3>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                  <div className="text-sm text-surface-600">
                    <p>{request.location.address}</p>
                    <p>{request.location.city}, {request.location.state} — {request.location.zipCode}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Status Timeline */}
            <Card>
              <h3 className="text-sm font-semibold text-surface-900 mb-4">Status Timeline</h3>
              <div className="space-y-4">
                {[
                  { status: 'PENDING', label: 'Request Created', time: request.createdAt },
                  request.status !== 'PENDING' && { status: 'MATCHING', label: 'Matching Technicians', time: request.updatedAt },
                  tech && { status: 'ACCEPTED', label: `Accepted by ${tech.user?.firstName}`, time: request.updatedAt },
                  request.status === 'IN_PROGRESS' && { status: 'IN_PROGRESS', label: 'Service In Progress', time: request.updatedAt },
                  request.status === 'COMPLETED' && { status: 'COMPLETED', label: 'Completed', time: request.completedAt },
                  request.status === 'CANCELLED' && { status: 'CANCELLED', label: 'Cancelled', time: request.cancelledAt },
                ].filter(Boolean).map((item, i, arr) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${i === arr.length - 1 ? 'bg-primary-500 ring-4 ring-primary-100' : 'bg-accent-500'}`} />
                      {i < arr.length - 1 && <div className="w-0.5 flex-1 bg-surface-200 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-surface-800">{item.label}</p>
                      {item.time && <p className="text-xs text-surface-400">{format(new Date(item.time), 'PPp')}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Technician Card */}
            {tech && (
              <Card>
                <h3 className="text-sm font-semibold text-surface-900 mb-3">Assigned Technician</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar src={tech.user?.avatarUrl} name={`${tech.user?.firstName} ${tech.user?.lastName}`} size="lg" />
                  <div>
                    <p className="font-semibold text-surface-900">{tech.user?.firstName} {tech.user?.lastName}</p>
                    <div className="flex items-center gap-1 text-xs text-surface-500">
                      <Star className="w-3 h-3 text-warning-500 fill-warning-500" />
                      {tech.averageRating?.toFixed(1) || 'N/A'} • {tech.totalJobsCompleted || 0} jobs
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {tech.user?.phone && (
                    <a href={`tel:${tech.user.phone}`} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700">
                      <Phone className="w-4 h-4" /> Call Technician
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setChatOpen(true)}
                    className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-950/50 hover:bg-primary-100 dark:hover:bg-primary-900/50 px-3 py-2 rounded-xl border border-primary-200 dark:border-primary-800 transition-all cursor-pointer w-full justify-center"
                  >
                    <MessageSquare className="w-4 h-4" /> Live Chat with Technician
                  </button>
                </div>
              </Card>
            )}

            {/* Actions — only for customers */}
            {user?.role === 'CUSTOMER' && (canCancel || (request.status === 'COMPLETED' && !request.review)) && (
              <Card>
                <h3 className="text-sm font-semibold text-surface-900 mb-3">Actions</h3>
                <div className="space-y-2">
                  {request.status === 'COMPLETED' && !request.review && (
                    <Button fullWidth variant="accent" icon={Star} onClick={() => navigate(`/customer/requests/${id}/review`)}>
                      Leave a Review
                    </Button>
                  )}
                  {canCancel && (
                    <Button fullWidth variant="danger" icon={XCircle} onClick={() => setCancelOpen(true)}>
                      Cancel Request
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Review Card — shown after customer submits, visible to customer + admin */}
            {request.review && (
              <Card className="border-warning-200 dark:border-warning-800/50 bg-warning-50/30 dark:bg-warning-900/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
                    <Star className="w-4 h-4 text-warning-500 fill-warning-500" />
                    {user?.role === 'ADMIN' ? 'Customer Review' : 'Your Review'}
                  </h3>
                  <span className="text-xs text-surface-400">
                    {format(new Date(request.review.createdAt), 'PP')}
                  </span>
                </div>
                {/* Stars */}
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${s <= request.review.rating ? 'text-warning-400 fill-warning-400' : 'text-surface-200 dark:text-surface-600'}`}
                    />
                  ))}
                  <span className="ml-1.5 text-sm font-bold text-warning-600">{request.review.rating}/5</span>
                </div>
                {/* Comment */}
                {request.review.comment && (
                  <p className="text-sm text-surface-600 dark:text-surface-400 italic leading-relaxed">
                    "{request.review.comment}"
                  </p>
                )}
              </Card>
            )}

            {/* Payment Section */}
            <Card className={request.payment?.status === 'PAID' ? 'border-emerald-500/30 bg-emerald-50/10' : 'border-primary-500/20 bg-primary-50/10'}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
                  <CreditCard className={`w-4 h-4 ${request.payment?.status === 'PAID' ? 'text-emerald-500' : 'text-primary-600'}`} />
                  {request.payment?.status === 'PAID' ? 'Payment Receipt' : 'Service Payment'}
                </h3>
                <Badge variant={request.payment?.status || 'PENDING'} size="sm">
                  {request.payment?.status || 'PENDING'}
                </Badge>
              </div>

              {request.payment?.status === 'PAID' ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-500">Amount Paid</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₹{request.payment.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">Gateway</span>
                    <span className="font-medium text-surface-700">Razorpay (Test)</span>
                  </div>
                  {request.payment.transactionId && (
                    <div className="flex justify-between text-xs text-surface-400 pt-1 border-t border-surface-200 dark:border-surface-300">
                      <span>Transaction ID</span>
                      <span className="font-mono truncate max-w-[130px]">{request.payment.transactionId}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Cryptographic Payment</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-surface-500">Total Payable</span>
                    <span className="font-black text-lg text-primary-600 dark:text-primary-400">
                      ₹{request.payment?.amount || request.service?.basePrice || 499}
                    </span>
                  </div>
                  <Button
                    fullWidth
                    variant="primary"
                    className="bg-blue-600 hover:bg-blue-700 font-bold shadow-md shadow-blue-600/20 py-2.5 flex items-center justify-center gap-2"
                    onClick={handlePayNow}
                    loading={paying}
                  >
                    ⚡ Pay with Razorpay
                  </Button>
                  <p className="text-[11px] text-center text-surface-400">
                    Secure 256-bit SSL encrypted • Razorpay Sandbox
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Cancel modal */}
        <Modal isOpen={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel Request" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-surface-600">Please tell us why you're cancelling this request.</p>
            <textarea
              rows={3}
              placeholder="Reason for cancellation..."
              className="w-full rounded-lg border border-surface-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setCancelOpen(false)}>Keep Request</Button>
              <Button variant="danger" onClick={handleCancel} loading={cancelLoading}>Cancel Request</Button>
            </div>
          </div>
        </Modal>

        {/* Live Chat Modal */}
        {tech && (
          <Modal isOpen={chatOpen} onClose={() => setChatOpen(false)} size="md">
            <div className="h-[460px] -m-6 rounded-2xl overflow-hidden">
              <ChatPanel
                requestId={id}
                otherUser={tech.user}
                onClose={() => setChatOpen(false)}
              />
            </div>
          </Modal>
        )}

        {/* Image lightbox */}
        <Modal isOpen={!!imageModal} onClose={() => setImageModal(null)} size="xl" showClose>
          {imageModal && <img src={imageModal} alt="Full size" className="w-full rounded-lg" />}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
