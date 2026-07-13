import { Request, Response } from 'express';
import availabilityService from '../services/availability.service';
import { UnauthorizedError } from '../utils/customErrors';

export class AvailabilityController {
  /**
   * Publish availability slots for the logged-in artist (Protected: ARTIST role)
   */
  setAvailability = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }

    const result = await availabilityService.setAvailability(req.user.id, req.body.dates);
    res.status(200).json({
      success: true,
      message: `${result.count} availability slot(s) published`,
      data: result,
    });
  };

  /**
   * Remove availability slots for the logged-in artist (Protected: ARTIST role)
   */
  removeAvailability = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }

    const result = await availabilityService.removeAvailability(req.user.id, req.body.dates);
    res.status(200).json({
      success: true,
      message: `${result.count} availability slot(s) removed`,
      data: result,
    });
  };

  /**
   * List an artist's upcoming available slots (Public)
   */
  getAvailability = async (req: Request, res: Response): Promise<void> => {
    const slots = await availabilityService.getAvailability(req.params.artistId);
    res.status(200).json({
      success: true,
      data: slots,
    });
  };
}

export const availabilityController = new AvailabilityController();
export default availabilityController;
