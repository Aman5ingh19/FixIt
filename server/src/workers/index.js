/**
 * RabbitMQ workers — consume messages from queues for async processing.
 */
const { getChannel, QUEUES } = require('../config/rabbitmq');
const notificationRepository = require('../repositories/notification.repository');
const { emitToUser } = require('../config/socket');
const logger = require('../config/logger');
const config = require('../config');

function startWorkers() {
  const channel = getChannel();
  if (!channel) {
    logger.warn('Workers not started — RabbitMQ unavailable');
    return;
  }

  // ── 1. Notification Worker ──
  channel.consume(QUEUES.NOTIFICATIONS, async (msg) => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());
      logger.debug('Processing notification event', { event: event.event });

      const { data } = event;
      if (data && data.customerId) {
        const type = event.event
          .replace('request.', 'REQUEST_')
          .replace('technician.', 'TECHNICIAN_')
          .replace('review.', 'REVIEW_')
          .toUpperCase();

        const notification = await notificationRepository.create({
          userId: data.customerId,
          type: type || 'SYSTEM',
          title: data.title || `Update on your service request`,
          body: data.message || `Status update for request #${data.requestId || ''}`,
          data: { requestId: data.requestId, extra: data },
        });
        emitToUser(data.customerId, 'notification:new', notification);
      }

      if (data && data.technicianUserId) {
        const notification = await notificationRepository.create({
          userId: data.technicianUserId,
          type: 'REQUEST_ASSIGNED',
          title: data.title || `New Job Dispatch`,
          body: data.message || `New service request assigned to you`,
          data: { requestId: data.requestId },
        });
        emitToUser(data.technicianUserId, 'notification:new', notification);
      }

      channel.ack(msg);
    } catch (error) {
      logger.error('Notification worker error', { error: error.message });
      channel.nack(msg, false, false); // Route to DLQ
    }
  });

  // ── 2. Email Worker ──
  channel.consume(QUEUES.EMAILS, async (msg) => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());
      logger.debug('Processing email event', { event: event.event });

      const { data } = event;
      if (data && data.toEmail) {
        logger.info('Async email task dispatched', {
          to: data.toEmail,
          subject: data.subject || event.event,
        });
      }

      channel.ack(msg);
    } catch (error) {
      logger.error('Email worker error', { error: error.message });
      channel.nack(msg, false, false); // Route to DLQ
    }
  });

  // ── 3. Webhooks Worker (n8n / 3rd Party Dispatcher) ──
  channel.consume(QUEUES.WEBHOOKS, async (msg) => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());
      logger.debug('Processing webhook event', { event: event.event });

      const webhookUrl = config.n8n.webhookUrl;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-FixIt-Event': event.event || 'custom',
              ...(config.n8n.apiKey ? { 'X-FixIt-Key': config.n8n.apiKey } : {}),
            },
            body: JSON.stringify(event),
          });
          logger.debug('Webhook forwarded to n8n', { url: webhookUrl, event: event.event });
        } catch (webhookErr) {
          logger.debug('n8n webhook endpoint unreachable (skipped gracefully)', { error: webhookErr.message });
        }
      }

      channel.ack(msg);
    } catch (error) {
      logger.error('Webhook worker error', { error: error.message });
      channel.nack(msg, false, false);
    }
  });

  // ── 4. Analytics Worker ──
  channel.consume(QUEUES.ANALYTICS, async (msg) => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());
      logger.debug('Analytics telemetry recorded', { event: event.event, timestamp: event.timestamp });
      channel.ack(msg);
    } catch (error) {
      logger.error('Analytics worker error', { error: error.message });
      channel.nack(msg, false, false);
    }
  });

  logger.info('✓ RabbitMQ workers active (Notifications, Emails, Webhooks, Analytics)');
}

module.exports = { startWorkers };
