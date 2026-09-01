const paymentRepository = require('../repositories/payment.repository');
const requestRepository = require('../repositories/request.repository');
const notificationRepository = require('../repositories/notification.repository');
const { parsePagination, parseSort } = require('../utils/pagination');
const { NotFoundError, AppError, ConflictError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Pluggable Payment Gateway Adapter Interface.
 * Designed so that real gateways (Stripe, Razorpay, PayPal, etc.)
 * can be plugged in later by implementing this interface.
 */
class StatusTrackingPaymentGateway {
  async initiatePayment({ amount, requestId, currency = 'INR' }) {
    // Generates a mock tracking transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      transactionId,
      gatewayResponse: {
        mode: 'STATUS_TRACKING',
        currency,
        amount,
        createdAt: new Date().toISOString(),
      },
    };
  }

  async verifyPayment({ transactionId, status }) {
    return {
      verified: true,
      status: status || 'PAID',
      transactionId,
    };
  }

  async processRefund({ transactionId, amount, reason }) {
    return {
      success: true,
      refundId: `REF_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      status: 'REFUNDED',
      reason,
    };
  }
}

// Active gateway instance (can be swapped for Stripe/Razorpay later)
const activeGateway = new StatusTrackingPaymentGateway();

const paymentService = {
  /**
   * Create or initialize a payment record for a request.
   */
  async createPayment(userId, role, data) {
    const request = await requestRepository.findById(data.requestId);
    if (!request) throw new NotFoundError('Service request');

    if (role === 'CUSTOMER' && request.customerId !== userId) {
      throw new AppError('You can only create payments for your own requests', 403, 'FORBIDDEN');
    }

    const existing = await paymentRepository.findByRequestId(data.requestId);
    if (existing) {
      throw new ConflictError('A payment record already exists for this service request');
    }

    const gatewayResult = await activeGateway.initiatePayment({
      amount: data.amount,
      requestId: data.requestId,
    });

    const payment = await paymentRepository.create({
      requestId: data.requestId,
      amount: data.amount,
      status: 'PENDING',
      method: data.method || 'STATUS_TRACKING',
      transactionId: gatewayResult.transactionId,
    });

    logger.info('Payment record created', { paymentId: payment.id, requestId: data.requestId, amount: data.amount });
    return payment;
  },

  /**
   * Update payment status (PENDING -> PAID -> FAILED -> REFUNDED)
   */
  async updatePaymentStatus(id, newStatus, { method, transactionId, reason } = {}) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new NotFoundError('Payment');

    const validTransitions = {
      PENDING: ['PAID', 'FAILED'],
      PAID: ['REFUNDED'],
      FAILED: ['PENDING', 'PAID'],
      REFUNDED: [],
    };

    const allowed = validTransitions[payment.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new AppError(`Cannot transition payment from ${payment.status} to ${newStatus}`, 400, 'INVALID_PAYMENT_TRANSITION');
    }

    let updatedTxnId = transactionId || payment.transactionId;
    if (newStatus === 'REFUNDED') {
      const refundResult = await activeGateway.processRefund({
        transactionId: payment.transactionId,
        amount: payment.amount,
        reason,
      });
      updatedTxnId = refundResult.refundId;
    }

    const updated = await paymentRepository.updateStatus(id, newStatus, {
      method: method || payment.method,
      transactionId: updatedTxnId,
    });

    logger.info('Payment status updated', { paymentId: id, from: payment.status, to: newStatus });

    // Notify customer
    if (payment.request?.customerId) {
      await notificationRepository.create({
        userId: payment.request.customerId,
        type: 'SYSTEM',
        title: `Payment ${newStatus}`,
        body: `Payment of ₹${payment.amount} for "${payment.request.title}" is now ${newStatus.toLowerCase()}.`,
        data: { paymentId: id, requestId: payment.requestId, status: newStatus },
      });
    }

    return updated;
  },

  /**
   * Get payment by Request ID
   */
  async getByRequestId(requestId, userId, role) {
    const payment = await paymentRepository.findByRequestId(requestId);
    if (!payment) throw new NotFoundError('Payment');

    if (role === 'CUSTOMER' && payment.request?.customerId !== userId) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    return payment;
  },

  /**
   * Get payment by ID
   */
  async getById(id, userId, role) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new NotFoundError('Payment');

    if (role === 'CUSTOMER' && payment.request?.customerId !== userId) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    return payment;
  },

  /**
   * Get all payments (Admin)
   */
  async getAll(query) {
    const { page, limit, skip } = parsePagination(query);
    const orderBy = parseSort(query, ['amount', 'createdAt', 'status']);

    const where = {};
    if (query.status) where.status = query.status;
    if (query.requestId) where.requestId = query.requestId;

    const { data, total } = await paymentRepository.findAll({ skip, take: limit, where, orderBy });
    return { data, page, limit, totalItems: total };
  },
};

module.exports = paymentService;
