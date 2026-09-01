const { Router } = require('express');
const authRoutes = require('./auth.routes');
const serviceRoutes = require('./service.routes');
const requestRoutes = require('./request.routes');
const technicianRoutes = require('./technician.routes');
const reviewRoutes = require('./review.routes');
const notificationRoutes = require('./notification.routes');
const uploadRoutes = require('./upload.routes');
const activityLogRoutes = require('./activityLog.routes');
const paymentRoutes = require('./payment.routes');

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FixIt API is running',
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/requests', requestRoutes);
router.use('/technicians', technicianRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/uploads', uploadRoutes);
router.use('/activity-logs', activityLogRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;
