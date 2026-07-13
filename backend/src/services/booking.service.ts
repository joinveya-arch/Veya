import { AvailabilityStatus, BookingStatus, Role } from '@prisma/client';
import prisma from '../lib/prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/customErrors';

/**
 * Terminal states can never be transitioned out of.
 */
const TERMINAL_STATUSES: BookingStatus[] = [BookingStatus.CANCELLED, BookingStatus.COMPLETED];

export type UpdatableBookingStatus =
  | typeof BookingStatus.CONFIRMED
  | typeof BookingStatus.CANCELLED
  | typeof BookingStatus.COMPLETED;

export class BookingService {
  /**
   * Reserve an artist's timeslot for a service.
   *
   * The slot is claimed with a conditional updateMany guarded on
   * `status: AVAILABLE`, so concurrent requests for the same slot race on a
   * single row-level lock and exactly one of them wins.
   */
  async createBooking(customerId: string, serviceId: string, bookingDateStr: string) {
    const bookingDate = new Date(bookingDateStr);

    if (bookingDate <= new Date()) {
      throw new BadRequestError('Bookings must be made for a future timeslot');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Resolve the service and its owning artist
      const service = await tx.service.findUnique({
        where: { id: serviceId },
      });
      if (!service) {
        throw new NotFoundError('Service not found');
      }

      // 2. Atomically claim the slot: only an AVAILABLE row is flipped
      const claimed = await tx.availability.updateMany({
        where: {
          artistId: service.artistId,
          date: bookingDate,
          status: AvailabilityStatus.AVAILABLE,
        },
        data: { status: AvailabilityStatus.UNAVAILABLE },
      });

      if (claimed.count === 0) {
        throw new BadRequestError('The requested timeslot is not available');
      }

      // 3. Record the booking against the now-claimed slot
      return tx.booking.create({
        data: {
          customerId,
          artistId: service.artistId,
          serviceId,
          bookingDate,
          bookingStatus: BookingStatus.PENDING,
        },
        include: {
          service: true,
          artist: {
            include: {
              user: { select: { name: true, email: true, phone: true } },
            },
          },
        },
      });
    });
  }

  /**
   * List the bookings of the logged-in user, from either side of the transaction
   */
  async getMyBookings(userId: string, role: Role) {
    if (role === Role.ARTIST) {
      const artist = await prisma.artistProfile.findUnique({ where: { userId } });
      if (!artist) {
        throw new NotFoundError('Artist profile not found');
      }

      return prisma.booking.findMany({
        where: { artistId: artist.id },
        include: {
          service: true,
          customer: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { bookingDate: 'desc' },
      });
    }

    return prisma.booking.findMany({
      where: { customerId: userId },
      include: {
        service: true,
        artist: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
      orderBy: { bookingDate: 'desc' },
    });
  }

  /**
   * Transition a booking's status, enforcing ownership and legal transitions.
   * Cancelling releases the reserved timeslot back to the artist's calendar.
   */
  async updateStatus(
    userId: string,
    role: Role,
    bookingId: string,
    status: UpdatableBookingStatus
  ) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });
      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      // 1. Ownership checks
      if (role === Role.CUSTOMER) {
        if (booking.customerId !== userId) {
          throw new ForbiddenError('You do not have permission to modify this booking');
        }
        if (status !== BookingStatus.CANCELLED) {
          throw new BadRequestError('Customers can only cancel bookings');
        }
      } else if (role === Role.ARTIST) {
        const artist = await tx.artistProfile.findUnique({ where: { userId } });
        if (!artist || booking.artistId !== artist.id) {
          throw new ForbiddenError('You do not have permission to modify this booking');
        }
      }

      // 2. Transition checks
      if (TERMINAL_STATUSES.includes(booking.bookingStatus)) {
        throw new BadRequestError(
          `A ${booking.bookingStatus.toLowerCase()} booking can no longer be updated`
        );
      }
      if (status === BookingStatus.CONFIRMED && booking.bookingStatus !== BookingStatus.PENDING) {
        throw new BadRequestError('Only pending bookings can be confirmed');
      }
      if (status === BookingStatus.COMPLETED && booking.bookingStatus !== BookingStatus.CONFIRMED) {
        throw new BadRequestError('Only confirmed bookings can be marked completed');
      }

      // 3. Cancelling frees the reserved slot for other customers
      if (status === BookingStatus.CANCELLED) {
        await tx.availability.updateMany({
          where: { artistId: booking.artistId, date: booking.bookingDate },
          data: { status: AvailabilityStatus.AVAILABLE },
        });
      }

      return tx.booking.update({
        where: { id: bookingId },
        data: { bookingStatus: status },
        include: {
          service: true,
          artist: {
            include: {
              user: { select: { name: true, email: true, phone: true } },
            },
          },
        },
      });
    });
  }
}

export const bookingService = new BookingService();
export default bookingService;
