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

router.use(authenticate);

// Create payment record
router.post('/', validate(createPaymentSchema), paymentController.create);

// Get payment by request ID
router.get('/request/:requestId', paymentController.getByRequestId);

// Update status (Admin or authorized roles)
router.patch('/:id/status', authorize('ADMIN', 'CUSTOMER'), validate(updatePaymentStatusSchema), paymentController.updateStatus);

// Get payment by ID
router.get('/:id', paymentController.getById);

// Admin: list all payments
router.get('/', authorize('ADMIN'), validate(paymentQuerySchema, 'query'), paymentController.getAll);

module.exports = router;
