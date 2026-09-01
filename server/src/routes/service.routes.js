const { Router } = require('express');
const serviceController = require('../controllers/service.controller');
const { validate } = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  createServiceCategorySchema,
  updateServiceCategorySchema,
  createServiceSchema,
  updateServiceSchema,
  serviceQuerySchema,
} = require('../validators/service.validators');

const router = Router();

// ── Categories (public read, admin write) ──
router.get('/categories', serviceController.getCategories);
router.get('/categories/:id', serviceController.getCategoryById);
router.post('/categories', authenticate, authorize('ADMIN'), validate(createServiceCategorySchema), serviceController.createCategory);
router.put('/categories/:id', authenticate, authorize('ADMIN'), validate(updateServiceCategorySchema), serviceController.updateCategory);
router.delete('/categories/:id', authenticate, authorize('ADMIN'), serviceController.deleteCategory);

// ── Services (public read, admin write) ──
router.get('/', validate(serviceQuerySchema, 'query'), serviceController.getServices);
router.get('/search', serviceController.searchServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', authenticate, authorize('ADMIN'), validate(createServiceSchema), serviceController.createService);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateServiceSchema), serviceController.updateService);
router.delete('/:id', authenticate, authorize('ADMIN'), serviceController.deleteService);

module.exports = router;
