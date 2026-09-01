const prisma = require('../config/database');

const paymentRepository = {
  async upsert({ requestId, amount, status = 'PENDING', method = 'RAZORPAY', transactionId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    return prisma.payment.upsert({
      where: { requestId },
      create: {
        requestId,
        amount,
        status,
        method,
        transactionId: transactionId || `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      },
      update: {
        amount,
        status,
        method,
        ...(transactionId && { transactionId }),
        ...(razorpayOrderId && { razorpayOrderId }),
        ...(razorpayPaymentId && { razorpayPaymentId }),
        ...(razorpaySignature && { razorpaySignature }),
      },
      include: {
        request: {
          include: {
            customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
            service: { select: { id: true, name: true, basePrice: true } },
          },
        },
      },
    });
  },

  async create({ requestId, amount, status = 'PENDING', method, transactionId, razorpayOrderId }) {
    return prisma.payment.create({
      data: {
        requestId,
        amount,
        status,
        method: method || 'RAZORPAY',
        transactionId: transactionId || `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        razorpayOrderId,
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
            customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
            service: { select: { id: true, name: true, basePrice: true } },
          },
        },
      },
    });
  },

  async findByRazorpayOrderId(razorpayOrderId) {
    return prisma.payment.findFirst({
      where: { razorpayOrderId },
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

  async updateStatus(id, status, { method, transactionId, razorpayPaymentId, razorpaySignature } = {}) {
    const data = { status };
    if (method) data.method = method;
    if (transactionId) data.transactionId = transactionId;
    if (razorpayPaymentId) data.razorpayPaymentId = razorpayPaymentId;
    if (razorpaySignature) data.razorpaySignature = razorpaySignature;

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

  async getCustomerPayments(customerId, { skip = 0, take = 20, status, search }) {
    const where = {
      request: {
        customerId,
        ...(search && {
          title: { contains: search, mode: 'insensitive' },
        }),
      },
      ...(status && status !== 'ALL' && { status }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          request: {
            include: {
              service: { select: { id: true, name: true } },
              location: { select: { city: true, state: true } },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return { data, total };
  },

  async getStats() {
    const [totalRevenueResult, counts] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' },
      }),
      prisma.payment.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const statusCounts = {
      PAID: 0,
      PENDING: 0,
      FAILED: 0,
      REFUNDED: 0,
    };

    counts.forEach((item) => {
      statusCounts[item.status] = item._count.status;
    });

    const totalRevenue = totalRevenueResult._sum.amount || 0;
    const totalTransactions = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    return {
      totalRevenue,
      totalTransactions,
      ...statusCounts,
    };
  },
};

module.exports = paymentRepository;
