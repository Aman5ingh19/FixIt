const { z } = require('zod');

const createPaymentSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  amount: z.number().positive('Amount must be greater than 0'),
  method: z.string().optional(),
});

const updatePaymentStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED'], {
    errorMap: () => ({ message: 'Status must be PENDING, PAID, FAILED, or REFUNDED' }),
  }),
  method: z.string().optional(),
  transactionId: z.string().optional(),
  reason: z.string().optional(),
});

const paymentQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  requestId: z.string().optional(),
});

module.exports = {
  createPaymentSchema,
  updatePaymentStatusSchema,
  paymentQuerySchema,
};
