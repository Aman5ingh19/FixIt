const reviewService = require('../services/review.service');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

const reviewController = {
  async create(req, res, next) {
    try {
      const review = await reviewService.createReview(req.user.id, req.body);
      createdResponse(res, { review }, 'Review submitted');
    } catch (error) { next(error); }
  },

  async getTechnicianReviews(req, res, next) {
    try {
      const { data, page, limit, totalItems } = await reviewService.getTechnicianReviews(req.params.id, req.query);
      paginatedResponse(res, { data, page, limit, totalItems });
    } catch (error) { next(error); }
  },

  async getAll(req, res, next) {
    try {
      const { data, page, limit, totalItems } = await reviewService.getAllReviews(req.query);
      paginatedResponse(res, { data, page, limit, totalItems });
    } catch (error) { next(error); }
  },
};

module.exports = reviewController;
