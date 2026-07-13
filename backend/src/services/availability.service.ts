import { AvailabilityStatus, BookingStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import artistRepository from '../repositories/artist.repository';
import { NotFoundError, BadRequestError } from '../utils/customErrors';

/**
 * Parse ISO date strings into Date objects, removing duplicates so a single
 * payload never tries to upsert the same (artistId, date) key twice.
 */
const parseUniqueDates = (dates: string[]): Date[] => {
  const unique = new Map<number, Date>();

  for (const value of dates) {
    const parsed = new Date(value);
    unique.set(parsed.getTime(), parsed);
  }

  return [...unique.values()];
};

export class AvailabilityService {
  /**
   * Declare one or more future slots as AVAILABLE for the logged-in artist
   */
  async setAvailability(userId: string, dates: string[]) {
    const artist = await artistRepository.findByUserId(userId);
    if (!artist) {
      throw new NotFoundError('Artist profile not found');
    }

    const now = new Date();
    const parsedDates = parseUniqueDates(dates);

    if (parsedDates.some((date) => date <= now)) {
      throw new BadRequestError('Availability slots must be set in the future');
    }

    await prisma.$transaction(
      parsedDates.map((date) =>
        prisma.availability.upsert({
          where: { artistId_date: { artistId: artist.id, date } },
          create: {
            artistId: artist.id,
            date,
            status: AvailabilityStatus.AVAILABLE,
          },
          update: { status: AvailabilityStatus.AVAILABLE },
        })
      )
    );

    return { count: parsedDates.length };
  }

  /**
   * Remove slots for the logged-in artist, refusing any that hold active bookings
   */
  async removeAvailability(userId: string, dates: string[]) {
    const artist = await artistRepository.findByUserId(userId);
    if (!artist) {
      throw new NotFoundError('Artist profile not found');
    }

    const parsedDates = parseUniqueDates(dates);

    const activeBookings = await prisma.booking.findMany({
      where: {
        artistId: artist.id,
        bookingDate: { in: parsedDates },
        bookingStatus: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
    });

    if (activeBookings.length > 0) {
      throw new BadRequestError('Cannot remove availability slots containing active bookings');
    }

    const result = await prisma.availability.deleteMany({
      where: {
        artistId: artist.id,
        date: { in: parsedDates },
      },
    });

    return { count: result.count };
  }

  /**
   * List an artist's upcoming, still-bookable slots
   */
  async getAvailability(artistId: string) {
    const artist = await artistRepository.findById(artistId);
    if (!artist) {
      throw new NotFoundError('Artist profile not found');
    }

    return prisma.availability.findMany({
      where: {
        artistId,
        date: { gte: new Date() },
        status: AvailabilityStatus.AVAILABLE,
      },
      orderBy: { date: 'asc' },
    });
  }
}

export const availabilityService = new AvailabilityService();
export default availabilityService;
