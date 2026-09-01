const { Router } = require('express');
const activityLogController = require('../controllers/activityLog.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', activityLogController.getAll);

module.exports = router;
