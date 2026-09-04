/**
 * Audit logging middleware — records significant actions for security/compliance.
 */
const activityLogRepository = require('../repositories/activityLog.repository');
const logger = require('../config/logger');

const LOGGED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function auditLogger(resource) {
  return async (req, res, next) => {
    // Only log mutating operations
    if (!LOGGED_METHODS.includes(req.method)) return next();

    // Store original end to intercept response
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
      res.end = originalEnd;
      res.end(chunk, encoding);

      // Log only on successful mutations
      if (res.statusCode < 400 && req.user) {
        const action = `${req.method} ${req.originalUrl}`;
        activityLogRepository.create({
          userId: req.user.id,
          action,
          entity: resource || 'System',
          entityId: req.params?.id || null,
          details: {
            statusCode: res.statusCode,
            body: sanitizeBody(req.body),
          },
          ipAddress: req.ip || req.connection?.remoteAddress,
        }).catch((err) => {
          logger.error('Audit log failed', { error: err.message, action });
        });
      }
    };

    next();
  };
}

function sanitizeBody(body) {
  if (!body) return {};
  const sanitized = { ...body };
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.passwordHash;
  delete sanitized.currentPassword;
  delete sanitized.newPassword;
  delete sanitized.confirmPassword;
  delete sanitized.token;
  delete sanitized.refreshToken;
  return sanitized;
}

module.exports = auditLogger;
