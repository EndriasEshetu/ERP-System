import { Request, Response, NextFunction } from 'express';
import { ApiResponse, AuthResponseData, HTTP_STATUS } from '@erp/shared';
import { authService } from './auth.service.js';
import { setSessionCookie, clearSessionCookie, extractSessionToken } from './auth.cookie.js';
import { RegisterInput, LoginInput } from './auth.validation.js';

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
}

export const authController = new AuthController();
