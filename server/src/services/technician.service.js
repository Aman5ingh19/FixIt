const technicianRepository = require('../repositories/technician.repository');
const requestRepository = require('../repositories/request.repository');
const notificationRepository = require('../repositories/notification.repository');
const { parsePagination, parseSort } = require('../utils/pagination');
const { NotFoundError, AppError, AuthorizationError, ConflictError } = require('../utils/errors');
const logger = require('../config/logger');

const technicianService = {
  async getProfile(userId) {
    const profile = await technicianRepository.findProfile(userId);
    if (!profile) throw new NotFoundError('Technician profile');
    return profile;
  },

  async createProfile(userId, data) {
    // Check if profile already exists
    const existing = await technicianRepository.findProfile(userId);
    if (existing) throw new ConflictError('Technician profile already exists');

    const profile = await technicianRepository.createProfile(userId, data);
    logger.info('Technician profile created', { userId, profileId: profile.id });
    return profile;
  },

  async updateProfile(userId, data) {
    const profile = await technicianRepository.findProfile(userId);
    if (!profile) throw new NotFoundError('Technician profile');
    return technicianRepository.updateProfile(userId, data);
  },

  async setAvailability(userId, availability) {
    const profile = await technicianRepository.findProfile(userId);
    if (!profile) throw new NotFoundError('Technician profile');

    if (profile.verificationStatus !== 'APPROVED' && availability === 'ONLINE') {
      throw new AppError('Cannot go online before verification is approved', 400, 'NOT_VERIFIED');
    }

    return technicianRepository.setAvailability(userId, availability);
  },

  async getAvailableRequests(userId, query) {
    const profile = await technicianRepository.findProfile(userId);
    if (!profile) throw new NotFoundError('Technician profile');

    const { page, limit, skip } = parsePagination(query);

    // Get assignments pending for this technician
    const { data, total } = await technicianRepository.getAssignments(profile.id, {
      skip,
      take: limit,
      where: { status: 'PENDING' },
    });

    return { data, page, limit, totalItems: total };
  },

  async getAssignedJobs(userId, query) {
    const profile = await technicianRepository.findProfile(userId);
    if (!profile) throw new NotFoundError('Technician profile');

    const { page, limit, skip } = parsePagination(query);

    const { data, total } = await technicianRepository.getAssignments(profile.id, {
      skip,
      take: limit,
      where: { status: 'ACCEPTED' },
    });

    return { data, page, limit, totalItems: total };
  },

  async getJobHistory(userId, query) {
    const profile = await technicianRepository.findProfile(userId);
    if (!profile) throw new NotFoundError('Technician profile');

    const { page, limit, skip } = parsePagination(query);

    const { data, total } = await technicianRepository.getAssignments(profile.id, {
      skip,
      take: limit,
      where: {
        OR: [
          { status: 'ACCEPTED', request: { status: { in: ['COMPLETED', 'CANCELLED'] } } },
          { status: 'REJECTED' },
        ],
      },
    });

    return { data, page, limit, totalItems: total };
  },

  async acceptRequest(userId, requestId) {
    const profile = await technicianRepository.findProfile(userId);
    if (!profile) throw new NotFoundError('Technician profile');

    const request = await requestRepository.findById(requestId);
    if (!request) throw new NotFoundError('Service request');

    // Update assignment status
    await technicianRepository.updateAssignment(requestId, profile.id, 'ACCEPTED');

    // Update request status to ACCEPTED
    await requestRepository.updateStatus(requestId, 'ACCEPTED');

    // Set technician as BUSY
    await technicianRepository.setAvailability(userId, 'BUSY');

    // Notify customer
    await notificationRepository.create({
      userId: request.customerId,
      type: 'REQUEST_ACCEPTED',
      title: 'Technician accepted your request',
      body: `${profile.user.firstName} ${profile.user.lastName} has accepted your request "${request.title}".`,
      data: { requestId, technicianUserId: userId },
    });

    logger.info('Request accepted by technician', { requestId, technicianUserId: userId });

    return request;
  },

  async rejectRequest(userId, requestId) {
    const profile = await technicianRepository.findProfile(userId);
    if (!profile) throw new NotFoundError('Technician profile');

    await technicianRepository.updateAssignment(requestId, profile.id, 'REJECTED');

    logger.info('Request rejected by technician', { requestId, technicianUserId: userId });
  },

  async updateJobStatus(userId, requestId, status) {
    const profile = await technicianRepository.findProfile(userId);
    if (!profile) throw new NotFoundError('Technician profile');

    const request = await requestRepository.findById(requestId);
    if (!request) throw new NotFoundError('Service request');

    // Verify this technician is assigned to this request
    const assignment = request.assignments?.find(
      (a) => a.technicianId === profile.id && a.status === 'ACCEPTED'
    );
    if (!assignment) {
      throw new AuthorizationError('You are not assigned to this request');
    }

    const extras = {};
    if (status === 'COMPLETED') {
      extras.completedAt = new Date();
      // Increment jobs completed
      await technicianRepository.incrementJobsCompleted(userId);
      // Set technician back to ONLINE
      await technicianRepository.setAvailability(userId, 'ONLINE');
    }

    const updated = await requestRepository.updateStatus(requestId, status, extras);

    // Notify customer
    const statusMessages = {
      IN_PROGRESS: 'Service has started',
      COMPLETED: 'Service completed',
    };
    if (statusMessages[status]) {
      await notificationRepository.create({
        userId: request.customerId,
        type: `REQUEST_${status}`,
        title: statusMessages[status],
        body: `Your request "${request.title}" is now ${status.toLowerCase().replace('_', ' ')}.`,
        data: { requestId },
      });
    }

    return updated;
  },

  async getAllTechnicians(query) {
    const { page, limit, skip } = parsePagination(query);
    const orderBy = parseSort(query, ['averageRating', 'totalJobsCompleted', 'createdAt']);

    const where = {};
    if (query.availability) where.availability = query.availability;
    if (query.verificationStatus) where.verificationStatus = query.verificationStatus;
    if (query.serviceId) {
      where.technicianServices = { some: { serviceId: query.serviceId } };
    }
    if (query.city) {
      where.serviceAreas = { some: { city: { equals: query.city, mode: 'insensitive' } } };
    }

    const { data, total } = await technicianRepository.findAll({ skip, take: limit, where, orderBy });
    return { data, page, limit, totalItems: total };
  },

  async verifyTechnician(technicianProfileId, status) {
    const profile = await technicianRepository.findProfileById(technicianProfileId);
    if (!profile) throw new NotFoundError('Technician profile');

    const updated = await technicianRepository.updateProfile(profile.userId, {
      verificationStatus: status,
    });

    // Notify technician
    await notificationRepository.create({
      userId: profile.userId,
      type: 'TECHNICIAN_VERIFIED',
      title: `Verification ${status.toLowerCase()}`,
      body: status === 'APPROVED'
        ? 'Congratulations! Your profile has been verified. You can now go online and receive requests.'
        : 'Your profile verification was not approved. Please update your documents and reapply.',
      data: { verificationStatus: status },
    });

    logger.info('Technician verification updated', { profileId: technicianProfileId, status });
    return updated;
  },
};

module.exports = technicianService;
