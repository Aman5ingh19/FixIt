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
};

const EXCHANGES = {
  EVENTS: 'fixit.events',
};

async function initRabbitMQ() {
  try {
    connection = await amqplib.connect(config.rabbitmq.url);
    channel = await connection.createChannel();

    // Declare exchange
    await channel.assertExchange(EXCHANGES.EVENTS, 'topic', { durable: true });

    // Declare queues
    for (const queue of Object.values(QUEUES)) {
      await channel.assertQueue(queue, { durable: true });
    }

    // Bind queues to exchange with routing keys
    await channel.bindQueue(QUEUES.NOTIFICATIONS, EXCHANGES.EVENTS, 'request.*');
    await channel.bindQueue(QUEUES.NOTIFICATIONS, EXCHANGES.EVENTS, 'technician.*');
    await channel.bindQueue(QUEUES.EMAILS, EXCHANGES.EVENTS, 'email.*');
    await channel.bindQueue(QUEUES.MATCHING, EXCHANGES.EVENTS, 'request.created');
    await channel.bindQueue(QUEUES.ANALYTICS, EXCHANGES.EVENTS, '#');

    // Prefetch for fair dispatch
    await channel.prefetch(1);

    connection.on('error', (err) => {
      logger.error('RabbitMQ connection error', { error: err.message });
    });

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed');
    });

    logger.info('✓ RabbitMQ connected');
    return { connection, channel };
  } catch (error) {
    logger.warn('⚠ RabbitMQ not available — running without message queue', { error: error.message });
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
