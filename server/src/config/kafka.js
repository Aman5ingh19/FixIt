const { Kafka, logLevel } = require('kafkajs');
const config = require('./index');
const logger = require('./logger');

let kafka = null;
let producer = null;
let consumer = null;

const TOPICS = {
  REQUEST_EVENTS: 'fixit.request.events',
  USER_EVENTS: 'fixit.user.events',
  ANALYTICS_EVENTS: 'fixit.analytics.events',
};

async function initKafka() {
  try {
    const kafkaOptions = {
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      logLevel: logLevel.WARN,
      retry: { initialRetryTime: 300, retries: 5 },
    };

    if (config.kafka.ssl) {
      kafkaOptions.ssl = config.kafka.ssl;
    }
    if (config.kafka.sasl) {
      kafkaOptions.sasl = config.kafka.sasl;
    }

    kafka = new Kafka(kafkaOptions);

    // Producer
    producer = kafka.producer();
    await producer.connect();

    logger.info('✓ Kafka producer connected');
    return { kafka, producer };
  } catch (error) {
    logger.warn('⚠ Kafka not available — running without event streaming', { error: error.message });
    return { kafka: null, producer: null };
  }
}

async function produceEvent(topic, key, value) {
  if (!producer) return;
  try {
    await producer.send({
      topic,
      messages: [{
        key,
        value: JSON.stringify({
          event: key,
          timestamp: new Date().toISOString(),
          data: value,
        }),
      }],
    });
    logger.debug('Kafka event produced', { topic, key });
  } catch (error) {
    logger.error('Failed to produce Kafka event', { topic, key, error: error.message });
  }
}

async function createConsumer(groupId, topics, handler) {
  if (!kafka) return null;
  try {
    const consumer = kafka.consumer({ groupId });
    await consumer.connect();

    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = JSON.parse(message.value.toString());
          await handler(topic, value);
        } catch (error) {
          logger.error('Kafka consumer error', { topic, error: error.message });
        }
      },
    });

    logger.info(`✓ Kafka consumer "${groupId}" started`, { topics });
    return consumer;
  } catch (error) {
    logger.error('Failed to create Kafka consumer', { groupId, error: error.message });
    return null;
  }
}

async function closeKafka() {
  try {
    if (producer) await producer.disconnect();
    if (consumer) await consumer.disconnect();
    logger.info('Kafka connections closed');
  } catch {
    // silent
  }
}

module.exports = { initKafka, produceEvent, createConsumer, closeKafka, TOPICS };
