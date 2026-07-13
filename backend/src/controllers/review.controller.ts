import { Request, Response } from 'express';
import reviewService from '../services/review.service';
import { UnauthorizedError } from '../utils/customErrors';

export class ReviewController {
  /**
   * Submit a review for a completed booking (Protected: CUSTOMER role)
   */
  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }

    const review = await reviewService.addReview(
      req.user.id,
      req.body.bookingId,
      req.body.rating,
      req.body.comment
    );
    res.status(201).json({
      success: true,
      data: review,
    });
  };

  /**
   * List the reviews written about a specific artist (Public)
   */
  getArtistReviews = async (req: Request, res: Response): Promise<void> => {
    const reviews = await reviewService.getArtistReviews(req.params.artistId);
    res.status(200).json({
      success: true,
      data: reviews,
    });
  };
}

export const reviewController = new ReviewController();
export default reviewController;
