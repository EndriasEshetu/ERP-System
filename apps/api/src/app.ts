import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ApiErrorResponse, HTTP_STATUS } from '@erp/shared';
import { env } from './config/env.config.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { healthRouter } from './modules/health/health.router.js';

export function createApp(): Express {
  const app = express();

  // Security headers & CORS
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  // Body parsers with size limit
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(requestLogger);

  // API Routes
  app.use(`${env.API_PREFIX}/health`, healthRouter);

  // 404 Not Found Handler
  app.use((req: Request, res: Response<ApiErrorResponse>) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: `Endpoint ${req.method} ${req.originalUrl} not found`,
      errors: [
        {
          message: 'Resource not found',
          code: 'NOT_FOUND',
        },
      ],
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

