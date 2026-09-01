const prisma = require('../config/database');

const reviewRepository = {
  async create(data) {
    return prisma.review.create({
      data,
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        subject: { select: { id: true, firstName: true, lastName: true } },
        request: { select: { id: true, title: true, service: { select: { name: true } } } },
      },
    });
  },

  async findByRequest(requestId) {
    return prisma.review.findUnique({
      where: { requestId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  },

  async findBySubject(subjectId, { skip, take, orderBy }) {
    const [data, total] = await prisma.$transaction([
      prisma.review.findMany({
        skip,
        take,
        where: { subjectId },
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          request: { select: { id: true, title: true, service: { select: { name: true } } } },
        },
      }),
      prisma.review.count({ where: { subjectId } }),
    ]);
    return { data, total };
  },

  async findAll({ skip, take, where, orderBy }) {
    const [data, total] = await prisma.$transaction([
      prisma.review.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
          subject: { select: { id: true, firstName: true, lastName: true } },
          request: { select: { id: true, title: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);
    return { data, total };
  },

  async getAverageRating(subjectId) {
    const result = await prisma.review.aggregate({
      where: { subjectId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return {
      averageRating: result._avg.rating || 0,
      totalReviews: result._count.rating,
    };
  },
};

module.exports = reviewRepository;
