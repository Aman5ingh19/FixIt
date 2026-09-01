const winston = require('winston');
const config = require('./index');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom format for development console output
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
});

// Filter out sensitive fields from logs
const sensitiveFields = ['password', 'passwordHash', 'token', 'accessToken', 'refreshToken', 'secret', 'apiKey'];
const redactSensitive = winston.format((info) => {
  for (const field of sensitiveFields) {
    if (info[field]) {
      info[field] = '[REDACTED]';
    }
  }
  return info;
});

const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'fixit-api' },
  format: combine(
    redactSensitive(),
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: config.env === 'production'
        ? combine(json())
        : combine(colorize(), devFormat),
    }),
    // Error file transport
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(json()),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    // Combined file transport
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(json()),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

module.exports = logger;
