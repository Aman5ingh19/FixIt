const prisma = require('../config/database');

const serviceRepository = {
  // ── Categories ──

  async findAllCategories({ where } = {}) {
    return prisma.serviceCategory.findMany({
      where: { isActive: true, ...where },
      include: { _count: { select: { services: true } } },
      orderBy: { name: 'asc' },
    });
  },

  async findCategoryById(id) {
    return prisma.serviceCategory.findUnique({
      where: { id },
      include: { services: { where: { isActive: true } } },
    });
  },

  async createCategory(data) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return prisma.serviceCategory.create({ data: { ...data, slug } });
  },

  async updateCategory(id, data) {
    const updateData = { ...data };
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    return prisma.serviceCategory.update({ where: { id }, data: updateData });
  },

  async deleteCategory(id) {
    return prisma.serviceCategory.update({ where: { id }, data: { isActive: false } });
  },

  // ── Services ──

  async findAll({ skip, take, where, orderBy }) {
    const finalWhere = { isActive: true, ...where };
    const [data, total] = await prisma.$transaction([
      prisma.service.findMany({
        skip,
        take,
        where: finalWhere,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true, iconName: true } },
        },
      }),
      prisma.service.count({ where: finalWhere }),
    ]);
    return { data, total };
  },

  async findById(id) {
    return prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        _count: { select: { serviceRequests: true, technicianServices: true } },
      },
    });
  },

  async findBySlug(slug) {
    return prisma.service.findUnique({
      where: { slug },
      include: { category: true },
    });
  },

  async create(data) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return prisma.service.create({
      data: { ...data, slug },
      include: { category: true },
    });
  },

  async update(id, data) {
    const updateData = { ...data };
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    return prisma.service.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });
  },

  async delete(id) {
    return prisma.service.update({ where: { id }, data: { isActive: false } });
  },

  async search(query) {
    return prisma.service.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: { category: { select: { id: true, name: true, iconName: true } } },
      take: 20,
    });
  },
};

module.exports = serviceRepository;
