import { Request, Response } from 'express';
import serviceService from '../services/service.service';
import { UnauthorizedError } from '../utils/customErrors';

export class ServiceController {
  /**
   * Create a new service offering (Protected: ARTIST role)
   */
  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }

    const service = await serviceService.createService(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: service,
    });
  };

  /**
   * Retrieve a single service by ID (Public)
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    const service = await serviceService.getServiceById(req.params.id);
    res.status(200).json({
      success: true,
      data: service,
    });
  };

  /**
   * List all services offered by a specific artist (Public)
   */
  getByArtistId = async (req: Request, res: Response): Promise<void> => {
    const services = await serviceService.getServicesByArtist(req.params.artistId);
    res.status(200).json({
      success: true,
      data: services,
    });
  };

  /**
   * Update an owned service (Protected: ARTIST role)
   */
  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }

    const service = await serviceService.updateService(req.user.id, req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: service,
    });
  };

  /**
   * Delete an owned service (Protected: ARTIST role)
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }

    await serviceService.deleteService(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  };
}

export const serviceController = new ServiceController();
export default serviceController;
