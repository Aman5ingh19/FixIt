const { verifyAccessToken } = require('../utils/jwt');
const { AuthenticationError } = require('../utils/errors');
const prisma = require('../config/database');

/**
 * JWT authentication middleware.
 * Extracts token from Authorization header or cookie.
 * Attaches user to req.user.
 */
async function authenticate(req, res, next) {
  try {
    let token;

    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Fetch user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('User no longer exists');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account has been deactivated');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(error);
    } else {
      next(new AuthenticationError('Authentication failed'));
    }
  }
}

/**
 * Optional authentication — attaches user if token present, but doesn't fail otherwise.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch {
    // Silently continue without user
  }
  next();
}

module.exports = { authenticate, optionalAuth };
