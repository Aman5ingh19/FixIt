const requestRepository = require('../repositories/request.repository');
const technicianRepository = require('../repositories/technician.repository');
const notificationRepository = require('../repositories/notification.repository');
const { parsePagination, parseSort } = require('../utils/pagination');
const { NotFoundError, AppError, AuthorizationError } = require('../utils/errors');
const logger = require('../config/logger');

// Valid status transitions
const STATUS_TRANSITIONS = {
  PENDING: ['MATCHING', 'CANCELLED'],
  MATCHING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['ACCEPTED', 'MATCHING', 'CANCELLED'],
  ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

const requestService = {
  async createRequest(customerId, data) {
    const request = await requestRepository.create({
      customerId,
      serviceId: data.serviceId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      status: 'PENDING',
      location: data.location,
      imageUrls: data.imageUrls,
    });

    logger.info('Service request created', { requestId: request.id, customerId, serviceId: data.serviceId });

    // Auto-match: find suitable technicians and move to MATCHING
    await this._autoMatchTechnicians(request);

    return request;
  },

  async getRequestById(id, userId, role) {
    const request = await requestRepository.findById(id);
    if (!request) throw new NotFoundError('Service request');

    // Authorization: customers can only see their own, technicians only assigned
    if (role === 'CUSTOMER' && request.customerId !== userId) {
      throw new AuthorizationError('You can only view your own requests');
    }

    return request;
  },

  async getMyRequests(customerId, query) {
    const { page, limit, skip } = parsePagination(query);
    const orderBy = parseSort(query, ['createdAt', 'updatedAt', 'priority']);

    const where = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const { data, total } = await requestRepository.findByCustomer(customerId, {
      skip, take: limit, where, orderBy,
    });

    return { data, page, limit, totalItems: total };
  },

  async getAllRequests(query) {
    const { page, limit, skip } = parsePagination(query);
    const orderBy = parseSort(query, ['createdAt', 'updatedAt', 'priority']);

    const where = {};
    if (query.status) where.status = query.status;
    if (query.serviceId) where.serviceId = query.serviceId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { customer: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const { data, total } = await requestRepository.findAll({ skip, take: limit, where, orderBy });
    return { data, page, limit, totalItems: total };
  },

  async updateStatus(requestId, newStatus, userId, role) {
    const request = await requestRepository.findById(requestId);
    if (!request) throw new NotFoundError('Service request');

    // Validate transition
    const allowedTransitions = STATUS_TRANSITIONS[request.status];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new AppError(
        `Cannot transition from ${request.status} to ${newStatus}`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }

    const extras = {};
    if (newStatus === 'COMPLETED') extras.completedAt = new Date();
    if (newStatus === 'CANCELLED') extras.cancelledAt = new Date();

    const updated = await requestRepository.updateStatus(requestId, newStatus, extras);

    logger.info('Request status updated', { requestId, from: request.status, to: newStatus, userId });

    // Notify customer of status change
    await notificationRepository.create({
      userId: request.customerId,
      type: `REQUEST_${newStatus}`,
      title: `Request ${newStatus.toLowerCase().replace('_', ' ')}`,
      body: `Your request "${request.title}" is now ${newStatus.toLowerCase().replace('_', ' ')}.`,
      data: { requestId },
    });

    return updated;
  },

  async cancelRequest(requestId, userId, cancelReason) {
    const request = await requestRepository.findById(requestId);
    if (!request) throw new NotFoundError('Service request');

    if (request.customerId !== userId) {
      throw new AuthorizationError('You can only cancel your own requests');
    }

    const cancellable = ['PENDING', 'MATCHING', 'ASSIGNED'];
    if (!cancellable.includes(request.status)) {
      throw new AppError('This request can no longer be cancelled', 400, 'CANNOT_CANCEL');
    }

    return requestRepository.updateStatus(requestId, 'CANCELLED', {
      cancelledAt: new Date(),
      cancelReason,
    });
  },

  async confirmCompletion(requestId, userId) {
    const request = await requestRepository.findById(requestId);
    if (!request) throw new NotFoundError('Service request');
    if (request.customerId !== userId) {
      throw new AuthorizationError('You can only confirm your own requests');
    }
    if (request.status !== 'COMPLETED') {
      throw new AppError('Can only confirm completed requests', 400, 'INVALID_STATUS');
    }
    // In a real app, this might trigger payment release
    return request;
  },

  async getStats(where = {}) {
    return requestRepository.getStats(where);
  },

  // ── Private ──

  async _autoMatchTechnicians(request) {
    try {
      const city = request.location?.city;
      let technicians = await technicianRepository.findSuitableTechnicians(
        request.serviceId, city
      );

      // Fallback: If no exact skill/city match, dispatch to all verified technicians
      if (!technicians || technicians.length === 0) {
        const allApproved = await technicianRepository.findAll({
          where: { verificationStatus: 'APPROVED' },
          take: 10,
        });
        technicians = allApproved.data || [];
      }

      if (technicians && technicians.length > 0) {
        // Update status to MATCHING
        await requestRepository.updateStatus(request.id, 'MATCHING');

        const serviceTitle = request.service?.name || request.title || 'Service';

        // Create assignments for matching technicians
        for (const tech of technicians.slice(0, 5)) {
          await technicianRepository.createAssignment(request.id, tech.id);

          const targetUserId = tech.userId || tech.user?.id;
          if (targetUserId) {
            await notificationRepository.create({
              userId: targetUserId,
              type: 'REQUEST_ASSIGNED',
              title: 'New Service Request Available',
              body: `A new "${serviceTitle}" request is available in ${city || 'your area'}.`,
              data: { requestId: request.id },
            });
          }
        }

        logger.info('Technicians matched', {
          requestId: request.id,
          matchCount: Math.min(technicians.length, 5),
        });
      }
    } catch (error) {
      logger.error('Auto-match failed', { requestId: request.id, error: error.message });
    }
  },
};

module.exports = requestService;
