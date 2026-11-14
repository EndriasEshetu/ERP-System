import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse, HTTP_STATUS } from '@erp/shared';
import { env } from '../config/env.config.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
): void {
  const isDev = env.isDevelopment;
  const message = err.message || 'Internal Server Error';

  const response: ApiErrorResponse = {
    success: false,
    message: isDev ? message : 'An unexpected error occurred',
    errors: [
      {
        message: err.message,
        code: (err as { code?: string }).code || 'INTERNAL_ERROR',
      },
    ],
  };

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
}

