const notificationRepository = require('../repositories/notification.repository');
const { successResponse, paginatedResponse } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

const notificationController = {
  async getMyNotifications(req, res, next) {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
      const { data, total } = await notificationRepository.findByUser(req.user.id, { skip, take: limit, isRead });
      paginatedResponse(res, { data, page, limit, totalItems: total });
    } catch (error) { next(error); }
  },

  async markAsRead(req, res, next) {
    try {
      await notificationRepository.markAsRead(req.params.id, req.user.id);
      successResponse(res, null, 'Marked as read');
    } catch (error) { next(error); }
  },

  async markAllAsRead(req, res, next) {
    try {
      await notificationRepository.markAllAsRead(req.user.id);
      successResponse(res, null, 'All notifications marked as read');
    } catch (error) { next(error); }
  },

  async getUnreadCount(req, res, next) {
    try {
      const count = await notificationRepository.getUnreadCount(req.user.id);
      successResponse(res, { unreadCount: count });
    } catch (error) { next(error); }
  },
};

module.exports = notificationController;
