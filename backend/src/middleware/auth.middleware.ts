import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import config from '../config';
import { UnauthorizedError, ForbiddenError } from '../utils/customErrors';
import asyncHandler from '../utils/asyncHandler';

interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

/**
 * Middleware to authenticate requests using JWT tokens in the Authorization header.
 * Attaches the verified user payload { id, email, role } to req.user.
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      
      next();
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
);

/**
 * Middleware to enforce role-based access controls on protected endpoints.
 * @param allowedRoles List of roles permitted to access the endpoint.
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have access permissions for this resource');
    }

    next();
  };
};
