import crypto from 'crypto';
import { env } from '../../config/env.config.js';

export interface GeneratedSessionToken {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
}

/**
 * Generates a cryptographically secure random session token (256 bits entropy)
 * along with its SHA-256 hash to be persisted in the database.
 */
export function generateSessionToken(ttlHours: number = env.SESSION_TTL_HOURS): GeneratedSessionToken {
  // 32 cryptographically random bytes encoded as base64url
  const rawToken = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = calculateSessionExpiry(ttlHours);

  return {
    rawToken,
    tokenHash,
    expiresAt,
  };
}

/**
 * Computes the SHA-256 hex digest of a raw session token.
 * This ensures only the token hash is stored and queried in the database.
 */
export function hashSessionToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Calculates a future expiration Date based on configured session TTL.
 */
export function calculateSessionExpiry(ttlHours: number = env.SESSION_TTL_HOURS): Date {
  const ttlMs = ttlHours * 60 * 60 * 1000;
  return new Date(Date.now() + ttlMs);
}

/**
 * Checks if a given expiration timestamp has elapsed.
 */
export function isSessionExpired(expiresAt: Date | string): boolean {
  return new Date() > new Date(expiresAt);
}
