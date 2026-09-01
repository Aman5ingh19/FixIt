const { AuthorizationError } = require('../utils/errors');

/**
 * Role-based access control middleware factory.
 * Usage: authorize('ADMIN', 'TECHNICIAN')
 *
 * Must be used AFTER authenticate middleware.
 * Never trusts role from the frontend — checks req.user.role from DB.
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AuthorizationError(
          `Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
}

module.exports = { authorize };
