const multer = require('multer');
const { AppError } = require('../utils/errors');

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp', '.heic', '.heif', '.tiff', '.ico'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isImageMime = file.mimetype.startsWith('image/');
  const isAllowedExt = ALLOWED_EXTENSIONS.some((ext) => (file.originalname || '').toLowerCase().endsWith(ext));

  if (isImageMime || isAllowedExt) {
    cb(null, true);
  } else {
    cb(new AppError('Supported formats: JPG, PNG, WebP, GIF, SVG, BMP, HEIC, TIFF, ICO', 400, 'INVALID_FILE_TYPE'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
});

module.exports = upload;
