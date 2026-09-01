const { Router } = require('express');
const requestController = require('../controllers/request.controller');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  createRequestSchema,
  updateRequestStatusSchema,
  cancelRequestSchema,
  requestQuerySchema,
} = require('../validators/request.validators');

const router = Router();

// All routes require authentication
router.use(authenticate);

// Customer: create request
router.post('/', authorize('CUSTOMER'), validate(createRequestSchema), requestController.create);

// Customer: get my requests
router.get('/my', authorize('CUSTOMER'), validate(requestQuerySchema, 'query'), requestController.getMyRequests);

// Admin: get all requests + stats
router.get('/', authorize('ADMIN'), validate(requestQuerySchema, 'query'), requestController.getAll);
router.get('/stats', authorize('ADMIN'), requestController.getStats);

// Any authenticated user: get request by ID (authorization checked in service)
router.get('/:id', requestController.getById);

// Admin: update status
router.patch('/:id/status', authorize('ADMIN'), validate(updateRequestStatusSchema), requestController.updateStatus);

// Customer: cancel request
router.post('/:id/cancel', authorize('CUSTOMER'), validate(cancelRequestSchema), requestController.cancel);

// Customer: confirm completion
router.post('/:id/confirm', authorize('CUSTOMER'), requestController.confirmCompletion);

module.exports = router;
