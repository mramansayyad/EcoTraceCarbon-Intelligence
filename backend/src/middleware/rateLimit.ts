import rateLimit from 'express-rate-limit';
import { AuthenticatedRequest } from './auth';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each user/IP to 100 requests per windowMs
  keyGenerator: (req) => {
    const authReq = req as AuthenticatedRequest;
    return authReq.user?.uid || req.ip || 'unknown';
  },
  message: {
    error: 'Too many requests, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
