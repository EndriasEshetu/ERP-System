import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authRateLimiter } from './auth.limiter.js';
import { validateBody, registerSchema, loginSchema } from './auth.validation.js';
import { requireAuth } from '../../middleware/requireAuth.middleware.js';

export const authRouter = Router();

// Public Authentication Endpoints (Protected by Rate Limiter)
authRouter.post('/register', authRateLimiter, validateBody(registerSchema), authController.register);
authRouter.post('/login', authRateLimiter, validateBody(loginSchema), authController.login);
authRouter.post('/logout', authController.logout);

// Protected Authentication & Session Management Endpoints
authRouter.get('/me', requireAuth, authController.getCurrentUser);
authRouter.get('/sessions', requireAuth, authController.getSessions);
authRouter.delete('/sessions/:id', requireAuth, authController.revokeSessionById);
