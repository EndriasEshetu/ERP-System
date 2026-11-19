import { Request, Response, NextFunction } from 'express';
import { ApiResponse, AuthResponseData, SessionsResponseData, HTTP_STATUS } from '@erp/shared';
import { authService } from './auth.service.js';
import { setSessionCookie, clearSessionCookie, extractSessionToken } from './auth.cookie.js';
import { RegisterInput, LoginInput } from './auth.validation.js';
import { NotFoundError, UnauthorizedError } from '../../shared/errors/app-error.js';

export class AuthController {
  /**
   * Registers a new user account, creates an active session, and sets an HTTP-only cookie.
   */
  async register(
    req: Request<unknown, unknown, RegisterInput>,
    res: Response<ApiResponse<AuthResponseData>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const clientMetadata = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.socket.remoteAddress,
      };

      const { user, session } = await authService.register(req.body, clientMetadata);

      // Set secure HTTP-only session cookie
      setSessionCookie(res, session.rawToken, session.expiresAt);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'User registered successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticates user credentials, creates a server session, and sets an HTTP-only cookie.
   */
  async login(
    req: Request<unknown, unknown, LoginInput>,
    res: Response<ApiResponse<AuthResponseData>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const clientMetadata = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.socket.remoteAddress,
      };

      const { user, session } = await authService.login(req.body, clientMetadata);

      // Set secure HTTP-only session cookie
      setSessionCookie(res, session.rawToken, session.expiresAt);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Login successful',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revokes the active session on the server and clears the session cookie from the client.
   */
  async logout(
    req: Request,
    res: Response<ApiResponse<null>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const rawToken = extractSessionToken(req);

      if (rawToken) {
        await authService.revokeSession(rawToken);
      }

      // Always clear the cookie even if session was already expired or missing
      clearSessionCookie(res);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Logged out successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves the currently authenticated user's profile.
   */
  async getCurrentUser(
    req: Request,
    res: Response<ApiResponse<AuthResponseData>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required', 'UNAUTHORIZED');
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Current user retrieved successfully',
        data: { user: req.user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists all active sessions for the authenticated user, identifying the calling session.
   */
  async getSessions(
    req: Request,
    res: Response<ApiResponse<SessionsResponseData>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required', 'UNAUTHORIZED');
      }

      const sessions = await authService.getUserActiveSessions(req.user.id, req.sessionId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Active sessions retrieved successfully',
        data: { sessions },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revokes a specific session belonging to the authenticated user.
   */
  async revokeSessionById(
    req: Request<{ id: string }>,
    res: Response<ApiResponse<null>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required', 'UNAUTHORIZED');
      }

      const sessionId = req.params.id;
      const revoked = await authService.revokeSessionById(req.user.id, sessionId);

      if (!revoked) {
        throw new NotFoundError('Session not found or already revoked', 'SESSION_NOT_FOUND');
      }

      // If the revoked session was the current caller's session, clear the cookie
      if (sessionId === req.sessionId) {
        clearSessionCookie(res);
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Session revoked successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
