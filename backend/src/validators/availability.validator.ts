import { z } from 'zod';

/**
 * Zod validation schema for setting (or clearing) artist availability slots
 */
export const setAvailabilitySchema = z.object({
  dates: z
    .array(
      z.string().datetime({
        message: 'Each availability date must be a valid ISO DateTime string',
      })
    )
    .min(1, 'At least one date is required'),
});

/**
 * Removing availability takes the same payload shape as setting it
 */
export const removeAvailabilitySchema = setAvailabilitySchema;
