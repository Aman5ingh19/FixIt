const amqplib = require('amqplib');
const config = require('./index');
const logger = require('./logger');

let connection = null;
let channel = null;

const QUEUES = {
  NOTIFICATIONS: 'fixit.notifications',
  EMAILS: 'fixit.emails',
  MATCHING: 'fixit.matching',
  ANALYTICS: 'fixit.analytics',
  WEBHOOKS: 'fixit.webhooks',
  DLQ: 'fixit.dlq',
};

const EXCHANGES = {
  EVENTS: 'fixit.events',
  DLX: 'fixit.dlx',
};

async function initRabbitMQ() {
  if (!config.rabbitmq.url) {
    logger.info('RabbitMQ not configured (RABBITMQ_URL not set) — skipping message queue');
    return { connection: null, channel: null };
  }

  try {
    connection = await amqplib.connect(config.rabbitmq.url);
    channel = await connection.createChannel();

    // 1. Declare Dead Letter Exchange & Queue
    await channel.assertExchange(EXCHANGES.DLX, 'direct', { durable: true });
    await channel.assertQueue(QUEUES.DLQ, { durable: true });
    await channel.bindQueue(QUEUES.DLQ, EXCHANGES.DLX, 'dead-letter');

    // 2. Declare Primary Events Topic Exchange
    await channel.assertExchange(EXCHANGES.EVENTS, 'topic', { durable: true });

    // 3. Declare queues with DLX routing
    const queueOptions = {
      durable: true,
      deadLetterExchange: EXCHANGES.DLX,
      deadLetterRoutingKey: 'dead-letter',
    };

    for (const [key, queue] of Object.entries(QUEUES)) {
      if (key !== 'DLQ') {
        await channel.assertQueue(queue, queueOptions);
      }
    }

    // 4. Bind queues to exchange with routing keys
    await channel.bindQueue(QUEUES.NOTIFICATIONS, EXCHANGES.EVENTS, 'request.*');
    await channel.bindQueue(QUEUES.NOTIFICATIONS, EXCHANGES.EVENTS, 'technician.*');
    await channel.bindQueue(QUEUES.NOTIFICATIONS, EXCHANGES.EVENTS, 'review.*');
    await channel.bindQueue(QUEUES.EMAILS, EXCHANGES.EVENTS, 'email.*');
    await channel.bindQueue(QUEUES.EMAILS, EXCHANGES.EVENTS, 'auth.reset_password');
    await channel.bindQueue(QUEUES.MATCHING, EXCHANGES.EVENTS, 'request.created');
    await channel.bindQueue(QUEUES.WEBHOOKS, EXCHANGES.EVENTS, 'request.*');
    await channel.bindQueue(QUEUES.WEBHOOKS, EXCHANGES.EVENTS, 'payment.*');
    await channel.bindQueue(QUEUES.WEBHOOKS, EXCHANGES.EVENTS, 'technician.registered');
    await channel.bindQueue(QUEUES.ANALYTICS, EXCHANGES.EVENTS, '#');

    // Prefetch for fair load balancing
    await channel.prefetch(10);

    connection.on('error', (err) => {
      logger.error('RabbitMQ connection error', { error: err.message });
    });

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed');
    });

    logger.info('✓ RabbitMQ connected & configured with DLX/DLQ');
    return { connection, channel };
  } catch (error) {
    logger.warn('⚠ RabbitMQ not available — running in fallback mode', { error: error.message });
    return { connection: null, channel: null };
  }
}

function publishEvent(routingKey, payload) {
  if (!channel) return;
  try {
    channel.publish(
      EXCHANGES.EVENTS,
      routingKey,
      Buffer.from(JSON.stringify({
        event: routingKey,
        timestamp: new Date().toISOString(),
        data: payload,
      })),
      { persistent: true }
    );
    logger.debug('Event published', { routingKey });
  } catch (error) {
    logger.error('Failed to publish event', { routingKey, error: error.message });
  }
}

function getChannel() {
  return channel;
}

async function closeRabbitMQ() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    logger.info('RabbitMQ connection closed');
  } catch {
    // silent
  }
}

module.exports = { initRabbitMQ, publishEvent, getChannel, closeRabbitMQ, QUEUES, EXCHANGES };
