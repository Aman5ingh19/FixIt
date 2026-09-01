const crypto = require('crypto');
const Razorpay = require('razorpay');
const paymentRepository = require('../repositories/payment.repository');
const requestRepository = require('../repositories/request.repository');
const notificationRepository = require('../repositories/notification.repository');
const activityLogRepository = require('../repositories/activityLog.repository');
const config = require('../config');
const { parsePagination, parseSort } = require('../utils/pagination');
const { NotFoundError, AppError, ConflictError } = require('../utils/errors');
const logger = require('../config/logger');

// Initialize Razorpay SDK instance if valid credentials exist
let razorpayInstance = null;
const isRealRazorpay = Boolean(config.razorpay.keyId && config.razorpay.keySecret && config.razorpay.keyId.startsWith('rzp_'));

if (isRealRazorpay) {
  try {
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
    logger.info('✓ Razorpay SDK initialized in Sandbox/Live Mode', { keyId: config.razorpay.keyId });
  } catch (err) {
    logger.warn('⚠ Razorpay initialization warning:', { error: err.message });
  }
} else {
  logger.info('ℹ Razorpay running in Sandbox Simulation Mode (No external API keys required)');
}

const paymentService = {
  /**
   * Get public Razorpay configuration for frontend
   */
  getConfig() {
    return {
      keyId: config.razorpay.keyId || 'rzp_test_fixit_sandbox',
      currency: 'INR',
      isTestMode: true,
      isSimulated: !isRealRazorpay,
    };
  },

  /**
   * Create Razorpay Order from backend.
   * Calculates final booking price securely from the service's base price.
   */
  async createRazorpayOrder({ requestId, userId, role }) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Service request');
    }

    if (role === 'CUSTOMER' && request.customerId !== userId) {
      throw new AppError('You can only create payment orders for your own requests', 403, 'FORBIDDEN');
    }

    // Check if request is already fully paid
    const existingPayment = await paymentRepository.findByRequestId(requestId);
    if (existingPayment && existingPayment.status === 'PAID') {
      throw new ConflictError('This service request is already paid');
    }

    // Calculate secure amount from backend (INR)
    const amount = request.service?.basePrice || 499;
    const amountInPaise = Math.round(amount * 100);

    let orderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let razorpayOrderDetails = null;

    if (isRealRazorpay && razorpayInstance) {
      try {
        const order = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${requestId.slice(0, 24)}`,
          notes: {
            requestId: request.id,
            customerId: request.customerId,
            serviceTitle: request.title,
          },
        });
        orderId = order.id;
        razorpayOrderDetails = order;
        logger.info('Razorpay Order created via SDK', { orderId, amount, requestId });
      } catch (err) {
        logger.error('Razorpay Order creation failed via SDK, falling back to Sandbox order', { error: err.message });
        orderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
    }

    // Upsert pending payment record in DB
    const payment = await paymentRepository.upsert({
      requestId,
      amount,
      status: 'PENDING',
      method: 'RAZORPAY',
      razorpayOrderId: orderId,
    });

    return {
      orderId,
      amount,
      amountInPaise,
      currency: 'INR',
      keyId: config.razorpay.keyId || 'rzp_test_fixit_sandbox',
      isSimulated: !isRealRazorpay,
      request: {
        id: request.id,
        title: request.title,
        serviceName: request.service?.name,
        customerName: `${request.customer?.firstName} ${request.customer?.lastName}`,
        customerEmail: request.customer?.email,
        customerPhone: request.customer?.phone || '9999999999',
      },
      payment,
    };
  },

  /**
   * Verify Razorpay Payment Signature on Backend.
   * Cryptographically verifies HMAC-SHA256 signature to prevent payment spoofing.
   */
  async verifyRazorpayPayment({ requestId, razorpayOrderId, razorpayPaymentId, razorpaySignature, userId, role }) {
    const payment = await paymentRepository.findByRequestId(requestId);
    if (!payment) {
      throw new NotFoundError('Payment record for this request');
    }

    if (role === 'CUSTOMER' && payment.request?.customerId !== userId) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    if (payment.status === 'PAID') {
      return payment; // Idempotent return
    }

    // Cryptographic Signature Verification
    if (isRealRazorpay && config.razorpay.keySecret) {
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', config.razorpay.keySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        // Mark payment as FAILED
        await paymentRepository.updateStatus(payment.id, 'FAILED', {
          transactionId: razorpayPaymentId,
          razorpayPaymentId,
          razorpaySignature,
        });

        logger.warn('Razorpay signature mismatch', {
          requestId,
          expectedSignature,
          receivedSignature: razorpaySignature,
        });

        throw new AppError('Invalid payment signature. Transaction rejected.', 400, 'INVALID_SIGNATURE');
      }
    }

    // Payment Verified Successfully — Transition to PAID
    const updatedPayment = await paymentRepository.updateStatus(payment.id, 'PAID', {
      method: 'RAZORPAY',
      transactionId: razorpayPaymentId || `pay_test_${Date.now()}`,
      razorpayPaymentId: razorpayPaymentId || `pay_test_${Date.now()}`,
      razorpaySignature: razorpaySignature || `sig_test_${Date.now()}`,
    });

    logger.info('Payment verified and marked PAID', {
      paymentId: payment.id,
      requestId,
      amount: payment.amount,
      razorpayPaymentId,
    });

    // Send Real-time notification to Customer
    if (payment.request?.customerId) {
      await notificationRepository.create({
        userId: payment.request.customerId,
        type: 'SYSTEM',
        title: 'Payment Successful',
        body: `Your payment of ₹${payment.amount} for "${payment.request.title}" was successfully processed via Razorpay.`,
        data: {
          paymentId: payment.id,
          requestId,
          status: 'PAID',
          transactionId: razorpayPaymentId,
        },
      });
    }

    // Audit Log
    await activityLogRepository.create({
      userId,
      action: 'PAYMENT_VERIFIED',
      entity: 'Payment',
      entityId: payment.id,
      details: {
        requestId,
        amount: payment.amount,
        razorpayOrderId,
        razorpayPaymentId,
      },
    });

    return updatedPayment;
  },

  /**
   * Handle Razorpay Webhooks (payment.captured, payment.failed, refund.processed)
   */
  async handleWebhook(rawBody, signatureHeader) {
    if (config.razorpay.webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', config.razorpay.webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signatureHeader) {
        throw new AppError('Invalid webhook signature', 400, 'INVALID_WEBHOOK_SIGNATURE');
      }
    }

    const payload = JSON.parse(rawBody.toString());
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    logger.info('Razorpay Webhook Received', { event, orderId, paymentId });

    if (!orderId) return { received: true };

    const payment = await paymentRepository.findByRazorpayOrderId(orderId);
    if (!payment) {
      logger.warn('No payment found for webhook order ID', { orderId });
      return { received: true };
    }

    if (event === 'payment.captured' || event === 'order.paid') {
      if (payment.status !== 'PAID') {
        await paymentRepository.updateStatus(payment.id, 'PAID', {
          transactionId: paymentId,
          razorpayPaymentId: paymentId,
        });
      }
    } else if (event === 'payment.failed') {
      await paymentRepository.updateStatus(payment.id, 'FAILED', {
        transactionId: paymentId,
        razorpayPaymentId: paymentId,
      });
    } else if (event === 'refund.processed') {
      await paymentRepository.updateStatus(payment.id, 'REFUNDED', {
        transactionId: payload.payload?.refund?.entity?.id || payment.transactionId,
      });
    }

    return { success: true, event };
  },

  /**
   * Customer Payment History
   */
  async getCustomerPayments(customerId, query) {
    const { page, limit, skip } = parsePagination(query);
    const { data, total } = await paymentRepository.getCustomerPayments(customerId, {
      skip,
      take: limit,
      status: query.status,
      search: query.search,
    });

    return {
      data,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Admin: List all payments
   */
  async getAll(query) {
    const { page, limit, skip } = parsePagination(query);
    const orderBy = parseSort(query, ['amount', 'createdAt', 'status']);
    const where = {};
    if (query.status && query.status !== 'ALL') where.status = query.status;
    if (query.requestId) where.requestId = query.requestId;

    const { data, total } = await paymentRepository.findAll({ skip, take: limit, where, orderBy });
    return {
      data,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Admin: Payment KPI & Stats
   */
  async getAdminStats() {
    return paymentRepository.getStats();
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
};

module.exports = paymentService;
