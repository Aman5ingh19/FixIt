/**
 * RabbitMQ workers — consume messages from queues for async processing.
 */
const { getChannel, QUEUES } = require('../config/rabbitmq');
const notificationRepository = require('../repositories/notification.repository');
const { emitToUser } = require('../config/socket');
const logger = require('../config/logger');

function startWorkers() {
  const channel = getChannel();
  if (!channel) {
    logger.warn('Workers not started — RabbitMQ unavailable');
    return;
  }

  // ── Notification Worker ──
  channel.consume(QUEUES.NOTIFICATIONS, async (msg) => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());
      logger.debug('Processing notification event', { event: event.event });

      // Create DB notification based on event type
      const { data } = event;
      if (data.customerId) {
        const notification = await notificationRepository.create({
          userId: data.customerId,
          type: event.event.replace('request.', 'REQUEST_').replace('technician.', 'TECHNICIAN_').toUpperCase(),
          title: data.title || `Request ${event.event.split('.')[1]}`,
          body: data.message || `Status update for your request.`,
          data: { requestId: data.requestId },
        });
        emitToUser(data.customerId, 'notification:new', notification);
      }

      channel.ack(msg);
    } catch (error) {
      logger.error('Notification worker error', { error: error.message });
      channel.nack(msg, false, false); // Dead-letter
    }
  });

  // ── Email Worker ──
  channel.consume(QUEUES.EMAILS, async (msg) => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());
      logger.debug('Processing email event', { event: event.event });

      // In production, send via Nodemailer/SendGrid
      // For now, just log
      logger.info('Email would be sent', {
        to: event.data.email,
        subject: event.data.subject || event.event,
      });

      channel.ack(msg);
    } catch (error) {
      logger.error('Email worker error', { error: error.message });
      channel.nack(msg, false, false);
    }
  });

  // ── Analytics Worker ──
  channel.consume(QUEUES.ANALYTICS, async (msg) => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());
      // In production, push to analytics pipeline (ClickHouse, BigQuery, etc.)
      logger.debug('Analytics event recorded', { event: event.event, timestamp: event.timestamp });
      channel.ack(msg);
    } catch (error) {
      logger.error('Analytics worker error', { error: error.message });
      channel.nack(msg, false, false);
    }
  });

  logger.info('✓ RabbitMQ workers started');
}

module.exports = { startWorkers };
