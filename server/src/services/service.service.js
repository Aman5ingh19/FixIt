const serviceRepository = require('../repositories/service.repository');
const { parsePagination, parseSort } = require('../utils/pagination');
const { NotFoundError } = require('../utils/errors');
const logger = require('../config/logger');

const serviceService = {
  // ── Categories ──

  async getAllCategories() {
    return serviceRepository.findAllCategories();
  },

  async getCategoryById(id) {
    const category = await serviceRepository.findCategoryById(id);
    if (!category) throw new NotFoundError('Service category');
    return category;
  },

  async createCategory(data) {
    const category = await serviceRepository.createCategory(data);
    logger.info('Service category created', { categoryId: category.id, name: category.name });
    return category;
  },

  async updateCategory(id, data) {
    await this.getCategoryById(id);
    return serviceRepository.updateCategory(id, data);
  },

  async deleteCategory(id) {
    await this.getCategoryById(id);
    return serviceRepository.deleteCategory(id);
  },

  // ── Services ──

  async getAllServices(query) {
    const { page, limit, skip } = parsePagination(query);
    const orderBy = parseSort(query, ['name', 'basePrice', 'createdAt']);

    const where = {};
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const { data, total } = await serviceRepository.findAll({ skip, take: limit, where, orderBy });
    return { data, page, limit, totalItems: total };
  },

  async getServiceById(id) {
    const service = await serviceRepository.findById(id);
    if (!service) throw new NotFoundError('Service');
    return service;
  },

  async createService(data) {
    const service = await serviceRepository.create(data);
    logger.info('Service created', { serviceId: service.id, name: service.name });
    return service;
  },

  async updateService(id, data) {
    await this.getServiceById(id);
    return serviceRepository.update(id, data);
  },

  async deleteService(id) {
    await this.getServiceById(id);
    return serviceRepository.delete(id);
  },

  async searchServices(query) {
    if (!query || query.length < 2) return [];
    return serviceRepository.search(query);
  },
};

module.exports = serviceService;
