const cloudinary = require('cloudinary').v2;
const config = require('./index');
const logger = require('./logger');

// Only configure if credentials are provided
if (config.cloudinary.cloudName) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
  logger.info('✓ Cloudinary configured');
} else {
  logger.warn('⚠ Cloudinary not configured — file uploads will fail');
}

module.exports = cloudinary;
