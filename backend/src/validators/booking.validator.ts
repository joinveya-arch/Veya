import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

/**
 * Zod validation schema for creating a booking
 */
export const createBookingSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID format'),
  bookingDate: z.string().datetime({
    message: 'Booking date must be a valid ISO DateTime string',
  }),
});

/**
 * Zod validation schema for transitioning a booking's status.
 * PENDING is omitted: it is the creation state, not a transition target.
 */
export const updateBookingStatusSchema = z.object({
  status: z.enum([BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.COMPLETED], {
    errorMap: () => ({ message: 'Status must be one of CONFIRMED, CANCELLED or COMPLETED' }),
  }),
});
