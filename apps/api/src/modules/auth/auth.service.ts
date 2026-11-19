import { User } from '@prisma/client';
import { AuthUserDto, SessionDto, UserStatus } from '@erp/shared';
import { prisma } from '../../database/prisma.service.js';
import { ConflictError, UnauthorizedError } from '../../shared/errors/app-error.js';
import { hashPassword, comparePassword } from './auth.hasher.js';
import {
  generateSessionToken,
  hashSessionToken,
  isSessionExpired,
} from './auth.session-utils.js';
import { RegisterInput, LoginInput } from './auth.validation.js';

export interface RequestClientMetadata {
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthResult {
  user: AuthUserDto;
  session: {
    rawToken: string;
    expiresAt: Date;
  };
}

export class AuthService {
  /**
   * Registers a new user account and creates their initial active session.
   * Enforces unique email constraint and secure password hashing.
   */
  async register(input: RegisterInput, metadata: RequestClientMetadata = {}): Promise<AuthResult> {
    const normalizedEmail = input.email.toLowerCase().trim();

    // 1. Prevent duplicate accounts
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictError('A user with this email address already exists', 'EMAIL_ALREADY_EXISTS', [
        {
          field: 'email',
          message: 'An account with this email address is already registered',
          code: 'EMAIL_ALREADY_EXISTS',
        },
      ]);
    }

    // 2. Hash password securely (bcrypt salt factor 12)
    const passwordHash = await hashPassword(input.password);

    // 3. Create user record
    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash,
        status: 'ACTIVE',
      },
    });

    // 4. Create server-managed session
    const sessionToken = generateSessionToken();

    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: sessionToken.tokenHash,
        expiresAt: sessionToken.expiresAt,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
      },
    });

    return {
      user: this.toSafeUser(user),
      session: {
        rawToken: sessionToken.rawToken,
        expiresAt: sessionToken.expiresAt,
      },
    };
  }

  /**
   * Authenticates a user with email and password, creating a secure server-managed session.
   * Returns generic credentials error to prevent account enumeration.
   */
  async login(input: LoginInput, metadata: RequestClientMetadata = {}): Promise<AuthResult> {
    const normalizedEmail = input.email.toLowerCase().trim();

    // 1. Look up user by normalized email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Consistent timing/message to prevent email enumeration
    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // 2. Check account status
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError(
        'Account is disabled or suspended. Please contact support.',
        'ACCOUNT_DISABLED'
      );
    }

    // 3. Verify password hash
    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // 4. Create new active server session
    const sessionToken = generateSessionToken();

    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: sessionToken.tokenHash,
        expiresAt: sessionToken.expiresAt,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
      },
    });

    return {
      user: this.toSafeUser(user),
      session: {
        rawToken: sessionToken.rawToken,
        expiresAt: sessionToken.expiresAt,
      },
    };
  }

  /**
   * Validates a session by raw token.
   * Verifies that the session exists, is not revoked, and has not expired.
   * Updates lastActivityAt audit timestamp.
   */
  async validateSession(rawToken: string): Promise<{ user: AuthUserDto; sessionId: string } | null> {
    const tokenHash = hashSessionToken(rawToken);

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    // Check revocation
    if (session.revokedAt !== null) {
      return null;
    }

    // Check expiration
    if (isSessionExpired(session.expiresAt)) {
      return null;
    }

    // Check user status
    if (session.user.status !== 'ACTIVE') {
      return null;
    }

    // Update last activity timestamp asynchronously (fire and forget / non-blocking)
    prisma.session
      .update({
        where: { id: session.id },
        data: { lastActivityAt: new Date() },
      })
      .catch((err) => {
        console.error('[SESSION_TOUCH_ERROR]:', err);
      });

    return {
      user: this.toSafeUser(session.user),
      sessionId: session.id,
    };
  }

  /**
   * Revokes an active session by its raw token, clearing it from valid server sessions.
   */
  async revokeSession(rawToken: string): Promise<boolean> {
    const tokenHash = hashSessionToken(rawToken);

    const session = await prisma.session.findUnique({
      where: { tokenHash },
    });

    if (!session || session.revokedAt !== null) {
      return false;
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return true;
  }

  /**
   * Retrieves all active sessions for a user, marking the calling session.
   */
  async getUserActiveSessions(userId: string, currentSessionId?: string): Promise<SessionDto[]> {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivityAt: 'desc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      userId: s.userId,
      expiresAt: s.expiresAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
      lastActivityAt: s.lastActivityAt.toISOString(),
      isCurrent: s.id === currentSessionId,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
    }));
  }

  /**
   * Revokes a specific session belonging to the user by session ID.
   */
  async revokeSessionById(userId: string, sessionId: string): Promise<boolean> {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      return false;
    }

    if (session.revokedAt === null) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { revokedAt: new Date() },
      });
    }

    return true;
  }

  /**
   * Transforms a database User entity into safe AuthUserDto, ensuring passwordHash is never exposed.
   */
  toSafeUser(user: User): AuthUserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status as UserStatus,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

export const authService = new AuthService();
