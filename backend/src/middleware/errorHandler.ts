import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the unhandled error structure for monitoring tools (like GCP Error Reporting)
  console.error('Error handled globally:', {
    message: err.message,
    stack: err.stack,
    status: err.status || 500,
  });

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
