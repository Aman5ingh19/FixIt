const { z } = require('zod');

const createReviewSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000).optional(),
});

const reviewQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  sortBy: z.enum(['createdAt', 'rating']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

module.exports = { createReviewSchema, reviewQuerySchema };
