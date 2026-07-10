import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { UnauthorizedError } from '../utils/customErrors';

export class AuthController {
  /**
   * Handle user registration requests
   */
  register = async (req: Request, res: Response): Promise<void> => {
    const user = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: user,
    });
  };

  /**
   * Handle user login requests
   */
  login = async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  };

  /**
   * Handle requests to fetch the current authenticated user's profile
   */
  me = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }

    const user = await authService.getCurrentUser(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  };
}

export const authController = new AuthController();
export default authController;
