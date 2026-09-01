const technicianService = require('../services/technician.service');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

const technicianController = {
  async getProfile(req, res, next) {
    try {
      const profile = await technicianService.getProfile(req.user.id);
      successResponse(res, { profile });
    } catch (error) { next(error); }
  },

  async createProfile(req, res, next) {
    try {
      const profile = await technicianService.createProfile(req.user.id, req.body);
      createdResponse(res, { profile });
    } catch (error) { next(error); }
  },

  async updateProfile(req, res, next) {
    try {
      const profile = await technicianService.updateProfile(req.user.id, req.body);
      successResponse(res, { profile }, 'Profile updated');
    } catch (error) { next(error); }
  },

  async setAvailability(req, res, next) {
    try {
      const profile = await technicianService.setAvailability(req.user.id, req.body.availability);
      successResponse(res, { profile }, `Status set to ${req.body.availability}`);
    } catch (error) { next(error); }
  },

  async getAvailableRequests(req, res, next) {
    try {
      const { data, page, limit, totalItems } = await technicianService.getAvailableRequests(req.user.id, req.query);
      paginatedResponse(res, { data, page, limit, totalItems });
    } catch (error) { next(error); }
  },

  async getAssignedJobs(req, res, next) {
    try {
      const { data, page, limit, totalItems } = await technicianService.getAssignedJobs(req.user.id, req.query);
      paginatedResponse(res, { data, page, limit, totalItems });
    } catch (error) { next(error); }
  },

  async getJobHistory(req, res, next) {
    try {
      const { data, page, limit, totalItems } = await technicianService.getJobHistory(req.user.id, req.query);
      paginatedResponse(res, { data, page, limit, totalItems });
    } catch (error) { next(error); }
  },

  async acceptRequest(req, res, next) {
    try {
      const request = await technicianService.acceptRequest(req.user.id, req.params.id);
      successResponse(res, { request }, 'Request accepted');
    } catch (error) { next(error); }
  },

  async rejectRequest(req, res, next) {
    try {
      await technicianService.rejectRequest(req.user.id, req.params.id);
      successResponse(res, null, 'Request rejected');
    } catch (error) { next(error); }
  },

  async updateJobStatus(req, res, next) {
    try {
      const request = await technicianService.updateJobStatus(req.user.id, req.params.id, req.body.status);
      successResponse(res, { request }, 'Job status updated');
    } catch (error) { next(error); }
  },

  // Admin: list all technicians
  async getAll(req, res, next) {
    try {
      const { data, page, limit, totalItems } = await technicianService.getAllTechnicians(req.query);
      paginatedResponse(res, { data, page, limit, totalItems });
    } catch (error) { next(error); }
  },

  // Admin: verify technician
  async verify(req, res, next) {
    try {
      const profile = await technicianService.verifyTechnician(req.params.id, req.body.verificationStatus);
      successResponse(res, { profile }, 'Technician verification updated');
    } catch (error) { next(error); }
  },
};

module.exports = technicianController;
