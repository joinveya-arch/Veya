import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps asynchronous Express route handlers to catch unresolved promises
 * and pass them to the next() error handler middleware.
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
