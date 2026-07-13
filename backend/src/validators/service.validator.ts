import { z } from 'zod';

/**
 * Zod validation schema for creating an artist service offering
 */
export const createServiceSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  price: z
    .number({ required_error: 'Price is required' })
    .positive('Price must be greater than 0'),
  duration: z
    .number({ required_error: 'Duration is required' })
    .int('Duration must be a whole number of minutes')
    .positive('Duration must be a positive integer in minutes'),
});

/**
 * Zod validation schema for updating a service (all fields optional)
 */
export const updateServiceSchema = createServiceSchema.partial();
