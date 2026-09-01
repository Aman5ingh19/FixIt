const { z } = require('zod');

const createServiceCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim(),
  description: z.string().max(500).optional(),
  iconName: z.string().max(50).optional(),
});

const updateServiceCategorySchema = createServiceCategorySchema.partial();

const createServiceSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  name: z.string().min(1, 'Name is required').max(100).trim(),
  description: z.string().max(1000).optional(),
  basePrice: z.number().positive('Price must be positive').optional(),
  imageUrl: z.string().url().optional(),
});

const updateServiceSchema = createServiceSchema.partial();

const serviceQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  sortBy: z.enum(['name', 'basePrice', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

module.exports = {
  createServiceCategorySchema,
  updateServiceCategorySchema,
  createServiceSchema,
  updateServiceSchema,
  serviceQuerySchema,
};
