const { Router } = require('express');
const reviewController = require('../controllers/review.controller');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { createReviewSchema, reviewQuerySchema } = require('../validators/review.validators');

const router = Router();

router.use(authenticate);

// Customer: create review
router.post('/', authorize('CUSTOMER'), validate(createReviewSchema), reviewController.create);

// Public: get reviews for a technician
router.get('/technician/:id', validate(reviewQuerySchema, 'query'), reviewController.getTechnicianReviews);

// Admin: get all reviews
router.get('/', authorize('ADMIN'), validate(reviewQuerySchema, 'query'), reviewController.getAll);

module.exports = router;
