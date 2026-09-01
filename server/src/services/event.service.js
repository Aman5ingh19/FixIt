/**
 * Event service — central event bus that dispatches events to
 * Socket.IO (real-time), RabbitMQ (async processing), and Kafka (streaming).
 */
const { emitToUser, emitToRole } = require('../config/socket');
const { publishEvent } = require('../config/rabbitmq');
const { produceEvent, TOPICS } = require('../config/kafka');
const n8nService = require('./n8n.service');
const logger = require('../config/logger');

const eventService = {
  /**
   * Emit a request-related event.
   */
  requestEvent(type, payload) {
    const routingKey = `request.${type}`;

    // Real-time: notify customer
    if (payload.customerId) {
      emitToUser(payload.customerId, 'request:update', { type, ...payload });
    }

    // Real-time: notify assigned technician
    if (payload.technicianUserId) {
      emitToUser(payload.technicianUserId, 'request:update', { type, ...payload });
    }

    // RabbitMQ: async processing (emails, matching, etc.)
    publishEvent(routingKey, payload);

    // Kafka: event stream for analytics
    produceEvent(TOPICS.REQUEST_EVENTS, routingKey, payload);

    // n8n: workflow automation
    n8nService.triggerWebhook(routingKey, payload);

    logger.debug('Request event dispatched', { type, requestId: payload.requestId });
  },

  /**
   * Emit a user-related event.
   */
  userEvent(type, payload) {
    const routingKey = `user.${type}`;

    publishEvent(routingKey, payload);
    produceEvent(TOPICS.USER_EVENTS, routingKey, payload);
    n8nService.triggerWebhook(routingKey, payload);

    logger.debug('User event dispatched', { type, userId: payload.userId });
  },

  /**
   * Emit a technician-related event.
   */
  technicianEvent(type, payload) {
    const routingKey = `technician.${type}`;

    if (payload.technicianUserId) {
      emitToUser(payload.technicianUserId, 'technician:update', { type, ...payload });
    }

    // Notify admins of verification requests
    if (type === 'profile_created' || type === 'verification_requested') {
      emitToRole('ADMIN', 'admin:technicianUpdate', { type, ...payload });
    }

    publishEvent(routingKey, payload);
    produceEvent(TOPICS.ANALYTICS_EVENTS, routingKey, payload);
    n8nService.triggerWebhook(routingKey, payload);

    logger.debug('Technician event dispatched', { type });
  },

  /**
   * Emit a notification to a specific user in real-time.
   */
  notify(userId, notification) {
    emitToUser(userId, 'notification:new', notification);
  },
};

module.exports = eventService;
