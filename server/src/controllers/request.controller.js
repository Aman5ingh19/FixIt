const requestService = require('../services/request.service');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

const requestController = {
  async create(req, res, next) {
    try {
      const request = await requestService.createRequest(req.user.id, req.body);
      createdResponse(res, { request }, 'Service request created');
    } catch (error) { next(error); }
  },

  async getById(req, res, next) {
    try {
      const request = await requestService.getRequestById(req.params.id, req.user.id, req.user.role);
      successResponse(res, { request });
    } catch (error) { next(error); }
  },

  async getMyRequests(req, res, next) {
    try {
      const { data, page, limit, totalItems } = await requestService.getMyRequests(req.user.id, req.query);
      paginatedResponse(res, { data, page, limit, totalItems });
    } catch (error) { next(error); }
  },

  async getAll(req, res, next) {
    try {
      const { data, page, limit, totalItems } = await requestService.getAllRequests(req.query);
      paginatedResponse(res, { data, page, limit, totalItems });
    } catch (error) { next(error); }
  },

  async updateStatus(req, res, next) {
    try {
      const request = await requestService.updateStatus(req.params.id, req.body.status, req.user.id, req.user.role);
      successResponse(res, { request }, 'Status updated');
    } catch (error) { next(error); }
  },

  async cancel(req, res, next) {
    try {
      const request = await requestService.cancelRequest(req.params.id, req.user.id, req.body.cancelReason);
      successResponse(res, { request }, 'Request cancelled');
    } catch (error) { next(error); }
  },

  async confirmCompletion(req, res, next) {
    try {
      const request = await requestService.confirmCompletion(req.params.id, req.user.id);
      successResponse(res, { request }, 'Completion confirmed');
    } catch (error) { next(error); }
  },

  async getStats(req, res, next) {
    try {
      const stats = await requestService.getStats();
      successResponse(res, { stats });
    } catch (error) { next(error); }
  },
};

module.exports = requestController;
