import { Service, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export class ServiceRepository {
  /**
   * Create a new service offering linked to a specific artist profile ID
   */
  async create(
    artistId: string,
    data: Prisma.ServiceCreateWithoutArtistInput
  ): Promise<Service> {
    return prisma.service.create({
      data: {
        ...data,
        artist: {
          connect: { id: artistId },
        },
      },
    });
  }

  /**
   * Find a service by its unique ID, including the owning artist profile
   */
  async findById(id: string) {
    return prisma.service.findUnique({
      where: { id },
      include: {
        artist: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * List all services belonging to a specific artist profile
   */
  async findByArtistId(artistId: string): Promise<Service[]> {
    return prisma.service.findMany({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update a service record
   */
  async update(id: string, data: Prisma.ServiceUpdateInput): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a service record
   */
  async delete(id: string): Promise<Service> {
    return prisma.service.delete({
      where: { id },
    });
  }
}

export const serviceRepository = new ServiceRepository();
export default serviceRepository;
