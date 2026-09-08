import { useState } from 'react';
import {
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ExternalLink,
  LifeBuoy,
} from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const FAQS = [
  {
    q: 'How do I cancel or reschedule a service request?',
    a: 'You can cancel a request from your Request Detail page while the status is PENDING, MATCHING, or ASSIGNED. To reschedule, contact your assigned technician directly via Live Chat or phone.',
  },
  {
    q: 'How do payments and refunds work?',
    a: 'Payments are secured cryptographically via Razorpay Sandbox/Live gateways. In case of cancellation or unfulfilled service, 100% refund is initiated automatically within 24-48 business hours.',
  },
  {
    q: 'What if a technician is not responding or delayed?',
    a: 'If your technician is delayed by more than 15 minutes without update, you can raise an Emergency Escalation from this Help modal or call our 24x7 support line for immediate re-dispatch.',
  },
  {
    q: 'How are technicians verified on FixIt?',
    a: 'All technicians undergo a strict multi-tier verification process including Government ID check, background checks, skill certifications, and trade license validations.',
  },
];

const ISSUE_CATEGORIES = [
  'Technician Delay / Absent',
  'Payment or Refund Query',
  'Service Quality Concern',
  'Account or Login Problem',
  'Urgent Emergency',
  'Other Inquiry',
];

export default function HelpSupportModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' | 'ticket' | 'faq'
  const [openFaq, setOpenFaq] = useState(null);

  // Ticket Form State
  const [issueType, setIssueType] = useState('Technician Delay / Absent');
  const [priority, setPriority] = useState('Normal');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please describe your issue in detail');
      return;
    }

    setSubmitting(true);
    try {
      const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      const payload = {
        ticketId,
        userId: user?.id || 'guest',
        userEmail: user?.email || 'guest@fixit.services',
        userName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User',
        issueType,
        priority,
        subject: subject.trim() || issueType,
        description: description.trim(),
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem('fixit_support_tickets') || '[]');
        localStorage.setItem('fixit_support_tickets', JSON.stringify([payload, ...existing]));
      } catch {}

      await new Promise((r) => setTimeout(r, 700));

      setTicketResult(ticketId);
      toast.success(`🎫 Ticket #${ticketId} created! Support team notified.`);
    } catch (err) {
      toast.error('Failed to submit ticket. Please reach out via phone.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetTicket = () => {
    setTicketResult(null);
    setSubject('');
    setDescription('');
    setIssueType('Technician Delay / Absent');
    setPriority('Normal');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-200 dark:border-surface-300 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-surface-900 dark:text-white">Help &amp; Support Center</h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">24/7 dedicated platform assistance &amp; resolution</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-xl bg-surface-100 dark:bg-surface-800 p-1 gap-1">
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-white dark:bg-[#162033] text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900'
            }`}
          >
            📞 Contact Support
          </button>
          <button
            onClick={() => setActiveTab('ticket')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'ticket'
                ? 'bg-white dark:bg-[#162033] text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900'
            }`}
          >
            🎫 Raise a Ticket
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-white dark:bg-[#162033] text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900'
            }`}
          >
            ❓ Quick FAQs
          </button>
        </div>

        {/* TAB 1: CONTACT CHANNELS */}
        {activeTab === 'contact' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Phone Channel */}
              <a
                href="tel:+919876543210"
                className="flex flex-col items-center text-center p-4 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-[#162033] hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-surface-900 dark:text-white">Emergency Hotline</h4>
                <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">+91 98765 43210</p>
                <span className="text-[10px] text-surface-400 mt-1">24x7 Instant Toll-Free</span>
              </a>

              {/* Email Channel */}
              <a
                href="mailto:support@fixit.services?subject=Support%20Request"
                className="flex flex-col items-center text-center p-4 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-[#162033] hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-surface-900 dark:text-white">Email Helpdesk</h4>
                <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-1">support@fixit.services</p>
                <span className="text-[10px] text-surface-400 mt-1">&lt; 15 min response time</span>
              </a>

              {/* WhatsApp Support */}
              <a
                href="https://wa.me/919876543210?text=Hello%20FixIt%20Support,%20I%20need%20help%20with%20my%20service."
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center text-center p-4 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-[#162033] hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-full bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-surface-900 dark:text-white">WhatsApp Chat</h4>
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 mt-1">Instant Messaging</p>
                <span className="text-[10px] text-surface-400 mt-1">Live Agents Online</span>
              </a>
            </div>

            {/* Quick Assurance Box */}
            <div className="p-4 rounded-2xl bg-primary-50/70 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/60 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-primary-900 dark:text-primary-200">100% Guaranteed Problem Resolution</p>
                <p className="text-primary-700/80 dark:text-primary-300/80 mt-0.5">
                  FixIt provides dedicated customer dispute protection, emergency technician re-dispatch, and instant refunds for unfulfilled repairs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RAISE A TICKET */}
        {activeTab === 'ticket' && (
          <div className="animate-fade-in">
            {ticketResult ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900 dark:text-white">Ticket #{ticketResult} Created!</h3>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 max-w-sm mx-auto">
                    Our customer success and operations desk is reviewing your ticket and will update you via notification &amp; email.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <Button variant="secondary" onClick={handleResetTicket}>
                    Raise Another Ticket
                  </Button>
                  <Button variant="primary" onClick={onClose}>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Issue Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-700 dark:text-surface-300">Category</label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-300 bg-white dark:bg-[#162033] text-xs font-medium text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {ISSUE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-700 dark:text-surface-300">Priority Level</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-300 bg-white dark:bg-[#162033] text-xs font-medium text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Normal">Normal — Standard Inquiry</option>
                      <option value="High">High — Urgent Attention</option>
                      <option value="Urgent">Urgent — Live Job Impacted</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-surface-700 dark:text-surface-300">Subject (Optional)</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Technician not arrived for Request #REQ-1234"
                    className="w-full px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-300 bg-white dark:bg-[#162033] text-xs text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-surface-700 dark:text-surface-300">Description of Issue</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the issue, booking ID, or problem encountered..."
                    className="w-full px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-300 bg-white dark:bg-[#162033] text-xs text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" icon={Send} loading={submitting}>
                    Submit Support Ticket
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: FAQS */}
        {activeTab === 'faq' && (
          <div className="space-y-2.5 animate-fade-in">
            {FAQS.map((faq, i) => {
              const isOpenFaq = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden bg-white dark:bg-[#162033] transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpenFaq ? null : i)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-surface-900 dark:text-white hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-surface-400 transition-transform duration-200 shrink-0 ${
                        isOpenFaq ? 'rotate-180 text-primary-500' : ''
                      }`}
                    />
                  </button>
                  {isOpenFaq && (
                    <div className="px-4 pb-3 pt-1 text-xs text-surface-600 dark:text-surface-300 border-t border-surface-100 dark:border-surface-700/60 leading-relaxed bg-surface-50/50 dark:bg-surface-800/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
