import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MulterError } from 'multer';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/customErrors';
import logger from '../utils/logger';
import config from '../config';

/**
 * Global centralized error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: unknown[] = [];

  // Log the error
  logger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  } 
  // Handle Zod Validation Errors
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  }
  // Handle Multer upload errors (oversized files, unexpected form fields)
  else if (err instanceof MulterError) {
    statusCode = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image exceeds the maximum allowed size of 5MB'
        : `File upload failed: ${err.message}`;
  }
  // Handle Prisma Database Errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        statusCode = 409;
        const target = (err.meta?.target as string[]) || [];
        message = `Duplicate field value: ${target.join(', ')}`;
        break;
      case 'P2025': // Record not found
        statusCode = 404;
        message = err.meta?.cause as string || 'Record not found';
        break;
      case 'P2003': // Foreign key constraint violation
        statusCode = 400;
        message = 'Invalid reference. Foreign key constraint failed.';
        break;
      default:
        statusCode = 400;
        message = 'Database operation failed';
    }
  }

  // Build the final response payload
  const responsePayload: {
    success: boolean;
    message: string;
    errors?: unknown[];
    stack?: string;
  } = {
    success: false,
    message,
  };

  if (errors.length > 0) {
    responsePayload.errors = errors;
  }

  // Include stack trace only in non-production environments
  if (config.NODE_ENV !== 'production') {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};

/**
 * 404 Route Not Found middleware handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.method} ${req.originalUrl} on this server`,
  });
};
