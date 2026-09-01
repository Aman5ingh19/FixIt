import api from './api';

const paymentApi = {
  async createPayment(data) {
    const response = await api.post('/payments', data);
    return response.data;
  },

  async getPaymentByRequestId(requestId) {
    const response = await api.get(`/payments/request/${requestId}`);
    return response.data;
  },

  async getPaymentById(id) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  async updatePaymentStatus(id, data) {
    const response = await api.patch(`/payments/${id}/status`, data);
    return response.data;
  },

  async getAllPayments(params = {}) {
    const response = await api.get('/payments', { params });
    return response.data;
  },
};

export default paymentApi;
