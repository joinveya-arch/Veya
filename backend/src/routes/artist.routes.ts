import { Router } from 'express';
import { Role } from '@prisma/client';
import artistController from '../controllers/artist.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { createProfileSchema, updateProfileSchema, queryArtistsSchema } from '../validators/artist.validator';
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
 * @route   GET /api/v1/artists/:id
 * @desc    Get specific public artist profile by ID
 * @access  Public
 */
router.get('/:id', asyncHandler(artistController.getPublicProfile));

export default router;
