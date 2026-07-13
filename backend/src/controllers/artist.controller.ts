import { Request, Response } from 'express';
import artistService from '../services/artist.service';
import { BadRequestError, UnauthorizedError } from '../utils/customErrors';

export class ArtistController {
  /**
   * Create own artist profile (Protected: ARTIST role)
   */
  createOwnProfile = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }

    const profile = await artistService.createProfile(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: profile,
    });
  };

  /**
   * Get logged-in artist's own profile details (Protected: ARTIST role)
   */
  getOwnProfile = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }

    const profile = await artistService.getProfileByUserId(req.user.id);
    res.status(200).json({
      success: true,
      data: profile,
    });
  };

  /**
   * Update logged-in artist's own profile details (Protected: ARTIST role)
   */
  updateOwnProfile = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }

    const profile = await artistService.updateProfileByUserId(req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: profile,
    });
  };

  /**
   * Upload/replace the logged-in artist's profile image (Protected: ARTIST role)
   */
  uploadProfileImage = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }
    if (!req.file) {
      throw new BadRequestError('No image file was uploaded');
    }

    const profile = await artistService.updateProfileImage(req.user.id, req.file.path);
    res.status(200).json({
      success: true,
      data: profile,
    });
  };

  /**
   * Add an image to the logged-in artist's portfolio (Protected: ARTIST role)
   */
  addPortfolioImage = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }
    if (!req.file) {
      throw new BadRequestError('No image file was uploaded');
    }

    const portfolioImage = await artistService.addPortfolioImage(req.user.id, req.file.path);
    res.status(201).json({
      success: true,
      data: portfolioImage,
    });
  };

  /**
   * List the portfolio images of a specific artist (Public)
   */
  getPortfolioImages = async (req: Request, res: Response): Promise<void> => {
    const images = await artistService.getPortfolioImages(req.params.artistId);
    res.status(200).json({
      success: true,
      data: images,
    });
  };

  /**
   * Retrieve a specific public artist profile by ID (Public)
   */
  getPublicProfile = async (req: Request, res: Response): Promise<void> => {
    const profile = await artistService.getPublicProfileById(req.params.id);
    res.status(200).json({
      success: true,
      data: profile,
    });
  };

  /**
   * Search and list all public artist profiles (Public)
   */
  listPublicProfiles = async (req: Request, res: Response): Promise<void> => {
    // Parse query parameters after validation
    const city = req.query.city as string | undefined;
    const minExperience = req.query.minExperience
      ? Number(req.query.minExperience)
      : undefined;

    const profiles = await artistService.listPublicProfiles({ city, minExperience });
    res.status(200).json({
      success: true,
      data: profiles,
    });
  };
}

export const artistController = new ArtistController();
export default artistController;
