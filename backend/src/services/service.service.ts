import { z } from 'zod';
import { Prisma } from '@prisma/client';
import serviceRepository from '../repositories/service.repository';
import artistRepository from '../repositories/artist.repository';
import { createServiceSchema, updateServiceSchema } from '../validators/service.validator';
import { NotFoundError, ForbiddenError } from '../utils/customErrors';

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

export class ServiceService {
  /**
   * Resolve the artist profile owned by the logged-in user
   */
  private async getOwnArtistProfile(userId: string) {
    const artist = await artistRepository.findByUserId(userId);
    if (!artist) {
      throw new NotFoundError('Artist profile not found. Please create a profile first.');
    }
    return artist;
  }

  /**
   * Load a service and assert the logged-in user owns it
   */
  private async getOwnedService(userId: string, serviceId: string) {
    const artist = await this.getOwnArtistProfile(userId);

    const service = await serviceRepository.findById(serviceId);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    if (service.artistId !== artist.id) {
      throw new ForbiddenError('You do not have permission to modify this service');
    }
    return service;
  }

  /**
   * Create a new service offering for the logged-in artist
   */
  async createService(userId: string, input: CreateServiceInput) {
    const artist = await this.getOwnArtistProfile(userId);

    return serviceRepository.create(artist.id, {
      title: input.title,
      description: input.description ?? null,
      price: input.price,
      duration: input.duration,
    });
  }

  /**
   * Retrieve a single public service by its ID
   */
  async getServiceById(id: string) {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    return service;
  }

  /**
   * List all services offered by a specific artist profile
   */
  async getServicesByArtist(artistId: string) {
    const artist = await artistRepository.findById(artistId);
    if (!artist) {
      throw new NotFoundError('Artist profile not found');
    }
    return serviceRepository.findByArtistId(artistId);
  }

  /**
   * Update a service owned by the logged-in artist
   */
  async updateService(userId: string, id: string, input: UpdateServiceInput) {
    await this.getOwnedService(userId, id);

    const updateData: Prisma.ServiceUpdateInput = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description ?? null;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.duration !== undefined) updateData.duration = input.duration;

    return serviceRepository.update(id, updateData);
  }

  /**
   * Delete a service owned by the logged-in artist
   */
  async deleteService(userId: string, id: string) {
    await this.getOwnedService(userId, id);
    return serviceRepository.delete(id);
  }
}

export const serviceService = new ServiceService();
export default serviceService;
