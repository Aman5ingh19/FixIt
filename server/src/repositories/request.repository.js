const prisma = require('../config/database');

const requestRepository = {
  async create(data) {
    const { location, imageUrls, ...requestData } = data;

    return prisma.serviceRequest.create({
      data: {
        ...requestData,
        location: location ? { create: location } : undefined,
        images: imageUrls?.length
          ? {
              createMany: {
                data: imageUrls.map((img) => ({
                  imageUrl: typeof img === 'string' ? img : img.imageUrl,
                  publicId: (typeof img === 'object' && img?.publicId) || null,
                  caption: (typeof img === 'object' && img?.caption) || null,
                })),
              },
            }
          : undefined,
      },
      include: {
        service: { include: { category: true } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        location: true,
        images: true,
        assignments: {
          include: {
            technician: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, phone: true } },
              },
            },
          },
        },
      },
    });
  },

  async findById(id) {
    return prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        service: { include: { category: true } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
        location: true,
        images: true,
        assignments: {
          include: {
            technician: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, phone: true } },
              },
            },
          },
          orderBy: { assignedAt: 'desc' },
        },
        review: true,
        payment: true,
      },
    });
  },

  async findByCustomer(customerId, { skip, take, where, orderBy }) {
    const finalWhere = { customerId, ...where };
    const [data, total] = await prisma.$transaction([
      prisma.serviceRequest.findMany({
        skip,
        take,
        where: finalWhere,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          service: { include: { category: { select: { name: true, iconName: true } } } },
          location: { select: { city: true, state: true } },
          images: { select: { id: true, imageUrl: true }, take: 1 },
          assignments: {
            where: { status: 'ACCEPTED' },
            include: {
              technician: {
                include: {
                  user: { select: { firstName: true, lastName: true, avatarUrl: true } },
                },
              },
            },
            take: 1,
          },
        },
      }),
      prisma.serviceRequest.count({ where: finalWhere }),
    ]);
    return { data, total };
  },

  async findAll({ skip, take, where, orderBy }) {
    const [data, total] = await prisma.$transaction([
      prisma.serviceRequest.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          service: { select: { name: true } },
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          location: { select: { city: true, state: true } },
          assignments: {
            where: { status: 'ACCEPTED' },
            include: {
              technician: {
                include: {
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
            take: 1,
          },
        },
      }),
      prisma.serviceRequest.count({ where }),
    ]);
    return { data, total };
  },

  async updateStatus(id, status, extras = {}) {
    return prisma.serviceRequest.update({
      where: { id },
      data: { status, ...extras },
      include: {
        service: true,
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignments: {
          include: {
            technician: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });
  },

  async countByStatus(status, where = {}) {
    return prisma.serviceRequest.count({ where: { status, ...where } });
  },

  async getStats(where = {}) {
    const statuses = ['PENDING', 'MATCHING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    const counts = await Promise.all(
      statuses.map((status) =>
        prisma.serviceRequest.count({ where: { status, ...where } })
      )
    );
    return statuses.reduce((acc, status, i) => {
      acc[status] = counts[i];
      return acc;
    }, {});
  },
};

module.exports = requestRepository;
