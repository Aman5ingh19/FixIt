const prisma = require('../config/database');

const notificationRepository = {
  async create(data) {
    return prisma.notification.create({ data });
  },

  async createMany(notifications) {
    return prisma.notification.createMany({ data: notifications });
  },

  async findByUser(userId, { skip, take, isRead }) {
    const where = { userId };
    if (isRead !== undefined) where.isRead = isRead;

    const [data, total] = await prisma.$transaction([
      prisma.notification.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);
    return { data, total };
  },

  async markAsRead(id, userId) {
    return prisma.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async getUnreadCount(userId) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  },
};

module.exports = notificationRepository;
