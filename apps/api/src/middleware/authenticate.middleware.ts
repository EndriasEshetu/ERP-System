import { Request, Response, NextFunction } from 'express';
import { AuthUserDto } from '@erp/shared';
import { extractSessionToken } from '../modules/auth/auth.cookie.js';
import { authService } from '../modules/auth/auth.service.js';

// Extend Express Request with authenticated user and session context
declare global {
  namespace Express {
    interface Request {
      user?: AuthUserDto;
      sessionId?: string;
    }
  }
}

/**
 * Authentication Middleware
 * Resolves session token from HTTP-only cookie (or Bearer header), validates against database,
 * and attaches authenticated user context to the request.
 * Does not block unauthenticated requests; downstream route handlers or requireAuth guard as needed.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const rawToken = extractSessionToken(req);

    if (!rawToken) {
      return next();
    }

    const sessionData = await authService.validateSession(rawToken);

    if (sessionData) {
      req.user = sessionData.user;
      req.sessionId = sessionData.sessionId;
      // Synchronize multi-tenant context userId with authenticated user ID
      req.userId = sessionData.user.id;
    }

    next();
  } catch (error) {
    next(error);
  }
}
