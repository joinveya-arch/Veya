import { Router } from 'express';
import { Role } from '@prisma/client';
import serviceController from '../controllers/service.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createServiceSchema, updateServiceSchema } from '../validators/service.validator';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

/**
 * @route   POST /api/v1/services
 * @desc    Create a new service offering
 * @access  Private (ARTIST only)
 */
router.post(
  '/',
  authenticate,
  authorize(Role.ARTIST),
  validateBody(createServiceSchema),
  asyncHandler(serviceController.create)
);

/**
 * @route   GET /api/v1/services/artist/:artistId
 * @desc    List all services offered by a specific artist
 * @access  Public
 */
router.get('/artist/:artistId', asyncHandler(serviceController.getByArtistId));

/**
 * @route   GET /api/v1/services/:id
 * @desc    Get a single service by ID
 * @access  Public
 */
router.get('/:id', asyncHandler(serviceController.getById));

/**
 * @route   PUT /api/v1/services/:id
 * @desc    Update an owned service
 * @access  Private (ARTIST only)
 */
router.put(
  '/:id',
  authenticate,
  authorize(Role.ARTIST),
  validateBody(updateServiceSchema),
  asyncHandler(serviceController.update)
);

/**
 * @route   DELETE /api/v1/services/:id
 * @desc    Delete an owned service
 * @access  Private (ARTIST only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ARTIST),
  asyncHandler(serviceController.delete)
);

export default router;
