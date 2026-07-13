import { z } from 'zod';

/**
 * Zod validation schema for submitting a review against a completed booking
 */
export const createReviewSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID format'),
  rating: z
    .number({ required_error: 'Rating is required' })
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5'),
  comment: z
    .string()
    .trim()
    .max(1000, 'Comment must not exceed 1000 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
});
