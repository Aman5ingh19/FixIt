const { Router } = require('express');
const technicianController = require('../controllers/technician.controller');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  createTechnicianProfileSchema,
  updateTechnicianProfileSchema,
  updateAvailabilitySchema,
  technicianQuerySchema,
} = require('../validators/technician.validators');

const router = Router();

router.use(authenticate);

// ── Technician self-service ──
router.get('/profile', authorize('TECHNICIAN'), technicianController.getProfile);
router.post('/profile', authorize('TECHNICIAN'), validate(createTechnicianProfileSchema), technicianController.createProfile);
router.put('/profile', authorize('TECHNICIAN'), validate(updateTechnicianProfileSchema), technicianController.updateProfile);
router.patch('/availability', authorize('TECHNICIAN'), validate(updateAvailabilitySchema), technicianController.setAvailability);

// ── Technician job management ──
router.get('/requests/available', authorize('TECHNICIAN'), technicianController.getAvailableRequests);
router.get('/jobs/assigned', authorize('TECHNICIAN'), technicianController.getAssignedJobs);
router.get('/jobs/history', authorize('TECHNICIAN'), technicianController.getJobHistory);
router.post('/requests/:id/accept', authorize('TECHNICIAN'), technicianController.acceptRequest);
router.post('/requests/:id/reject', authorize('TECHNICIAN'), technicianController.rejectRequest);
router.patch('/jobs/:id/status', authorize('TECHNICIAN'), validate(require('../validators/request.validators').updateRequestStatusSchema), technicianController.updateJobStatus);

// ── Admin ──
router.get('/', authorize('ADMIN'), validate(technicianQuerySchema, 'query'), technicianController.getAll);
router.patch('/:id/verify', authorize('ADMIN'), technicianController.verify);

module.exports = router;
