import { Router } from 'express';
import { Role } from '@prisma/client';
import reviewController from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createReviewSchema } from '../validators/review.validator';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

/**
 * @route   POST /api/v1/reviews
 * @desc    Submit a review for a completed booking
 * @access  Private (CUSTOMER only)
 */
router.post(
  '/',
  authenticate,
  authorize(Role.CUSTOMER),
  validateBody(createReviewSchema),
  asyncHandler(reviewController.create)
);

export default router;
