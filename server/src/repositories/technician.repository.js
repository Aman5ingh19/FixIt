const prisma = require('../config/database');

const technicianRepository = {
  async findProfile(userId) {
    return prisma.technicianProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true } },
        technicianServices: { include: { service: { include: { category: true } } } },
        serviceAreas: true,
      },
    });
  },

  async findProfileById(id) {
    return prisma.technicianProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true } },
        technicianServices: { include: { service: true } },
        serviceAreas: true,
      },
    });
  },

  async createProfile(userId, data) {
    const { services, serviceAreas, ...profileData } = data;
    return prisma.technicianProfile.create({
      data: {
        userId,
        ...profileData,
        technicianServices: {
          createMany: {
            data: services.map((s) => ({ serviceId: s.serviceId, hourlyRate: s.hourlyRate })),
          },
        },
        serviceAreas: {
          createMany: { data: serviceAreas },
        },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        technicianServices: { include: { service: true } },
        serviceAreas: true,
      },
    });
  },

  async updateProfile(userId, data) {
    return prisma.technicianProfile.update({
      where: { userId },
      data,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        technicianServices: { include: { service: true } },
        serviceAreas: true,
      },
    });
  },

  async setAvailability(userId, availability) {
    return prisma.technicianProfile.update({
      where: { userId },
      data: { availability },
    });
  },

  async findSuitableTechnicians(serviceId, city) {
    return prisma.technicianProfile.findMany({
      where: {
        availability: 'ONLINE',
        verificationStatus: 'APPROVED',
        technicianServices: { some: { serviceId } },
        serviceAreas: city ? { some: { city: { equals: city, mode: 'insensitive' } } } : undefined,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        technicianServices: { where: { serviceId }, include: { service: true } },
      },
      orderBy: { averageRating: 'desc' },
      take: 10,
    });
  },

  async findAll({ skip, take, where, orderBy }) {
    const [data, total] = await prisma.$transaction([
      prisma.technicianProfile.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true, isActive: true } },
          technicianServices: { include: { service: { select: { name: true } } } },
          serviceAreas: { select: { city: true, state: true } },
          _count: { select: { assignments: true } },
        },
      }),
      prisma.technicianProfile.count({ where }),
    ]);
    return { data, total };
  },

  async getAssignments(technicianId, { skip, take, where, orderBy }) {
    const finalWhere = { technicianId, ...where };
    const [data, total] = await prisma.$transaction([
      prisma.requestAssignment.findMany({
        skip,
        take,
        where: finalWhere,
        orderBy: orderBy || { assignedAt: 'desc' },
        include: {
          request: {
            include: {
              service: { include: { category: { select: { name: true } } } },
              customer: { select: { id: true, firstName: true, lastName: true, phone: true, avatarUrl: true } },
              location: { select: { address: true, city: true, state: true, zipCode: true } },
              images: { select: { imageUrl: true }, take: 1 },
            },
          },
        },
      }),
      prisma.requestAssignment.count({ where: finalWhere }),
    ]);
    return { data, total };
  },

  async createAssignment(requestId, technicianId) {
    return prisma.requestAssignment.create({
      data: { requestId, technicianId },
      include: {
        request: { include: { service: true, customer: { select: { id: true, firstName: true, lastName: true } } } },
        technician: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });
  },

  async updateAssignment(requestId, technicianId, status) {
    return prisma.requestAssignment.update({
      where: { requestId_technicianId: { requestId, technicianId } },
      data: { status, respondedAt: new Date() },
    });
  },

  async updateRating(technicianProfileId, averageRating, totalReviews) {
    return prisma.technicianProfile.update({
      where: { id: technicianProfileId },
      data: { averageRating, totalReviews },
    });
  },

  async incrementJobsCompleted(userId) {
    return prisma.technicianProfile.update({
      where: { userId },
      data: { totalJobsCompleted: { increment: 1 } },
    });
  },
};

module.exports = technicianRepository;
