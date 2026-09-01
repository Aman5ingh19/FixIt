const { ValidationError } = require('../utils/errors');

/**
 * Zod validation middleware factory.
 * Validates request body, query params, or route params against a Zod schema.
 *
 * Usage:
 *   validate(schema)              — validates req.body
 *   validate(schema, 'query')     — validates req.query
 *   validate(schema, 'params')    — validates req.params
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ValidationError('Validation failed', errors));
    }

    // Replace with parsed/transformed values
    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
