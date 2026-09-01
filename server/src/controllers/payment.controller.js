const paymentService = require('../services/payment.service');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

const paymentController = {
  async create(req, res, next) {
    try {
      const payment = await paymentService.createPayment(req.user.id, req.user.role, req.body);
      createdResponse(res, { payment }, 'Payment record created');
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { status, method, transactionId, reason } = req.body;
      const payment = await paymentService.updatePaymentStatus(req.params.id, status, {
        method,
        transactionId,
        reason,
      });
      successResponse(res, { payment }, `Payment status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  },

  async getByRequestId(req, res, next) {
    try {
      const payment = await paymentService.getByRequestId(req.params.requestId, req.user.id, req.user.role);
      successResponse(res, { payment });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const payment = await paymentService.getById(req.params.id, req.user.id, req.user.role);
      successResponse(res, { payment });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { data, page, limit, totalItems } = await paymentService.getAll(req.query);
      paginatedResponse(res, { data, page, limit, totalItems });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = paymentController;
