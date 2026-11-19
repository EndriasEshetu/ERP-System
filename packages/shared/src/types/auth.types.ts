/**
 * User account status
 */
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

/**
 * Registration request payload DTO
 */
export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
}

/**
 * Login request payload DTO
 */
export interface LoginRequestDto {
  email: string;
  password: string;
}

/**
 * Safe authenticated user representation (never exposes passwordHash)
 */
export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: string | Date;
}

/**
 * Safe session representation for listing active sessions
 */
export interface SessionDto {
  id: string;
  userId: string;
  expiresAt: string | Date;
  createdAt: string | Date;
  lastActivityAt: string | Date;
  isCurrent?: boolean;
  userAgent?: string | null;
  ipAddress?: string | null;
}

/**
 * Auth response data envelope
 */
export interface AuthResponseData {
  user: AuthUserDto;
}
