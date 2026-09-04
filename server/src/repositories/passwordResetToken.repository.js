const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const passwordResetTokenRepository = {
  /**
   * Create a new reset token (invalidate old ones for this user first).
   */
  async create({ userId, token, expiresAt }) {
    // Delete any existing unused tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId, usedAt: null },
    });

    return prisma.passwordResetToken.create({
      data: { userId, token, expiresAt },
      include: { user: true },
    });
  },

  /**
   * Find token record by raw token string.
   */
  async findByToken(token) {
    return prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  /**
   * Mark a token as used.
   */
  async markUsed(token) {
    return prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });
  },

  /**
   * Delete all reset tokens for a user.
   */
  async deleteByUser(userId) {
    return prisma.passwordResetToken.deleteMany({ where: { userId } });
  },
};

module.exports = passwordResetTokenRepository;
