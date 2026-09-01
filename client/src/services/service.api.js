import api from './api';

const serviceApi = {
  async getCategories() {
    const response = await api.get('/services/categories');
    return response.data;
  },

  async getServices(params = {}) {
    const response = await api.get('/services', { params });
    return response.data;
  },

  async getServiceById(id) {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  async searchServices(query) {
    const response = await api.get('/services/search', { params: { q: query } });
    return response.data;
  },

  // Admin
  async createCategory(data) {
    const response = await api.post('/services/categories', data);
    return response.data;
  },

  async createService(data) {
    const response = await api.post('/services', data);
    return response.data;
  },

  async updateService(id, data) {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },

  async deleteService(id) {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};

export default serviceApi;
