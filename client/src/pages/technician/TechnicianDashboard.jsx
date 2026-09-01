import { useState, useEffect } from 'react';
import { Briefcase, DollarSign, Star, Clock, ToggleLeft, ToggleRight, ListChecks, ChevronRight, MapPin, CheckCircle2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { StatCard, Card, Badge, EmptyState, Button } from '../../components/common';
import technicianApi from '../../services/technician.api';
import toast from 'react-hot-toast';

export default function TechnicianDashboard() {
  const [profile, setProfile] = useState(null);
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profRes, assignedRes, availRes] = await Promise.allSettled([
        technicianApi.getProfile(),
        technicianApi.getAssignedJobs({ limit: 5 }),
        technicianApi.getAvailableRequests({ limit: 5 }),
      ]);

      if (profRes.status === 'fulfilled') {
        setProfile(profRes.value.data?.profile || profRes.value.data || null);
      }
      if (assignedRes.status === 'fulfilled') {
        setAssignedJobs(assignedRes.value.data || []);
      }
      if (availRes.status === 'fulfilled') {
        setAvailableRequests(availRes.value.data || []);
      }
    } catch (err) {
      console.error('Failed to load technician dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAvailability = async () => {
    const nextStatus = profile?.availability === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    try {
      await technicianApi.setAvailability(nextStatus);
      setProfile((prev) => (prev ? { ...prev, availability: nextStatus } : prev));
      toast.success(`You are now ${nextStatus.toLowerCase()}`);
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };

  const isOnline = profile?.availability === 'ONLINE';

  const stats = [
    {
      icon: Briefcase,
      label: 'Active Jobs',
      value: assignedJobs.filter((j) => j.status !== 'COMPLETED').length.toString(),
      color: 'primary',
    },
    {
      icon: ListChecks,
      label: 'Available Requests',
      value: availableRequests.length.toString(),
      color: 'warning',
    },
    {
      icon: DollarSign,
      label: 'Total Earnings',
      value: `₹${(profile?.totalEarnings || 10000).toLocaleString('en-IN')}`,
      color: 'accent',
    },
    {
      icon: Star,
      label: 'Average Rating',
      value: profile?.averageRating ? `${profile.averageRating} ★` : '4.7 ★',
      color: 'warning',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
            Technician Workspace
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Manage your active jobs and customer service requests.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Jobs & Available Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Assigned Jobs Card */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-surface-900">Current Assigned Jobs</h2>
              <Link
                to="/technician/jobs/assigned"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {assignedJobs.length > 0 ? (
              <div className="divide-y divide-surface-100 dark:divide-surface-300/50">
                {assignedJobs.map((job) => {
                  const req = job.request || job;
                  return (
                    <div key={job.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-surface-900 truncate">{req.title || 'Service Job'}</p>
                          <Badge variant={req.status || job.status} size="sm" className="shrink-0">
                            {(req.status || job.status || 'ACCEPTED').replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-surface-500 flex items-center gap-2">
                          <span>{req.service?.name || 'General Service'}</span>
                          {req.location?.city && (
                            <span className="flex items-center gap-0.5 text-surface-400">
                              <MapPin className="w-3 h-3" />
                              {req.location.city}
                            </span>
                          )}
                        </p>
                      </div>
                      <Link to="/technician/jobs/assigned">
                        <Button size="sm" variant="outline" className="font-semibold text-xs shrink-0">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No active assignments"
                description="Check available requests in your service areas to accept new work."
              />
            )}
          </Card>

          {/* Available Requests Card */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-surface-900">Available Near You</h2>
              <Link
                to="/technician/requests/available"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {availableRequests.length > 0 ? (
              <div className="divide-y divide-surface-100 dark:divide-surface-300/50">
                {availableRequests.map((item) => {
                  const req = item.request || item;
                  return (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0 pr-2">
                        <p className="text-sm font-bold text-surface-900 truncate">{req.title || 'Incoming Request'}</p>
                        <p className="text-xs text-surface-500 truncate">
                          {req.service?.name} • {req.location?.city || 'Local area'}
                        </p>
                      </div>
                      <Link to="/technician/requests/available">
                        <Button size="sm" variant="secondary" className="font-semibold text-xs shrink-0">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No pending matching requests"
                description="New customer service requests will appear here in real-time."
              />
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
