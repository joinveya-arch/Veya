import { Router } from 'express';
import { Role } from '@prisma/client';
import artistController from '../controllers/artist.controller';
import availabilityController from '../controllers/availability.controller';
import reviewController from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { createProfileSchema, updateProfileSchema, queryArtistsSchema } from '../validators/artist.validator';
import { setAvailabilitySchema, removeAvailabilitySchema } from '../validators/availability.validator';
import { fileUpload } from '../utils/uploader';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

/**
 * @route   POST /api/v1/artists/profile
 * @desc    Initialize own artist profile
 * @access  Private (ARTIST only)
 */
router.post(
  '/profile',
  authenticate,
  authorize(Role.ARTIST),
  validateBody(createProfileSchema),
  asyncHandler(artistController.createOwnProfile)
);

/**
 * @route   GET /api/v1/artists/profile/me
 * @desc    Get logged-in artist's own profile details
 * @access  Private (ARTIST only)
 */
router.get(
  '/profile/me',
  authenticate,
  authorize(Role.ARTIST),
  asyncHandler(artistController.getOwnProfile)
);

/**
 * @route   PUT /api/v1/artists/profile
 * @desc    Update own artist profile attributes
 * @access  Private (ARTIST only)
 */
router.put(
  '/profile',
  authenticate,
  authorize(Role.ARTIST),
  validateBody(updateProfileSchema),
  asyncHandler(artistController.updateOwnProfile)
);

/**
 * @route   POST /api/v1/artists/profile/image
 * @desc    Upload/replace own profile image (multipart field: "image")
 * @access  Private (ARTIST only)
 */
router.post(
  '/profile/image',
  authenticate,
  authorize(Role.ARTIST),
  fileUpload.single('image'),
  asyncHandler(artistController.uploadProfileImage)
);

/**
 * @route   POST /api/v1/artists/portfolio
 * @desc    Add an image to own portfolio (multipart field: "image")
 * @access  Private (ARTIST only)
 */
router.post(
  '/portfolio',
  authenticate,
  authorize(Role.ARTIST),
  fileUpload.single('image'),
  asyncHandler(artistController.addPortfolioImage)
);

/**
 * @route   POST /api/v1/artists/availability
 * @desc    Publish future availability slots
 * @access  Private (ARTIST only)
 */
router.post(
  '/availability',
  authenticate,
  authorize(Role.ARTIST),
  validateBody(setAvailabilitySchema),
  asyncHandler(availabilityController.setAvailability)
);

/**
 * @route   DELETE /api/v1/artists/availability
 * @desc    Remove availability slots that hold no active bookings
 * @access  Private (ARTIST only)
 */
router.delete(
  '/availability',
  authenticate,
  authorize(Role.ARTIST),
  validateBody(removeAvailabilitySchema),
  asyncHandler(availabilityController.removeAvailability)
);

/**
 * @route   GET /api/v1/artists
 * @desc    List and search public artist profiles with filters
 * @access  Public
 */
router.get(
  '/',
  validateQuery(queryArtistsSchema),
  asyncHandler(artistController.listPublicProfiles)
);

/**
 * @route   GET /api/v1/artists/:artistId/availability
 * @desc    List an artist's upcoming available slots
 * @access  Public
 */
router.get('/:artistId/availability', asyncHandler(availabilityController.getAvailability));

/**
 * @route   GET /api/v1/artists/:artistId/portfolio
 * @desc    List an artist's portfolio images
 * @access  Public
 */
router.get('/:artistId/portfolio', asyncHandler(artistController.getPortfolioImages));

/**
 * @route   GET /api/v1/artists/:artistId/reviews
 * @desc    List the reviews written about an artist
 * @access  Public
 */
router.get('/:artistId/reviews', asyncHandler(reviewController.getArtistReviews));

/**
 * @route   GET /api/v1/artists/:id
 * @desc    Get specific public artist profile by ID
 * @access  Public
 */
router.get('/:id', asyncHandler(artistController.getPublicProfile));

export default router;
