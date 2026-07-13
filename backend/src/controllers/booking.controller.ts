import { Request, Response } from 'express';
import bookingService from '../services/booking.service';
import { UnauthorizedError } from '../utils/customErrors';

export class BookingController {
  /**
   * Reserve an artist timeslot (Protected: CUSTOMER role)
   */
  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }

    const booking = await bookingService.createBooking(
      req.user.id,
      req.body.serviceId,
      req.body.bookingDate
    );
    res.status(201).json({
      success: true,
      data: booking,
    });
  };

  /**
   * List the logged-in user's bookings (Protected: CUSTOMER or ARTIST role)
   */
  getMyBookings = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }

    const bookings = await bookingService.getMyBookings(req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      data: bookings,
    });
  };

  /**
   * Transition a booking's status (Protected: CUSTOMER or ARTIST role)
   */
  updateStatus = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }

    const booking = await bookingService.updateStatus(
      req.user.id,
      req.user.role,
      req.params.id,
      req.body.status
    );
    res.status(200).json({
      success: true,
      data: booking,
    });
  };
}

export const bookingController = new BookingController();
export default bookingController;
