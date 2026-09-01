import api from './api';

const technicianApi = {
  async getProfile() {
    const response = await api.get('/technicians/profile');
    return response.data;
  },

  async createProfile(data) {
    const response = await api.post('/technicians/profile', data);
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/technicians/profile', data);
    return response.data;
  },

  async setAvailability(availability) {
    const response = await api.patch('/technicians/availability', { availability });
    return response.data;
  },

  async getAvailableRequests(params = {}) {
    const response = await api.get('/technicians/requests/available', { params });
    return response.data;
  },

  async getAssignedJobs(params = {}) {
    const response = await api.get('/technicians/jobs/assigned', { params });
    return response.data;
  },

  async getJobHistory(params = {}) {
    const response = await api.get('/technicians/jobs/history', { params });
    return response.data;
  },

  async acceptRequest(id) {
    const response = await api.post(`/technicians/requests/${id}/accept`);
    return response.data;
  },

  async rejectRequest(id) {
    const response = await api.post(`/technicians/requests/${id}/reject`);
    return response.data;
  },

  async updateJobStatus(id, status) {
    const response = await api.patch(`/technicians/jobs/${id}/status`, { status });
    return response.data;
  },

  // Admin
  async getAll(params = {}) {
    const response = await api.get('/technicians', { params });
    return response.data;
  },

  async verify(id, verificationStatus) {
    const response = await api.patch(`/technicians/${id}/verify`, { verificationStatus });
    return response.data;
  },
};

export default technicianApi;
