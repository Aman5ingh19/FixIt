const http = require('http');
const createApp = require('./app');
const config = require('./config');
const logger = require('./config/logger');
const prisma = require('./config/database');
const { getRedisClient } = require('./config/redis');
const { initSocketIO } = require('./config/socket');
const { initRabbitMQ, closeRabbitMQ } = require('./config/rabbitmq');
const { initKafka, closeKafka } = require('./config/kafka');
const { startWorkers } = require('./workers');

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('✓ Connected to PostgreSQL');

    // Auto-verify & seed demo accounts if missing
    const { autoSeed } = require('./config/autoSeed');
    await autoSeed();

    // Connect to Redis / Upstash (optional caching)
    getRedisClient();

    // Create Express app
    const app = createApp();

    // Create HTTP server (needed for Socket.IO in Phase 3)
    const server = http.createServer(app);

    // Initialize Socket.IO
    const io = initSocketIO(server);

    // Initialize event infrastructure (non-blocking — gracefully degrades)
    await initRabbitMQ().then(() => startWorkers());
    await initKafka();

    // Start listening
    server.listen(config.port, () => {
      logger.info(`✓ FixIt API server running on port ${config.port}`);
      logger.info(`  Environment: ${config.env}`);
      logger.info(`  Health check: http://localhost:${config.port}/api/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        await prisma.$disconnect();
        await closeRabbitMQ();
        await closeKafka();
        logger.info('All connections closed');

        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection', { error: reason });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

startServer();
