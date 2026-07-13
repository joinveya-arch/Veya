import artistRepository from '../repositories/artist.repository';
import userRepository from '../repositories/user.repository';
import { createProfileSchema, updateProfileSchema } from '../validators/artist.validator';
import { z } from 'zod';
import { ConflictError, NotFoundError, UnauthorizedError } from '../utils/customErrors';
import { uploadMedia } from '../utils/cloudinary';
import { Role } from '@prisma/client';

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export class ArtistService {
  /**
   * Initialize a new artist profile for a registered user with Role.ARTIST
   */
  async createProfile(userId: string, input: CreateProfileInput) {
    // 1. Verify user exists and holds the ARTIST role
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User record not found');
    }
    if (user.role !== Role.ARTIST) {
      throw new UnauthorizedError('Only users registered with the ARTIST role can initialize a profile');
    }

    // 2. Check if a profile already exists
    const existingProfile = await artistRepository.findByUserId(userId);
    if (existingProfile) {
      throw new ConflictError('An artist profile already exists for this user');
    }

    // 3. Create and return the profile
    return artistRepository.create(userId, {
      bio: input.bio || null,
      city: input.city,
      experience: input.experience,
      instagram: input.instagram || null,
    });
  }

  /**
   * Retrieve the artist profile of a specific user ID
   */
  async getProfileByUserId(userId: string) {
    const profile = await artistRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Artist profile not found');
    }
    return profile;
  }

  /**
   * Update the logged-in artist's own profile attributes
   */
  async updateProfileByUserId(userId: string, input: UpdateProfileInput) {
    // 1. Retrieve profile to confirm existence
    const profile = await artistRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Artist profile not found');
    }

    // 2. Prepare updates (excluding immutable fields like verified, rating, reviewCount)
    const updateData: Parameters<typeof artistRepository.update>[1] = {};
    if (input.bio !== undefined) updateData.bio = input.bio || null;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.experience !== undefined) updateData.experience = input.experience;
    if (input.instagram !== undefined) updateData.instagram = input.instagram || null;

    // 3. Execute update
    return artistRepository.update(profile.id, updateData);
  }

  /**
   * Upload a new avatar for the logged-in artist and persist its URL
   */
  async updateProfileImage(userId: string, filePath: string) {
    const profile = await artistRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Artist profile not found');
    }

    const imageUrl = await uploadMedia(filePath, 'profiles');
    return artistRepository.update(profile.id, { profileImage: imageUrl });
  }

  /**
   * Upload a portfolio image for the logged-in artist and attach it to the profile
   */
  async addPortfolioImage(userId: string, filePath: string) {
    const profile = await artistRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Artist profile not found');
    }

    const imageUrl = await uploadMedia(filePath, 'portfolio');
    return artistRepository.createPortfolioImage(profile.id, imageUrl);
  }

  /**
   * List the portfolio images of a public artist profile
   */
  async getPortfolioImages(artistId: string) {
    const profile = await artistRepository.findById(artistId);
    if (!profile) {
      throw new NotFoundError('Artist profile not found');
    }
    return artistRepository.findPortfolioImages(artistId);
  }

  /**
   * Fetch a single public artist profile by its unique profile ID
   */
  async getPublicProfileById(id: string) {
    const profile = await artistRepository.findById(id);
    if (!profile) {
      throw new NotFoundError('Artist profile not found');
    }
    return profile;
  }

  /**
   * Search/List all public artist profiles according to filters
   */
  async listPublicProfiles(filters: { city?: string; minExperience?: number }) {
    return artistRepository.findAll(filters);
  }
}

export const artistService = new ArtistService();
export default artistService;
