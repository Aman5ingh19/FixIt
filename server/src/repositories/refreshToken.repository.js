const prisma = require('../config/database');

const refreshTokenRepository = {
  async create({ userId, token, expiresAt, userAgent, ipAddress }) {
    return prisma.refreshToken.create({
      data: { userId, token, expiresAt, userAgent, ipAddress },
    });
  },

  async findByToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  async revokeByToken(token) {
    return prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  },

  async revokeAllByUser(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  },

  async deleteExpired() {
    return prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },
};

module.exports = refreshTokenRepository;
