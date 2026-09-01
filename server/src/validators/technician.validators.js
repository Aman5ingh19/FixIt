const { z } = require('zod');

const createTechnicianProfileSchema = z.object({
  bio: z.string().max(1000).optional(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  services: z.array(z.object({
    serviceId: z.string().uuid(),
    hourlyRate: z.number().positive().optional(),
  })).min(1, 'Select at least one service'),
  serviceAreas: z.array(z.object({
    city: z.string().min(1).max(100).trim(),
    state: z.string().min(1).max(100).trim(),
    zipCode: z.string().max(10).optional(),
  })).min(1, 'Add at least one service area'),
});

const updateTechnicianProfileSchema = z.object({
  bio: z.string().max(1000).optional().nullable().or(z.literal('')),
  experienceYears: z.coerce.number().int().min(0).max(50).optional(),
});

const updateAvailabilitySchema = z.object({
  availability: z.enum(['ONLINE', 'OFFLINE', 'BUSY']),
});

const technicianQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  serviceId: z.string().uuid().optional(),
  city: z.string().optional(),
  availability: z.enum(['ONLINE', 'OFFLINE', 'BUSY']).optional(),
  verificationStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  sortBy: z.enum(['averageRating', 'totalJobsCompleted', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

module.exports = {
  createTechnicianProfileSchema,
  updateTechnicianProfileSchema,
  updateAvailabilitySchema,
  technicianQuerySchema,
};
