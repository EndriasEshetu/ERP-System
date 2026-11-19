import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../shared/errors/app-error.js';

/**
 * Route guard middleware that strictly requires an authenticated user session.
 * Rejects unauthenticated requests with HTTP 401 Unauthorized.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required to access this resource', 'UNAUTHORIZED');
  }

  next();
}
