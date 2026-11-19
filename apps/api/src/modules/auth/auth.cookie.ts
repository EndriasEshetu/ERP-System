import { Request, Response, CookieOptions } from 'express';
import { env } from '../../config/env.config.js';

/**
 * Standard cookie configuration for server-managed sessions.
 */
export function getSessionCookieOptions(expiresAt?: Date): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  };
}

/**
 * Attaches the HTTP-only session cookie to the HTTP response.
 */
export function setSessionCookie(res: Response, rawToken: string, expiresAt: Date): void {
  const options = getSessionCookieOptions(expiresAt);
  res.cookie(env.SESSION_COOKIE_NAME, rawToken, options);
}

/**
 * Clears the HTTP-only session cookie upon logout or invalidation.
 */
export function clearSessionCookie(res: Response): void {
  res.clearCookie(env.SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Extracts raw session token from request cookies or Authorization Bearer header.
 */
export function extractSessionToken(req: Request): string | undefined {
  // Primary: HTTP-only cookie
  if (req.cookies && typeof req.cookies[env.SESSION_COOKIE_NAME] === 'string') {
    return req.cookies[env.SESSION_COOKIE_NAME];
  }

  // Secondary fallback: Authorization header (e.g. for API clients / automated testing)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return undefined;
}
