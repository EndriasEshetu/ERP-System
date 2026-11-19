import rateLimit from 'express-rate-limit';
import { HTTP_STATUS } from '@erp/shared';

/**
 * Rate limiter for sensitive authentication endpoints (login, registration)
 * to prevent brute-force attacks and credential stuffing.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 25, // Limit each IP to 25 requests per window
  standardHeaders: true, // Draft-6 RateLimit headers
  legacyHeaders: false, // Disable X-RateLimit headers
  handler: (_req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
      errors: [
        {
          message: 'Rate limit exceeded for authentication requests',
          code: 'TOO_MANY_REQUESTS',
        },
      ],
    });
  },
});
