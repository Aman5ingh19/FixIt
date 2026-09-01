import api from './api';

const reviewApi = {
  async create(data) {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  async getTechnicianReviews(technicianUserId, params = {}) {
    const response = await api.get(`/reviews/technician/${technicianUserId}`, { params });
    return response.data;
  },

  async getAll(params = {}) {
    const response = await api.get('/reviews', { params });
    return response.data;
  },
};

export default reviewApi;
