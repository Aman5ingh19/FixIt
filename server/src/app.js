const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const config = require('./config');
const logger = require('./config/logger');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');
const { sanitizeInput, requestId } = require('./middleware/security');

function createApp() {
  const app = express();

  // Trust reverse proxies (Cloudflare, Nginx, AWS ALB, Render, Vercel)
  app.enable('trust proxy');

  // ── Security ──
  app.use(helmet({
    contentSecurityPolicy: config.env === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: config.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // ── Request ID & Sanitization ──
  app.use(requestId);
  app.use(sanitizeInput);

  // ── Rate Limiting ──
  app.use(globalLimiter);

  // ── Body Parsing ──
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // ── Compression ──
  app.use(compression());

  // ── HTTP Logging ──
  const morganFormat = config.env === 'production' ? 'combined' : 'dev';
  app.use(morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim(), { type: 'http' }),
    },
    skip: (req) => req.path === '/api/health',
  }));

  // ── Root Route ──
  app.get('/', (req, res) => {
    res.json({
      name: 'FixIt Backend API',
      version: '1.0.0',
      status: 'online',
      message: 'FixIt Service Request & Repair Network API is live and operational.',
      healthCheck: '/api/health',
      documentation: 'https://github.com/AmanSingh19/FixIt#readme',
      author: 'Aman Singh',
    });
  });

  // ── Routes ──
  app.use('/api', routes);

  // ── 404 Handler ──
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.path} not found`,
      errorCode: 'ROUTE_NOT_FOUND',
    });
  });

  // ── Centralized Error Handler ──
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
