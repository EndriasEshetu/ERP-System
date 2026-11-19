import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse, HTTP_STATUS, HttpStatusCode } from '@erp/shared';
import { ZodError } from 'zod';
import { env } from '../config/env.config.js';
import { AppError } from '../shared/errors/app-error.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
): void {
  // Operational AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code.toUpperCase(),
    }));

    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
    return;
  }

  // Unexpected / Unhandled Error
  const isDev = env.isDevelopment;
  const message = isDev ? err.message : 'An unexpected error occurred';
  const statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;

  if (isDev) {
    console.error('[UNHANDLED_ERROR]:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: [
      {
        message: isDev ? err.message : 'Internal Server Error',
        code: (err as { code?: string }).code || 'INTERNAL_ERROR',
      },
    ],
  });
}
