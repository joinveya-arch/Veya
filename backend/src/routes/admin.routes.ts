import { Router, Request, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { verifyArtistSchema } from '../validators/admin.validator';
import { NotFoundError } from '../utils/customErrors';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

// Every route below is ADMIN-only
router.use(authenticate, authorize(Role.ADMIN));

/**
 * @route   PATCH /api/v1/admin/artists/:id/verify
 * @desc    Set the verification status of an artist profile
 * @access  Private (ADMIN only)
 */
router.patch(
  '/artists/:id/verify',
  validateBody(verifyArtistSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const profile = await prisma.artistProfile.findUnique({
      where: { id: req.params.id },
    });
    if (!profile) {
      throw new NotFoundError('Artist profile not found');
    }

    const updated = await prisma.artistProfile.update({
      where: { id: req.params.id },
      data: { verified: req.body.verified },
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  })
);

/**
 * @route   GET /api/v1/admin/bookings
 * @desc    List every booking on the platform
 * @access  Private (ADMIN only)
 */
router.get(
  '/bookings',
  asyncHandler(async (_req: Request, res: Response) => {
    const bookings = await prisma.booking.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        artist: { select: { id: true, city: true } },
        service: true,
      },
      orderBy: { bookingDate: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  })
);

export default router;
