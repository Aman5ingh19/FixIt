import { useState } from 'react';
import { Star, MessageSquareHeart, Send, CheckCircle2, Sparkles, ThumbsUp, Bug, Lightbulb, MessageCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES = [
  { id: 'EXPERIENCE', label: 'General Experience', icon: ThumbsUp, color: 'text-blue-500' },
  { id: 'SERVICE', label: 'Service Quality', icon: Sparkles, color: 'text-emerald-500' },
  { id: 'BUG', label: 'Bug Report', icon: Bug, color: 'text-rose-500' },
  { id: 'FEATURE', label: 'Feature Idea', icon: Lightbulb, color: 'text-amber-500' },
  { id: 'OTHER', label: 'Other', icon: MessageCircle, color: 'text-purple-500' },
];

const RATING_LABELS = {
  1: 'Poor — Needs lot of work',
  2: 'Fair — Okay experience',
  3: 'Good — Met expectations',
  4: 'Very Good — Really enjoyed it!',
  5: 'Excellent — Absolutely loved it! 🌟',
};

export default function FeedbackModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('EXPERIENCE');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comments.trim()) {
      toast.error('Please write a brief comment or suggestion');
      return;
    }

    setSubmitting(true);
    try {
      const feedbackPayload = {
        id: `fb_${Date.now()}`,
        userId: user?.id || 'guest',
        userName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Anonymous',
        userRole: user?.role || 'CUSTOMER',
        rating,
        category,
        comments: comments.trim(),
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage history
      try {
        const existing = JSON.parse(localStorage.getItem('fixit_user_feedbacks') || '[]');
        localStorage.setItem('fixit_user_feedbacks', JSON.stringify([feedbackPayload, ...existing]));
      } catch (err) {
        console.error('Failed to save feedback locally', err);
      }

      // Short artificial delay for smooth experience
      await new Promise((r) => setTimeout(r, 600));

      setSubmitted(true);
      toast.success('🎉 Thank you for your feedback! It helps make FixIt better.');
      setTimeout(() => {
        handleReset();
        onClose();
      }, 1500);
    } catch (err) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setRating(5);
    setHoverRating(0);
    setCategory('EXPERIENCE');
    setComments('');
    setSubmitted(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      {submitted ? (
        <div className="text-center py-8 px-4 space-y-4 animate-scale-in">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-extrabold text-surface-900 dark:text-white">Feedback Received!</h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mx-auto">
            Your insights directly shape the FixIt platform experience. We appreciate your time!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-surface-200 dark:border-surface-300 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-surface-900 dark:text-white">Share Your Feedback</h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">Help us improve your experience with FixIt</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider">
                Feedback Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`
                        flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer
                        ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20'
                            : 'border-surface-200 dark:border-surface-300 hover:bg-surface-50 dark:hover:bg-surface-200 text-surface-700 dark:text-surface-300'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${cat.color}`} />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-2 bg-surface-50 dark:bg-surface-200/50 p-4 rounded-2xl border border-surface-200 dark:border-surface-300 text-center">
              <label className="text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider block mb-1">
                How would you rate your overall experience?
              </label>
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                          : 'text-surface-300 dark:text-surface-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 transition-all">
                {RATING_LABELS[hoverRating || rating]}
              </p>
            </div>

            {/* Comments Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider">
                Your Comments & Suggestions
              </label>
              <textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="What did you like? What can we do better? Let us know in detail..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-300 bg-white dark:bg-[#162033] text-sm text-surface-900 dark:text-white placeholder:text-surface-400 dark:placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                maxLength={1000}
              />
              <div className="flex justify-between items-center text-[11px] text-surface-400">
                <span>All feedback is reviewed by the FixIt core team.</span>
                <span>{comments.length} / 1000</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={Send} loading={submitting} disabled={!comments.trim()}>
                Submit Feedback
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
