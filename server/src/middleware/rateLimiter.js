const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Global rate limiter — generous in dev / localhost
 */
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.env === 'development' ? 10000 : config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => config.env === 'development' || req.ip === '127.0.0.1' || req.ip === '::1',
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Auth rate limiter for login/register endpoints.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.env === 'development' ? 500 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => config.env === 'development' || req.ip === '127.0.0.1' || req.ip === '::1',
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
});

module.exports = { globalLimiter, authLimiter };
