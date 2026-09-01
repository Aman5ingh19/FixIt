const serviceService = require('../services/service.service');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

const serviceController = {
  // ── Categories ──
  async getCategories(req, res, next) {
    try {
      const categories = await serviceService.getAllCategories();
      successResponse(res, { categories });
    } catch (error) { next(error); }
  },

  async getCategoryById(req, res, next) {
    try {
      const category = await serviceService.getCategoryById(req.params.id);
      successResponse(res, { category });
    } catch (error) { next(error); }
  },

  async createCategory(req, res, next) {
    try {
      const category = await serviceService.createCategory(req.body);
      createdResponse(res, { category });
    } catch (error) { next(error); }
  },

  async updateCategory(req, res, next) {
    try {
      const category = await serviceService.updateCategory(req.params.id, req.body);
      successResponse(res, { category }, 'Category updated');
    } catch (error) { next(error); }
  },

  async deleteCategory(req, res, next) {
    try {
      await serviceService.deleteCategory(req.params.id);
      successResponse(res, null, 'Category deleted');
    } catch (error) { next(error); }
  },

  // ── Services ──
  async getServices(req, res, next) {
    try {
      const { data, page, limit, totalItems } = await serviceService.getAllServices(req.query);
      paginatedResponse(res, { data, page, limit, totalItems });
    } catch (error) { next(error); }
  },

  async getServiceById(req, res, next) {
    try {
      const service = await serviceService.getServiceById(req.params.id);
      successResponse(res, { service });
    } catch (error) { next(error); }
  },

  async createService(req, res, next) {
    try {
      const service = await serviceService.createService(req.body);
      createdResponse(res, { service });
    } catch (error) { next(error); }
  },

  async updateService(req, res, next) {
    try {
      const service = await serviceService.updateService(req.params.id, req.body);
      successResponse(res, { service }, 'Service updated');
    } catch (error) { next(error); }
  },

  async deleteService(req, res, next) {
    try {
      await serviceService.deleteService(req.params.id);
      successResponse(res, null, 'Service deleted');
    } catch (error) { next(error); }
  },

  async searchServices(req, res, next) {
    try {
      const services = await serviceService.searchServices(req.query.q);
      successResponse(res, { services });
    } catch (error) { next(error); }
  },
};

module.exports = serviceController;
