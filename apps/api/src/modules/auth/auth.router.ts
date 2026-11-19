import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authRateLimiter } from './auth.limiter.js';
import { validateBody, registerSchema, loginSchema } from './auth.validation.js';

export const authRouter = Router();

// Public Authentication Endpoints (Protected by Rate Limiter)
authRouter.post('/register', authRateLimiter, validateBody(registerSchema), authController.register);
authRouter.post('/login', authRateLimiter, validateBody(loginSchema), authController.login);
authRouter.post('/logout', authController.logout);
