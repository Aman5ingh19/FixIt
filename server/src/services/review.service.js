const reviewRepository = require('../repositories/review.repository');
const requestRepository = require('../repositories/request.repository');
const technicianRepository = require('../repositories/technician.repository');
const notificationRepository = require('../repositories/notification.repository');
const { parsePagination, parseSort } = require('../utils/pagination');
const { NotFoundError, AppError, AuthorizationError, ConflictError } = require('../utils/errors');
const logger = require('../config/logger');

const reviewService = {
  async createReview(authorId, data) {
    const request = await requestRepository.findById(data.requestId);
    if (!request) throw new NotFoundError('Service request');

    // Only the customer who created the request can review
    if (request.customerId !== authorId) {
      throw new AuthorizationError('You can only review your own service requests');
    }

    // Only completed requests can be reviewed
    if (request.status !== 'COMPLETED') {
      throw new AppError('Can only review completed service requests', 400, 'INVALID_STATUS');
    }

    // Check if already reviewed
    const existingReview = await reviewRepository.findByRequest(data.requestId);
    if (existingReview) throw new ConflictError('This request has already been reviewed');

    // Find the accepted technician for this request
    const acceptedAssignment = request.assignments?.find((a) => a.status === 'ACCEPTED');
    if (!acceptedAssignment) {
      throw new AppError('No assigned technician found for this request', 400, 'NO_TECHNICIAN');
    }

    const technicianUserId = acceptedAssignment.technician.user.id;

    const review = await reviewRepository.create({
      requestId: data.requestId,
      authorId,
      subjectId: technicianUserId,
      rating: data.rating,
      comment: data.comment,
    });

    // Update technician's average rating
    const { averageRating, totalReviews } = await reviewRepository.getAverageRating(technicianUserId);
    const techProfile = await technicianRepository.findProfile(technicianUserId);
    if (techProfile) {
      await technicianRepository.updateRating(techProfile.id, averageRating, totalReviews);
    }

    // Notify technician
    await notificationRepository.create({
      userId: technicianUserId,
      type: 'REVIEW_RECEIVED',
      title: 'New review received',
      body: `You received a ${data.rating}-star review for "${request.title}".`,
      data: { requestId: data.requestId, rating: data.rating },
    });

    logger.info('Review created', { reviewId: review.id, requestId: data.requestId, rating: data.rating });
    return review;
  },

  async getTechnicianReviews(subjectId, query) {
    const { page, limit, skip } = parsePagination(query);
    const orderBy = parseSort(query, ['createdAt', 'rating']);
    const { data, total } = await reviewRepository.findBySubject(subjectId, { skip, take: limit, orderBy });
    return { data, page, limit, totalItems: total };
  },

  async getAllReviews(query) {
    const { page, limit, skip } = parsePagination(query);
    const orderBy = parseSort(query, ['createdAt', 'rating']);
    const { data, total } = await reviewRepository.findAll({ skip, take: limit, where: {}, orderBy });
    return { data, page, limit, totalItems: total };
  },
};

module.exports = reviewService;
