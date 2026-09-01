const uploadService = require('../services/upload.service');
const { successResponse } = require('../utils/response');
const { ValidationError } = require('../utils/errors');

const uploadController = {
  /**
   * POST /api/uploads/images
   * Upload one or more images to Cloudinary.
   */
  async uploadImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        throw new ValidationError('No files uploaded');
      }

      const folder = req.query.folder || 'requests';
      const results = await uploadService.uploadMultiple(req.files, folder);

      successResponse(res, { images: results }, 'Images uploaded successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/uploads/:publicId
   * Delete an image from Cloudinary.
   */
  async deleteImage(req, res, next) {
    try {
      const publicId = decodeURIComponent(req.params.publicId);
      await uploadService.deleteImage(publicId);
      successResponse(res, null, 'Image deleted');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = uploadController;
