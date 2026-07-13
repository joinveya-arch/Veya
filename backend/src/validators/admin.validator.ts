import { z } from 'zod';

/**
 * Zod validation schema for toggling an artist's verification badge
 */
export const verifyArtistSchema = z.object({
  verified: z.boolean({
    required_error: 'The "verified" flag is required',
    invalid_type_error: 'The "verified" flag must be a boolean',
  }),
});
