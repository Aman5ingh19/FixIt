const prisma = require('../config/database');

const activityLogRepository = {
  async create({ userId, action, resource, resourceId, metadata, ipAddress, userAgent }) {
    return prisma.activityLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        metadata: metadata || {},
        ipAddress,
        userAgent,
      },
    });
  },

  async findByUser(userId, { skip = 0, take = 20 }) {
    const [data, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.activityLog.count({ where: { userId } }),
    ]);
    return { data, total };
  },

  async findAll({ skip = 0, take = 20, where = {} }) {
    const [data, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);
    return { data, total };
  },
};

module.exports = activityLogRepository;
