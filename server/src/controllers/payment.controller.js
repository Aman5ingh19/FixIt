const paymentService = require('../services/payment.service');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

const paymentController = {
  /**
   * Get public Razorpay config (keyId, currency, mode)
   */
  async getConfig(req, res, next) {
    try {
      const config = paymentService.getConfig();
      successResponse(res, config, 'Payment configuration');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create Razorpay Order
   */
  async createOrder(req, res, next) {
    try {
      const { requestId } = req.body;
      const orderData = await paymentService.createRazorpayOrder({
        requestId,
        userId: req.user.id,
        role: req.user.role,
      });
      createdResponse(res, orderData, 'Razorpay order created');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify Razorpay Payment Signature
   */
  async verifySignature(req, res, next) {
    try {
      const { requestId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const payment = await paymentService.verifyRazorpayPayment({
        requestId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        userId: req.user.id,
        role: req.user.role,
      });
      successResponse(res, { payment }, 'Payment verified successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Razorpay Webhook Handler
   */
  async handleWebhook(req, res, next) {
    try {
      const rawBody = req.body;
      const signature = req.headers['x-razorpay-signature'];
      const result = await paymentService.handleWebhook(rawBody, signature);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Customer: Get my payment history
   */
  async getMyHistory(req, res, next) {
    try {
      const { data, pagination } = await paymentService.getCustomerPayments(req.user.id, req.query);
      paginatedResponse(res, { data, ...pagination });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Admin: Get payment statistics & overview
   */
  async getStats(req, res, next) {
    try {
      const stats = await paymentService.getAdminStats();
      successResponse(res, stats, 'Payment statistics');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Legacy create payment record
   */
  async create(req, res, next) {
    try {
      const payment = await paymentService.createPayment(req.user.id, req.user.role, req.body);
      createdResponse(res, { payment }, 'Payment record created');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update payment status (Admin or refund)
   */
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

  /**
   * Get payment by Request ID
   */
  async getByRequestId(req, res, next) {
    try {
      const payment = await paymentService.getByRequestId(req.params.requestId, req.user.id, req.user.role);
      successResponse(res, { payment });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get payment by ID
   */
  async getById(req, res, next) {
    try {
      const payment = await paymentService.getById(req.params.id, req.user.id, req.user.role);
      successResponse(res, { payment });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Admin: list all payments
   */
  async getAll(req, res, next) {
    try {
      const { data, pagination } = await paymentService.getAll(req.query);
      paginatedResponse(res, { data, ...pagination });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = paymentController;
