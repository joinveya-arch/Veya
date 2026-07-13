import { Router } from 'express';
import { Role } from '@prisma/client';
import bookingController from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createBookingSchema, updateBookingStatusSchema } from '../validators/booking.validator';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

/**
 * @route   POST /api/v1/bookings
 * @desc    Reserve an artist timeslot for a service
 * @access  Private (CUSTOMER only)
 */
router.post(
  '/',
  authenticate,
  authorize(Role.CUSTOMER),
  validateBody(createBookingSchema),
  asyncHandler(bookingController.create)
);

/**
 * @route   GET /api/v1/bookings/me
 * @desc    List the logged-in user's bookings (customer- or artist-side)
 * @access  Private (CUSTOMER or ARTIST)
 */
router.get(
  '/me',
  authenticate,
  authorize(Role.CUSTOMER, Role.ARTIST),
  asyncHandler(bookingController.getMyBookings)
);

/**
 * @route   PATCH /api/v1/bookings/:id/status
 * @desc    Confirm, complete or cancel a booking
 * @access  Private (CUSTOMER or ARTIST)
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize(Role.CUSTOMER, Role.ARTIST),
  validateBody(updateBookingStatusSchema),
  asyncHandler(bookingController.updateStatus)
);

export default router;
