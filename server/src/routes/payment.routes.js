const { Router } = require('express');
const paymentController = require('../controllers/payment.controller');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  createPaymentSchema,
  updatePaymentStatusSchema,
  paymentQuerySchema,
} = require('../validators/payment.validators');

const router = Router();

// ── Public Endpoints ──
router.get('/config', paymentController.getConfig);
router.post('/webhook', paymentController.handleWebhook);

// ── Authenticated Endpoints ──
router.use(authenticate);

// Razorpay Order Creation & Signature Verification
router.post('/create-order', authorize('CUSTOMER', 'ADMIN'), paymentController.createOrder);
router.post('/verify-signature', authorize('CUSTOMER', 'ADMIN'), paymentController.verifySignature);

// Customer Payment History
router.get('/my-history', authorize('CUSTOMER'), paymentController.getMyHistory);

// Admin Payment Stats & Overview
router.get('/stats', authorize('ADMIN'), paymentController.getStats);

// Legacy & Generic Routes
router.post('/', validate(createPaymentSchema), paymentController.create);
router.get('/request/:requestId', paymentController.getByRequestId);
router.patch('/:id/status', authorize('ADMIN'), validate(updatePaymentStatusSchema), paymentController.updateStatus);
router.get('/:id', paymentController.getById);
router.get('/', authorize('ADMIN'), validate(paymentQuerySchema, 'query'), paymentController.getAll);

module.exports = router;
