const activityLogRepository = require('../repositories/activityLog.repository');
const { successResponse, paginatedResponse } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

const activityLogController = {
  async getAll(req, res, next) {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const where = {};
      if (req.query.userId) where.userId = req.query.userId;
      if (req.query.resource) where.resource = req.query.resource;
      if (req.query.action) where.action = { contains: req.query.action, mode: 'insensitive' };
      const { data, total } = await activityLogRepository.findAll({ skip, take: limit, where });
      paginatedResponse(res, { data, page, limit, totalItems: total });
    } catch (error) { next(error); }
  },
};

module.exports = activityLogController;
