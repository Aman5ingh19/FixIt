const config = require('../config');
const logger = require('../config/logger');

/**
 * n8n Workflow Automation Integration Service.
 * Compatible with both local Docker container n8n and n8n Cloud.
 */
const n8nService = {
  /**
   * Dispatch an event webhook to n8n workflow.
   * @param {string} eventName - e.g. 'request.created', 'technician.verified'
   * @param {object} payload - Event payload
   */
  async triggerWebhook(eventName, payload) {
    if (!config.n8n.webhookUrl) {
      logger.debug('n8n webhook URL not configured, skipping workflow trigger', { eventName });
      return;
    }

    try {
      const url = `${config.n8n.webhookUrl.replace(/\/$/, '')}/${eventName.replace('.', '-')}`;
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'FixIt-Backend/1.0',
      };

      if (config.n8n.apiKey) {
        headers['X-N8N-API-KEY'] = config.n8n.apiKey;
        headers['Authorization'] = `Bearer ${config.n8n.apiKey}`;
      }

      // Using native fetch in Node 18+
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event: eventName,
          timestamp: new Date().toISOString(),
          data: payload,
          source: 'fixit-api',
        }),
      });

      if (!response.ok) {
        logger.warn('n8n webhook responded with non-2xx status', {
          url,
          status: response.status,
          eventName,
        });
      } else {
        logger.info('✓ n8n workflow triggered successfully', { eventName, url });
      }
    } catch (error) {
      // Non-blocking: workflow errors should never break main transaction
      logger.warn('Failed to trigger n8n webhook (n8n might be offline or workflow inactive)', {
        eventName,
        error: error.message,
      });
    }
  },

  /**
   * Trigger workflow for new high priority service requests.
   */
  async onHighPriorityRequest(request) {
    if (request.priority >= 2) { // Urgent
      await this.triggerWebhook('urgent-request-alert', {
        requestId: request.id,
        title: request.title,
        service: request.service?.name,
        customer: `${request.customer?.firstName} ${request.customer?.lastName}`,
        location: request.location,
        createdAt: request.createdAt,
      });
    }
  },

  /**
   * Trigger workflow when a technician is approved/verified.
   */
  async onTechnicianVerified(technician) {
    await this.triggerWebhook('technician-onboarded', {
      technicianId: technician.id,
      name: `${technician.user?.firstName} ${technician.user?.lastName}`,
      email: technician.user?.email,
      skills: technician.technicianServices?.map((s) => s.service?.name),
      serviceAreas: technician.serviceAreas?.map((a) => a.city),
    });
  },
};

module.exports = n8nService;
