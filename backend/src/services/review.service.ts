import { BookingStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import artistRepository from '../repositories/artist.repository';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
} from '../utils/customErrors';

export class ReviewService {
  /**
   * Submit a review for a completed booking and refresh the artist's aggregate rating
   */
  async addReview(customerId: string, bookingId: string, rating: number, comment?: string) {
    return prisma.$transaction(async (tx) => {
      // 1. The booking must exist, belong to the reviewer, and be completed
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new NotFoundError('Booking record not found');
      }
      if (booking.customerId !== customerId) {
        throw new ForbiddenError('You can only review bookings that you requested');
      }
      if (booking.bookingStatus !== BookingStatus.COMPLETED) {
        throw new BadRequestError('Reviews can only be written for completed services');
      }

      // 2. One review per booking
      const existingReview = await tx.review.findUnique({
        where: { bookingId },
      });
      if (existingReview) {
        throw new ConflictError('You have already submitted a review for this booking');
      }

      // 3. Record the review
      const review = await tx.review.create({
        data: {
          bookingId,
          customerId,
          artistId: booking.artistId,
          rating,
          comment: comment ?? null,
        },
      });

      // 4. Recompute the artist's denormalised rating aggregates
      const aggregate = await tx.review.aggregate({
        where: { artistId: booking.artistId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.artistProfile.update({
        where: { id: booking.artistId },
        data: {
          rating: aggregate._avg.rating ?? 0,
          reviewCount: aggregate._count.rating,
        },
      });

      return review;
    });
  }

  /**
   * List the reviews written about a specific artist
   */
  async getArtistReviews(artistId: string) {
    const artist = await artistRepository.findById(artistId);
    if (!artist) {
      throw new NotFoundError('Artist profile not found');
    }

    return prisma.review.findMany({
      where: { artistId },
      include: {
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const reviewService = new ReviewService();
export default reviewService;
