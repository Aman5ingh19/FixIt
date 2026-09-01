import api from './api';

const paymentApi = {
  /**
   * Fetch public Razorpay payment gateway config
   */
  async getConfig() {
    const response = await api.get('/payments/config');
    return response.data;
  },

  /**
   * Create Razorpay Order on Backend
   */
  async createOrder(requestId) {
    const response = await api.post('/payments/create-order', { requestId });
    return response.data;
  },

  /**
   * Verify Razorpay Payment Signature on Backend
   */
  async verifySignature({ requestId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const response = await api.post('/payments/verify-signature', {
      requestId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    return response.data;
  },

  /**
   * Customer: Get my payment history
   */
  async getMyPaymentHistory(params = {}) {
    const response = await api.get('/payments/my-history', { params });
    return response.data;
  },

  /**
   * Admin: Get payment summary stats
   */
  async getAdminStats() {
    const response = await api.get('/payments/stats');
    return response.data;
  },

  /**
   * Admin: Get all transactions
   */
  async getAllPayments(params = {}) {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  /**
   * Get payment by Request ID
   */
  async getPaymentByRequestId(requestId) {
    const response = await api.get(`/payments/request/${requestId}`);
    return response.data;
  },

  /**
   * Get payment by ID
   */
  async getPaymentById(id) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
};

export default paymentApi;
