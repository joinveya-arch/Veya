import { ArtistProfile, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export class ArtistRepository {
  /**
   * Create a new artist profile linked to a specific user ID
   */
  async create(
    userId: string,
    data: Prisma.ArtistProfileCreateWithoutUserInput
  ): Promise<ArtistProfile> {
    return prisma.artistProfile.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Find an artist profile by user ID
   */
  async findByUserId(userId: string) {
    return prisma.artistProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Find an artist profile by its profile ID
   */
  async findById(id: string) {
    return prisma.artistProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Update an artist profile record
   */
  async update(id: string, data: Prisma.ArtistProfileUpdateInput): Promise<ArtistProfile> {
    return prisma.artistProfile.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Attach a portfolio image to an artist profile
   */
  async createPortfolioImage(artistId: string, imageUrl: string) {
    return prisma.portfolioImage.create({
      data: { artistId, imageUrl },
    });
  }

  /**
   * List the portfolio images belonging to an artist profile
   */
  async findPortfolioImages(artistId: string) {
    return prisma.portfolioImage.findMany({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Fetch all artist profiles based on optional query search filters (city, experience)
   */
  async findAll(filters: { city?: string; minExperience?: number }) {
    const whereClause: Prisma.ArtistProfileWhereInput = {};

    if (filters.city) {
      // Case-insensitive city check
      whereClause.city = {
        equals: filters.city,
        mode: 'insensitive',
      };
    }

    if (filters.minExperience !== undefined) {
      whereClause.experience = {
        gte: filters.minExperience,
      };
    }

    return prisma.artistProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        rating: 'desc', // Default sorting by rating (best first)
      },
    });
  }
}

export const artistRepository = new ArtistRepository();
export default artistRepository;
