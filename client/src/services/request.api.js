import api from './api';

const requestApi = {
  async create(data) {
    const response = await api.post('/requests', data);
    return response.data;
  },

  async getMyRequests(params = {}) {
    const response = await api.get('/requests/my', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  async cancel(id, cancelReason) {
    const response = await api.post(`/requests/${id}/cancel`, { cancelReason });
    return response.data;
  },

  async confirmCompletion(id) {
    const response = await api.post(`/requests/${id}/confirm`);
    return response.data;
  },

  // Admin
  async getAll(params = {}) {
    const response = await api.get('/requests', { params });
    return response.data;
  },

  async getStats() {
    const response = await api.get('/requests/stats');
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/requests/${id}/status`, { status });
    return response.data;
  },
};

export default requestApi;
