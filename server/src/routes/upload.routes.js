const { Router } = require('express');
const uploadController = require('../controllers/upload.controller');
const upload = require('../config/multer');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

// Upload up to 5 images
router.post('/images', upload.array('images', 5), uploadController.uploadImages);

// Delete an image
router.delete('/:publicId', uploadController.deleteImage);

module.exports = router;
