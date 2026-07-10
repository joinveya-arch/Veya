import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AnyZodObject } from 'zod';
import asyncHandler from '../utils/asyncHandler';

/**
 * Reusable middleware to validate request body using Zod schemas.
 * Replaces the raw req.body with the successfully parsed and cast output.
 */
export const validateBody = (schema: AnyZodObject): RequestHandler => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    req.body = await schema.parseAsync(req.body);
    next();
  });
};

/**
 * Reusable middleware to validate request query parameters using Zod schemas.
 */
export const validateQuery = (schema: AnyZodObject): RequestHandler => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    req.query = await schema.parseAsync(req.query);
    next();
  });
};

/**
 * Reusable middleware to validate request URL parameters using Zod schemas.
 */
export const validateParams = (schema: AnyZodObject): RequestHandler => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    req.params = await schema.parseAsync(req.params);
    next();
  });
};
