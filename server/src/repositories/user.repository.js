const prisma = require('../config/database');

const userRepository = {
  async findByEmail(email) {
    if (!email) return null;
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  },

  async findById(id, includeProfile = false) {
    return prisma.user.findUnique({
      where: { id },
      include: includeProfile
        ? { technicianProfile: { include: { technicianServices: { include: { service: true } }, serviceAreas: true } } }
        : undefined,
    });
  },

  async create(data) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });
  },

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        emailVerified: true,
        updatedAt: true,
      },
    });
  },

  async findAll({ skip, take, where, orderBy }) {
    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        skip,
        take,
        where,
        orderBy,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);
    return { data, total };
  },

  async countByRole(role) {
    return prisma.user.count({ where: { role } });
  },
};

module.exports = userRepository;
