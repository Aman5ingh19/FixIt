const cloudinary = require('../config/cloudinary');
const { ExternalServiceError } = require('../utils/errors');
const logger = require('../config/logger');

const uploadService = {
  /**
   * Upload a single image buffer to Cloudinary.
   * @param {Buffer} buffer - Image buffer from multer
   * @param {string} folder - Cloudinary folder (e.g., 'requests', 'profiles')
   * @returns {{ imageUrl: string, publicId: string }}
   */
  async uploadImage(buffer, folder = 'fixit') {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `fixit/${folder}`,
            resource_type: 'image',
            transformation: [
              { quality: 'auto', fetch_format: 'auto' },
              { width: 1200, crop: 'limit' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      return {
        imageUrl: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      logger.error('Cloudinary upload failed', { error: error.message });
      throw new ExternalServiceError('Cloudinary', 'Failed to upload image');
    }
  },

  /**
   * Upload multiple image buffers.
   */
  async uploadMultiple(files, folder = 'fixit') {
    const results = await Promise.all(
      files.map((file) => this.uploadImage(file.buffer, folder))
    );
    return results;
  },

  /**
   * Delete an image from Cloudinary by public_id.
   */
  async deleteImage(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
      logger.info('Image deleted from Cloudinary', { publicId });
    } catch (error) {
      logger.error('Cloudinary delete failed', { publicId, error: error.message });
    }
  },
};

module.exports = uploadService;
