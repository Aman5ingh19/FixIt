const logger = require('../config/logger');
const { AppError } = require('../utils/errors');
const config = require('../config');

/**
 * Centralized error handler — mounted as the last middleware.
 * Catches all errors and returns a consistent JSON response.
 */
function errorHandler(err, req, res, _next) {
  // Default to 500
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';
  let errors = err.errors || undefined;

  // Prisma-specific errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this value already exists';
    errorCode = 'DUPLICATE_ENTRY';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
    errorCode = 'NOT_FOUND';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorCode = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errorCode = 'TOKEN_EXPIRED';
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large. Maximum size is 5MB';
    errorCode = 'FILE_TOO_LARGE';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
    errorCode = 'UNEXPECTED_FILE';
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error('Unhandled error', {
      error: message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn('Client error', {
      error: message,
      errorCode,
      path: req.path,
      method: req.method,
      statusCode,
    });
  }

  const response = {
    success: false,
    message,
    errorCode,
  };

  // Include validation errors if present
  if (errors) {
    response.errors = errors;
  }

  // Include stack trace in development only
  if (config.env === 'development' && !(err instanceof AppError)) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
