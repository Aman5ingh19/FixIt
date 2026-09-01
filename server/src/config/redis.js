const Redis = require('ioredis');
const config = require('./index');
const logger = require('./logger');

let redisClient = null;

function getRedisClient() {
  if (redisClient) return redisClient;

  try {
    if (!config.redis.url) {
      logger.info('Redis URL not configured — running in-memory mode');
      return null;
    }

    const options = {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    };

    // Auto-detect TLS for Upstash rediss:// URLs
    if (config.redis.url.startsWith('rediss://')) {
      options.tls = {};
    }

    redisClient = new Redis(config.redis.url, options);

    redisClient.on('connect', () => {
      logger.info('✓ Connected to Redis / Upstash');
    });

    redisClient.on('error', (err) => {
      logger.warn('⚠ Redis connection warning', { error: err.message });
    });

    redisClient.connect().catch((err) => {
      logger.warn('⚠ Redis initial connection failed (graceful degradation)', { error: err.message });
    });

    return redisClient;
  } catch (error) {
    logger.warn('⚠ Redis initialization error', { error: error.message });
    return null;
  }
}

module.exports = { getRedisClient };
