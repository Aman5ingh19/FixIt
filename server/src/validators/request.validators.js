const { z } = require('zod');

const createRequestSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200).trim(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000).trim(),
  priority: z.number().int().min(0).max(2).optional().default(0),
  scheduledAt: z.string().datetime().optional(),
  location: z.object({
    address: z.string().min(5, 'Address is required').max(500).trim(),
    city: z.string().min(1, 'City is required').max(100).trim(),
    state: z.string().min(1, 'State is required').max(100).trim(),
    zipCode: z.string().min(4, 'Zip code is required').max(10).trim(),
    country: z.string().max(100).optional().default('India'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  imageUrls: z.array(z.object({
    imageUrl: z.string().url(),
    publicId: z.string().optional(),
    caption: z.string().max(200).optional(),
  })).max(5, 'Maximum 5 images allowed').optional(),
});

const updateRequestStatusSchema = z.object({
  status: z.enum([
    'PENDING', 'MATCHING', 'ASSIGNED', 'ACCEPTED',
    'IN_PROGRESS', 'COMPLETED', 'CANCELLED',
  ]),
});

const cancelRequestSchema = z.object({
  cancelReason: z.string().min(1, 'Cancel reason is required').max(500).trim(),
});

const requestQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum([
    'PENDING', 'MATCHING', 'ASSIGNED', 'ACCEPTED',
    'IN_PROGRESS', 'COMPLETED', 'CANCELLED',
  ]).optional(),
  serviceId: z.string().uuid().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

module.exports = {
  createRequestSchema,
  updateRequestStatusSchema,
  cancelRequestSchema,
  requestQuerySchema,
};
