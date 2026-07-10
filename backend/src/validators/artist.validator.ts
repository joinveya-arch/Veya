import { z } from 'zod';

/**
 * Zod validation schema for creating an artist profile
 */
export const createProfileSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(1000, 'Bio must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string({ required_error: 'City is required' })
    .trim()
    .min(2, 'City name must be at least 2 characters long'),
  experience: z
    .number({ required_error: 'Experience (in years) is required' })
    .int('Experience must be a whole number')
    .min(0, 'Experience cannot be a negative value'),
  instagram: z
    .string()
    .trim()
    .regex(/^@?[a-zA-Z0-9._]{1,30}$/, 'Invalid Instagram handle format')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
});

/**
 * Zod validation schema for updating an artist profile (all fields optional)
 */
export const updateProfileSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(1000, 'Bio must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .trim()
    .min(2, 'City name must be at least 2 characters long')
    .optional(),
  experience: z
    .number()
    .int('Experience must be a whole number')
    .min(0, 'Experience cannot be a negative value')
    .optional(),
  instagram: z
    .string()
    .trim()
    .regex(/^@?[a-zA-Z0-9._]{1,30}$/, 'Invalid Instagram handle format')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
});

/**
 * Zod validation schema for querying/searching public artist profiles
 */
export const queryArtistsSchema = z.object({
  city: z.string().trim().optional(),
  minExperience: z
    .preprocess((val) => (val !== undefined ? Number(val) : undefined), z.number().int().min(0))
    .optional(),
});
