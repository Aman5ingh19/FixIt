const prisma = require('../config/database');

const paymentRepository = {
  async create({ requestId, amount, status = 'PENDING', method, transactionId }) {
    return prisma.payment.create({
      data: {
        requestId,
        amount,
        status,
        method: method || 'STATUS_TRACKING',
        transactionId: transactionId || `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      },
      include: {
        request: {
          include: {
            customer: { select: { id: true, firstName: true, lastName: true, email: true } },
            service: { select: { id: true, name: true } },
          },
        },
      },
    });
  },

  async findByRequestId(requestId) {
    return prisma.payment.findUnique({
      where: { requestId },
      include: {
        request: {
          include: {
            customer: { select: { id: true, firstName: true, lastName: true, email: true } },
            service: { select: { id: true, name: true } },
          },
        },
      },
    });
  },

  async findById(id) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        request: {
          include: {
            customer: { select: { id: true, firstName: true, lastName: true, email: true } },
            service: { select: { id: true, name: true } },
          },
        },
      },
    });
  },

  async updateStatus(id, status, { method, transactionId } = {}) {
    const data = { status };
    if (method) data.method = method;
    if (transactionId) data.transactionId = transactionId;

    return prisma.payment.update({
      where: { id },
      data,
      include: {
        request: {
          include: {
            customer: { select: { id: true, firstName: true, lastName: true, email: true } },
            service: { select: { id: true, name: true } },
          },
        },
      },
    });
  },

  async findAll({ skip = 0, take = 20, where = {}, orderBy = { createdAt: 'desc' } }) {
    const [data, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          request: {
            include: {
              customer: { select: { id: true, firstName: true, lastName: true, email: true } },
              service: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return { data, total };
  },
};

module.exports = paymentRepository;
