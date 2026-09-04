import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Card, Button, Avatar } from '../../components/common';
import { PageSpinner } from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import requestApi from '../../services/request.api';
import reviewApi from '../../services/review.api';
import toast from 'react-hot-toast';

const LABELS = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];

export default function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await requestApi.getById(id);
        const req = res.data?.request;
        if (req?.review) {
          // Already reviewed — go back
          toast('You have already reviewed this request.');
          navigate(`/customer/requests/${id}`, { replace: true });
          return;
        }
        setRequest(req);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load request');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const tech = request?.assignments?.find((a) => a.status === 'ACCEPTED')?.technician;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    setSubmitting(true);
    try {
      await reviewApi.create({ requestId: id, rating, comment: comment.trim() });
      setSubmitted(true);
      toast.success('Review submitted! Thank you.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><PageSpinner /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} /></DashboardLayout>;

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto mt-16 text-center space-y-6 animate-fade-in">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-accent-500" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Review Submitted!</h1>
            <p className="text-sm text-surface-500 mt-2">
              Your {rating}-star review for <span className="font-semibold text-surface-700">"{request?.title}"</span> has been saved.
              {tech && <> The technician <span className="font-semibold text-surface-700">{tech.user?.firstName}</span> has been notified.</>}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/customer/requests/history')}>
              View History
            </Button>
            <Button variant="primary" onClick={() => navigate('/customer/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-surface-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-surface-900">Leave a Review</h1>
            <p className="text-sm text-surface-500 mt-0.5">"{request?.title}"</p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Technician info */}
            {tech && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
                <Avatar
                  src={tech.user?.avatarUrl}
                  name={`${tech.user?.firstName} ${tech.user?.lastName}`}
                  size="lg"
                />
                <div>
                  <p className="font-semibold text-surface-900">
                    {tech.user?.firstName} {tech.user?.lastName}
                  </p>
                  <p className="text-xs text-surface-500">
                    {tech.totalJobsCompleted || 0} jobs completed • {tech.experienceYears || 0} yrs exp
                  </p>
                </div>
              </div>
            )}

            {/* Star Rating */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-surface-700 uppercase tracking-wider">
                Your Rating <span className="text-danger-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= (hovered || rating)
                          ? 'text-warning-400 fill-warning-400'
                          : 'text-surface-300 dark:text-surface-600'
                      }`}
                    />
                  </button>
                ))}
                {(hovered || rating) > 0 && (
                  <span className="ml-2 text-sm font-semibold text-warning-500">
                    {LABELS[hovered || rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-surface-700 uppercase tracking-wider">
                Comment <span className="text-surface-400 font-normal normal-case">(optional)</span>
              </label>
              <textarea
                rows={4}
                placeholder="Share your experience — was the technician punctual, professional, and effective?"
                className="w-full rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 px-4 py-3 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-surface-400 text-right">{comment.length}/500</p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              variant="primary"
              size="md"
              icon={Send}
              loading={submitting}
              disabled={rating === 0}
              className="h-11 font-bold"
            >
              Submit Review
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
